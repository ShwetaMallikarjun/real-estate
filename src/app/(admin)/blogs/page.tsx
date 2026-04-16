"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

interface Blog {
  id: string;
  title: string;
  slug: string;
  author: string;
  publishedAt: string | null;
  createdAt: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const res = await fetch(`/api/blogs?${params}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setBlogs(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/blogs/${deleteId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setDeleteId(null);
      fetchBlogs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setDeleting(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    fetchBlogs();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="text-gray-500">Kelola artikel blog</p>
        </div>
        <Link href="/blogs/create">
          <Button>
            <Plus className="h-4 w-4" />
            Tambah Artikel
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Cari artikel..."
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
      ) : blogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Tidak ada artikel ditemukan
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daftar Artikel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Judul</th>
                    <th className="hidden pb-3 font-medium md:table-cell">
                      Penulis
                    </th>
                    <th className="hidden pb-3 font-medium lg:table-cell">
                      Dipublikasi
                    </th>
                    <th className="pb-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {blogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50">
                      <td className="py-3">
                        <div>
                          <p className="font-medium">{blog.title}</p>
                          <p className="text-xs text-gray-500">{blog.slug}</p>
                        </div>
                      </td>
                      <td className="hidden py-3 md:table-cell">
                        {blog.author}
                      </td>
                      <td className="hidden py-3 lg:table-cell">
                        {blog.publishedAt
                          ? formatDate(blog.publishedAt)
                          : "Draft"}
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1">
                          <Link href={`/blogs/${blog.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(blog.id)}
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
        title="Hapus Artikel"
      >
        <p className="mb-4 text-sm text-gray-600">
          Apakah Anda yakin ingin menghapus artikel ini?
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
