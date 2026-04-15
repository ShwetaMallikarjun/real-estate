"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  _count?: { properties: number };
  user?: { name: string; email: string };
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAgents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agents");
      const json = await res.json();
      if (!json.success) throw new Error(json.message);
      setAgents(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/agents/${deleteId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setDeleteId(null);
      fetchAgents();
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
          <h1 className="text-3xl font-bold">Agen</h1>
          <p className="text-gray-500">Kelola daftar agen properti</p>
        </div>
        <Link href="/agents/create">
          <Button>
            <Plus className="h-4 w-4" />
            Tambah Agen
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
      ) : agents.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            Belum ada agen terdaftar
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Daftar Agen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 font-medium">Nama</th>
                    <th className="hidden pb-3 font-medium md:table-cell">
                      Email
                    </th>
                    <th className="hidden pb-3 font-medium lg:table-cell">
                      Telepon
                    </th>
                    <th className="pb-3 font-medium">Properti</th>
                    <th className="pb-3 text-right font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {agents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-gray-50">
                      <td className="py-3 font-medium">{agent.name}</td>
                      <td className="hidden py-3 md:table-cell">
                        {agent.email}
                      </td>
                      <td className="hidden py-3 lg:table-cell">
                        {agent.phone}
                      </td>
                      <td className="py-3">
                        <Badge variant="secondary">
                          {agent._count?.properties ?? 0}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-1">
                          <Link href={`/agents/${agent.id}/edit`}>
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(agent.id)}
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
        title="Hapus Agen"
      >
        <p className="mb-4 text-sm text-gray-600">
          Apakah Anda yakin ingin menghapus agen ini? Semua properti terkait
          juga akan terhapus.
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
