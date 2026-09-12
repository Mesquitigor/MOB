import { databaseConfigured } from "@/lib/env";

export type AuthState = {
  error?: string;
  message?: string;
  resetLink?: string;
};

export function envConfigError(): AuthState | null {
  if (!process.env.AUTH_SECRET) {
    return { error: "AUTH_SECRET não está definido. Inclua essa variável na Vercel e faça um novo deploy." };
  }
  if (!databaseConfigured()) {
    return {
      error:
        "O cadastro precisa de um PostgreSQL. Na Vercel, crie um banco em Storage e conecte ao projeto (DATABASE_URL).",
    };
  }
  return null;
}

function isRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

export function asAuthError(error: unknown): AuthState {
  if (isRedirectError(error)) throw error;
  console.error(error);
  if (error instanceof Error && error.message === "DATABASE_URL_MISSING") {
    return envConfigError() ?? {
      error: "O cadastro precisa de um PostgreSQL. Configure DATABASE_URL na Vercel.",
    };
  }
  return { error: "Não foi possível concluir agora. Tente de novo em instantes." };
}
