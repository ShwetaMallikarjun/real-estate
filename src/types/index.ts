import type { Session } from "next-auth";

// ─── Enums ───────────────────────────────────────────────

export type PropertyStatus = "DIJUAL" | "DISEWA";
export type PropertyJenis = "APARTEMEN" | "RUMAH" | "LAINNYA";
export type LocationType = "PROVINSI" | "KOTA" | "KECAMATAN";
export type UserRole = "ADMIN" | "AGENT";

// ─── NextAuth Type Extensions ────────────────────────────

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    role: UserRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}

// ─── Property Filter ─────────────────────────────────────

export interface PropertyFilter {
  search?: string;
  status?: PropertyStatus;
  jenis?: PropertyJenis;
  locationId?: string;
  minPrice?: number;
  maxPrice?: number;
  minLuas?: number;
  maxLuas?: number;
  kamarTidur?: number;
  sort?: string;
  page?: number;
  limit?: number;
}

// ─── API Response ────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Re-export Session type for convenience
export type { Session };
