"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Developer {
  id: string;
  name: string;
  deskripsi: string;
  alamat: string;
  createdAt: string;
}

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDevelopers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/developers");
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setDevelopers(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevelopers();
  }, [fetchDevelopers]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/developers/${deleteId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setDeleteId(null);
      fetchDevelopers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Developer</h1>
          <p className="text-gray-500">Kelola daftar developer</p>
        </div>
        <Link href="/developers/create">
          <Button>
            <Plus className="h-4 w-4" />
            Tambah Developer
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : developers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Belum ada developer terdaftar
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daftar Developer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Nama</th>
                    <th className="hidden pb-3 font-medium md:table-cell">
                      Alamat
                    </th>
                    <th className="hidden pb-3 font-medium lg:table-cell">
                      Deskripsi
                    </th>
                    <th className="pb-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {developers.map((dev) => (
                    <tr key={dev.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium">{dev.name}</td>
                      <td className="hidden py-3 md:table-cell">
                        {dev.alamat || "-"}
                      </td>
                      <td className="hidden max-w-xs truncate py-3 lg:table-cell">
                        {dev.deskripsi || "-"}
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1">
                          <Link href={`/developers/${dev.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(dev.id)}
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

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Hapus Developer"
      >
        <p className="mb-4 text-sm text-gray-600">
          Apakah Anda yakin ingin menghapus developer ini?
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
