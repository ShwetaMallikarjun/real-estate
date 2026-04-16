import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";
import slugify from "slugify";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd MMMM yyyy");
}

export function generatePropertyId(
  jenis: "APARTEMEN" | "RUMAH" | "LAINNYA",
  status: "DIJUAL" | "DISEWA",
  sequence: number
): string {
  const jenisMap: Record<string, string> = {
    APARTEMEN: "APR",
    RUMAH: "RMH",
    LAINNYA: "LNY",
  };

  const statusMap: Record<string, string> = {
    DIJUAL: "J",
    DISEWA: "S",
  };

  const prefix = jenisMap[jenis];
  const statusCode = statusMap[status];
  const number = String(sequence).padStart(6, "0");

  return `${prefix}-${statusCode}-${number}`;
}

export function generateSlug(title: string): string {
  return slugify(title, { lower: true, strict: true });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}
