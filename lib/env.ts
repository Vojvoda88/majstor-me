/**
 * Environment variable validation for deployment.
 * Server-only - never import in client components.
 */

export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getOptionalEnv(key: string, defaultValue = ""): string {
  return process.env[key] ?? defaultValue;
}

/** Vars that MUST be set for app to run */
export const REQUIRED_ENV = ["DATABASE_URL", "NEXTAUTH_URL", "NEXTAUTH_SECRET"] as const;

/** Vars that are optional (app works without them) */
export const OPTIONAL_ENV = ["DIRECT_DATABASE_URL", "RESEND_API_KEY", "EMAIL_FROM"] as const;
