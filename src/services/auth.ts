// Lunorsoft — Authentication service abstraction.
//
// UI components MUST call these functions instead of embedding fetch/auth logic.
// They map 1:1 to the backend contract:
//
//   POST /api/auth/register
//   POST /api/auth/login
//   POST /api/auth/logout
//   GET  /api/auth/me
//
// Session mechanism: httpOnly session cookie set by the API. The browser
// never sees tokens; `getCurrentUser()` simply asks the backend who we are.

import { apiGet, apiPost } from "@/lib/api-client";
import type { AuthResponse, LoginInput, RegisterInput, User } from "@/types/auth";

export async function login(input: LoginInput): Promise<User> {
  const res = await apiPost<AuthResponse>("/api/auth/login", {
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });
  return res.user;
}

export async function register(input: RegisterInput): Promise<User> {
  const res = await apiPost<AuthResponse>("/api/auth/register", {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });
  return res.user;
}

export async function logout(): Promise<void> {
  await apiPost("/api/auth/logout");
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const res = await apiGet<AuthResponse>("/api/auth/me");
    return res.user;
  } catch {
    return null;
  }
}
