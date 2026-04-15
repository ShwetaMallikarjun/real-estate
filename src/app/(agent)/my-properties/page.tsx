"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

interface Property {
  id: string;
  title: string;
  propertyId: string;
  harga_asli: string;
  status: string;
  jenis: string;
  location: { name: string } | null;
  createdAt: string;
}

export default function MyPropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/properties?${params}`);
      const json = await res.json();

      if (!json.success) throw new Error(json.message);

      setProperties(json.data);
      setTotalPages(json.pagination?.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/properties/${deleteId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setDeleteId(null);
      fetchProperties();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setDeleting(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchProperties();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Properti Saya</h1>
          <p className="text-gray-500">Kelola properti Anda</p>
        </div>
        <Link href="/my-properties/create">
          <Button>
            <Plus className="h-4 w-4" />
            Tambah Properti
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari properti..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" variant="secondary">
          Cari
        </Button>
      </form>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Tidak ada properti ditemukan
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daftar Properti</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Judul</th>
                    <th className="pb-3 font-medium">Harga</th>
                    <th className="hidden pb-3 font-medium md:table-cell">
                      Status
                    </th>
                    <th className="hidden pb-3 font-medium lg:table-cell">
                      Lokasi
                    </th>
                    <th className="pb-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {properties.map((property) => (
                    <tr key={property.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{property.title}</p>
                          <p className="text-xs text-gray-500">
                            {property.propertyId}
                          </p>
                        </div>
                      </td>
                      <td className="py-3">
                        {formatCurrency(Number(property.harga_asli))}
                      </td>
                      <td className="hidden py-3 md:table-cell">
                        <div className="flex gap-1">
                          <Badge
                            variant={
                              property.status === "DIJUAL"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {property.status}
                          </Badge>
                          <Badge variant="outline">{property.jenis}</Badge>
                        </div>
                      </td>
                      <td className="hidden py-3 lg:table-cell">
                        {property.location?.name || "-"}
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1">
                          <Link href={`/my-properties/${property.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(property.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Hapus Properti"
      >
        <p className="mb-4 text-sm text-gray-600">
          Apakah Anda yakin ingin menghapus properti ini? Tindakan ini tidak
          dapat dibatalkan.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteId(null)}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? <Spinner size="sm" /> : "Hapus"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
