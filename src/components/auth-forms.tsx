"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/actions/auth";
import {
  changePasswordAction,
  forgotPasswordAction,
  loginAction,
  registerAction,
  resetPasswordAction,
  updateProfileAction,
} from "@/actions/auth";

function Alert({ state }: { state: AuthState }) {
  if (state.error) {
    return (
      <p role="alert" className="rounded-2xl bg-red-50 px-3 py-2 text-sm text-stamp-red">
        {state.error}
      </p>
    );
  }
  if (state.message) {
    return (
      <div className="space-y-2 rounded-2xl bg-teal/10 px-3 py-2 text-sm text-teal-dark">
        <p>{state.message}</p>
        {state.resetLink ? (
          <p>
            <a className="break-all underline" href={state.resetLink}>
              {state.resetLink}
            </a>
          </p>
        ) : null}
      </div>
    );
  }
  return null;
}

const field = "block";
const label = "mb-1 block text-sm font-medium";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, {});
  return (
    <form action={action} className="space-y-4">
      <Alert state={state} />
      <label className={field}>
        <span className={label}>E-mail</span>
        <input name="email" type="text" autoComplete="username" className="input" required />
      </label>
      <label className={field}>
        <span className={label}>Senha</span>
        <input name="password" type="password" autoComplete="current-password" className="input" required />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input name="remember" type="checkbox" className="check" />
        Lembrar de mim neste dispositivo
      </label>
      <button type="submit" className="btn-pink w-full" disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </button>
      <p className="text-center text-sm text-muted">
        <Link href="/recuperar-senha" className="text-teal-dark underline-offset-4 hover:underline">
          Esqueci a senha
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, {});
  return (
    <form action={action} className="space-y-4">
      <Alert state={state} />
      <label className={field}>
        <span className={label}>Nome</span>
        <input name="name" type="text" autoComplete="name" className="input" required />
      </label>
      <label className={field}>
        <span className={label}>E-mail</span>
        <input name="email" type="text" autoComplete="email" className="input" required />
      </label>
      <label className={field}>
        <span className={label}>Senha</span>
        <input name="password" type="password" autoComplete="new-password" className="input" required />
      </label>
      <button type="submit" className="btn-pink w-full" disabled={pending}>
        {pending ? "Criando..." : "Criar conta"}
      </button>
    </form>
  );
}

export function ForgotForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, {});
  return (
    <form action={action} className="space-y-4">
      <Alert state={state} />
      <label className={field}>
        <span className={label}>E-mail cadastrado</span>
        <input name="email" type="text" autoComplete="email" className="input" required />
      </label>
      <button type="submit" className="btn-pink w-full" disabled={pending}>
        {pending ? "Enviando..." : "Pedir nova senha"}
      </button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, {});
  return (
    <form action={action} className="space-y-4">
      <Alert state={state} />
      <input type="hidden" name="token" value={token} />
      <label className={field}>
        <span className={label}>Nova senha</span>
        <input name="password" type="password" autoComplete="new-password" className="input" required />
      </label>
      <button type="submit" className="btn-pink w-full" disabled={pending}>
        {pending ? "Salvando..." : "Redefinir senha"}
      </button>
    </form>
  );
}

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, {});
  return (
    <form action={action} className="space-y-4">
      <Alert state={state} />
      <label className={field}>
        <span className={label}>Nome</span>
        <input name="name" type="text" defaultValue={name} className="input" required />
      </label>
      <label className={field}>
        <span className={label}>E-mail</span>
        <input name="email" type="text" defaultValue={email} className="input" required />
      </label>
      <button type="submit" className="btn-pink" disabled={pending}>
        {pending ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}

export function PasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, {});
  return (
    <form action={action} className="space-y-4">
      <Alert state={state} />
      <label className={field}>
        <span className={label}>Senha atual</span>
        <input name="currentPassword" type="password" className="input" required />
      </label>
      <label className={field}>
        <span className={label}>Nova senha</span>
        <input name="password" type="password" autoComplete="new-password" className="input" required />
      </label>
      <button type="submit" className="btn-pink" disabled={pending}>
        {pending ? "Salvando..." : "Alterar senha"}
      </button>
    </form>
  );
}
