import { auth } from "./auth";
import type { Session, UserRole } from "@/types";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized: You must be logged in");
  }
  return user;
}

export async function requireRole(role: UserRole) {
  const user = await requireAuth();
  if (user.role !== role) {
    throw new Error(`Forbidden: ${role} role required`);
  }
  return user;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}

export function isAdmin(session: Session | null): boolean {
  return session?.user?.role === "ADMIN";
}

export function isAgent(session: Session | null): boolean {
  return session?.user?.role === "AGENT";
}
