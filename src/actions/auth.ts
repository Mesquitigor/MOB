"use server";

import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/db";
import { emailAllowed } from "@/lib/env";
import { canSendEmail, sendMail, appUrl } from "@/lib/email";
import { createResetToken, hashPassword, hashToken, verifyPassword } from "@/lib/password";
import { asAuthError, envConfigError, type AuthState } from "@/lib/safe-action";
import { clearSessionCookie, createSessionToken, getSession, setSessionCookie } from "@/lib/session";

export type { AuthState };

function asText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function registerAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const configError = await envConfigError();
  if (configError) return configError;

  const name = asText(formData.get("name"));
  const email = asText(formData.get("email"));
  const password = asText(formData.get("password"));

  if (!name || !email || !password) {
    return { error: "Preencha nome, e-mail e senha." };
  }

  if (!emailAllowed(email)) {
    return { error: "Este e-mail não está liberado. Peça o convite a quem administra o app." };
  }

  try {
    const prisma = getPrisma();
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return { error: "Já existe uma conta com este e-mail." };
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: await hashPassword(password),
      },
    });

    const token = await createSessionToken(user, false);
    await setSessionCookie(token, false);
  } catch (error) {
    return asAuthError(error);
  }

  redirect("/diario");
}

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const configError = await envConfigError();
  if (configError) return configError;

  const email = asText(formData.get("email"));
  const password = asText(formData.get("password"));
  const remember = asText(formData.get("remember")) === "on";

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  if (!emailAllowed(email)) {
    return { error: "Este e-mail não tem mais acesso." };
  }

  try {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return { error: "E-mail ou senha inválidos." };
    }

    const token = await createSessionToken(user, remember);
    await setSessionCookie(token, remember);
  } catch (error) {
    return asAuthError(error);
  }

  redirect("/diario");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/entrar");
}

export async function forgotPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const configError = await envConfigError();
  if (configError) return configError;

  const email = asText(formData.get("email"));
  if (!email) return { error: "Informe o e-mail cadastrado." };

  try {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { email } });
    const generic = "Se este e-mail estiver cadastrado, você poderá redefinir a senha.";

    if (!user || !emailAllowed(user.email)) {
      return { message: generic };
    }

    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, expiresAt: { lt: new Date() } },
    });

    const { token, tokenHash } = createResetToken();
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      },
    });

    const resetLink = `${await appUrl()}/redefinir-senha?token=${token}`;

    if (canSendEmail()) {
      await sendMail({
        to: user.email,
        subject: "Redefinir senha · MOB",
        text: `Para criar uma nova senha, abra: ${resetLink}`,
        html: `<p>Para criar uma nova senha, abra o link abaixo (válido por 1 hora):</p><p><a href="${resetLink}">${resetLink}</a></p>`,
      });
      return { message: generic };
    }

    return {
      message: "O envio de e-mail ainda não está configurado neste ambiente. Use o link abaixo para redefinir a senha.",
      resetLink,
    };
  } catch (error) {
    return asAuthError(error);
  }
}

export async function resetPasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const configError = await envConfigError();
  if (configError) return configError;

  const token = asText(formData.get("token"));
  const password = asText(formData.get("password"));

  if (!token || !password) {
    return { error: "Informe a nova senha." };
  }

  try {
    const prisma = getPrisma();
    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(token) },
      include: { user: true },
    });

    if (!record || record.expiresAt < new Date()) {
      return { error: "Este link expirou. Peça um novo." };
    }

    if (!emailAllowed(record.user.email)) {
      return { error: "Este e-mail não tem mais acesso." };
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash: await hashPassword(password) },
      }),
      prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
    ]);

    const session = await createSessionToken(record.user, false);
    await setSessionCookie(session, false);
  } catch (error) {
    return asAuthError(error);
  }

  redirect("/diario");
}

export async function updateProfileAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const session = await getSession();
  if (!session) redirect("/entrar");

  const name = asText(formData.get("name"));
  const email = asText(formData.get("email"));
  if (!name || !email) return { error: "Nome e e-mail são obrigatórios." };
  if (!emailAllowed(email)) {
    return { error: "Este e-mail não está liberado. Peça o convite a quem administra o app." };
  }

  try {
    const prisma = getPrisma();
    const clash = await prisma.user.findFirst({
      where: { email, id: { not: session.id } },
    });
    if (clash) return { error: "Este e-mail já está em uso." };

    const user = await prisma.user.update({
      where: { id: session.id },
      data: { name, email },
    });
    const token = await createSessionToken(user, true);
    await setSessionCookie(token, true);
    return { message: "Dados atualizados." };
  } catch (error) {
    return asAuthError(error);
  }
}

export async function changePasswordAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const session = await getSession();
  if (!session) redirect("/entrar");

  const current = asText(formData.get("currentPassword"));
  const next = asText(formData.get("password"));
  if (!current || !next) return { error: "Preencha a senha atual e a nova." };

  try {
    const prisma = getPrisma();
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user || !(await verifyPassword(current, user.passwordHash))) {
      return { error: "Senha atual incorreta." };
    }

    await prisma.user.update({
      where: { id: session.id },
      data: { passwordHash: await hashPassword(next) },
    });
    return { message: "Senha alterada." };
  } catch (error) {
    return asAuthError(error);
  }
}
