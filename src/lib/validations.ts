import { z } from "zod";

// ─── Auth Schemas ────────────────────────────────────────

export const loginSchema = z.object({
  email: z.email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  role: z.enum(["ADMIN", "AGENT"]),
});

// ─── Property Schema ─────────────────────────────────────

export const propertySchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  harga_asli: z.number().positive("Harga harus lebih dari 0"),
  harga_diskon: z.number().positive("Harga diskon harus lebih dari 0").optional(),
  status: z.enum(["DIJUAL", "DISEWA"]),
  jenis: z.enum(["APARTEMEN", "RUMAH", "LAINNYA"]),
  luasBangunan: z.number().positive("Luas bangunan harus lebih dari 0"),
  luasTanah: z.number().positive("Luas tanah harus lebih dari 0"),
  furnitur: z.string().optional(),
  kamarTidur: z.number().int().min(0, "Kamar tidur tidak boleh negatif"),
  kamarART: z.number().int().min(0).optional(),
  kamarMandi: z.number().int().min(0, "Kamar mandi tidak boleh negatif"),
  kamarMandiART: z.number().int().min(0).optional(),
  garasi: z.number().int().min(0).optional(),
  listrik: z.number().positive("Listrik harus lebih dari 0"),
  air: z.string().min(1, "Air harus diisi"),
  sertifikat: z.string().min(1, "Sertifikat harus diisi"),
  tahunPembuatan: z.number().int().min(1900).max(new Date().getFullYear()),
  deskripsi: z.string().min(1, "Deskripsi harus diisi"),
  fasilitas: z.array(z.string()).optional(),
  locationId: z.string().min(1, "Lokasi harus dipilih"),
  maps: z.string().optional(),
  agentId: z.string().min(1, "Agent harus dipilih"),
  developerId: z.string().optional(),
  gallery: z.array(z.string()).optional(),
});

// ─── Agent Schema ────────────────────────────────────────

export const agentSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.email("Email tidak valid"),
  phone: z.string().min(1, "Nomor telepon harus diisi"),
  whatsapp: z.string().optional(),
  tentang: z.string().optional(),
});

// ─── Developer Schema ────────────────────────────────────

export const developerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  deskripsi: z.string().optional(),
  alamat: z.string().optional(),
});

// ─── Location Schema ─────────────────────────────────────

export const locationSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  type: z.enum(["PROVINSI", "KOTA", "KECAMATAN"]),
  parentId: z.string().optional(),
});

// ─── Blog Schema ─────────────────────────────────────────

export const blogSchema = z.object({
  title: z.string().min(3, "Judul minimal 3 karakter"),
  content: z.string().min(10, "Konten minimal 10 karakter"),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  author: z.string().min(2, "Penulis minimal 2 karakter"),
});

// ─── Review Schema ───────────────────────────────────────

export const reviewSchema = z.object({
  propertyId: z.string().min(1, "Property harus dipilih"),
  youtubeUrl: z.url("URL YouTube tidak valid"),
  title: z.string().min(3, "Judul minimal 3 karakter"),
  description: z.string().optional(),
});

// ─── Inferred Types ──────────────────────────────────────

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type PropertyInput = z.infer<typeof propertySchema>;
export type AgentInput = z.infer<typeof agentSchema>;
export type DeveloperInput = z.infer<typeof developerSchema>;
export type LocationInput = z.infer<typeof locationSchema>;
export type BlogInput = z.infer<typeof blogSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
