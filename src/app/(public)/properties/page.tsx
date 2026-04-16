"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Home, SlidersHorizontal } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Property {
  id: string;
  title: string;
  harga_asli: string;
  harga_diskon: string | null;
  status: string;
  jenis: string;
  kamarTidur: number;
  kamarMandi: number;
  luasBangunan: number;
  luasTanah: number;
  gallery: string[];
  location?: { name: string };
  agent?: { name: string };
}

export default function PropertiesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [jenis, setJenis] = useState(searchParams.get("jenis") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (jenis) params.set("jenis", jenis);
    if (sort) params.set("sort", sort);
    params.set("page", page.toString());
    params.set("limit", "12");

    const res = await fetch(`/api/properties?${params}`);
    const data = await res.json();
    if (data.success) {
      setProperties(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
    }
    setLoading(false);
  }, [search, status, jenis, sort, page]);

  useEffect(() => { fetchProperties(); }, [fetchProperties]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Daftar Properti</h1>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari properti..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
            <SlidersHorizontal className="w-5 h-5" /> Filter
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2">
              <option value="">Semua Status</option>
              <option value="DIJUAL">Dijual</option>
              <option value="DISEWA">Disewa</option>
            </select>
            <select value={jenis} onChange={(e) => { setJenis(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2">
              <option value="">Semua Jenis</option>
              <option value="APARTEMEN">Apartemen</option>
              <option value="RUMAH">Rumah</option>
              <option value="LAINNYA">Lainnya</option>
            </select>
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className="border rounded-lg px-3 py-2">
              <option value="newest">Terbaru</option>
              <option value="price_asc">Harga Terendah</option>
              <option value="price_desc">Harga Tertinggi</option>
            </select>
          </div>
        )}
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-72 animate-pulse" />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Home className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-xl">Tidak ada properti ditemukan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((p) => (
            <Link key={p.id} href={`/properties/${p.id}`} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {p.gallery && p.gallery.length > 0 ? (
                  <img src={p.gallery[0]} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <Home className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold truncate">{p.title}</h3>
                <p className="text-blue-600 font-bold">{formatCurrency(Number(p.harga_diskon || p.harga_asli))}</p>
                {p.harga_diskon && (
                  <p className="text-sm text-gray-400 line-through">{formatCurrency(Number(p.harga_asli))}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">{p.location?.name}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-600">
                  <span>{p.kamarTidur} KT</span>
                  <span>{p.kamarMandi} KM</span>
                  <span>{p.luasBangunan} m²</span>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{p.status}</span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{p.jenis}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="px-4 py-2 border rounded-lg disabled:opacity-50">Prev</button>
          <span className="px-4 py-2">Halaman {page} dari {totalPages}</span>
          <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="px-4 py-2 border rounded-lg disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
