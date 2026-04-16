"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { locationSchema, type LocationInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Pencil,
  ChevronRight,
  MapPin,
} from "lucide-react";

interface Location {
  id: string;
  name: string;
  type: "PROVINSI" | "KOTA" | "KECAMATAN";
  parentId: string | null;
  children?: Location[];
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [allLocations, setAllLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LocationInput>({
    resolver: zodResolver(locationSchema),
    defaultValues: { type: "PROVINSI" },
  });

  const selectedType = watch("type");

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [treeRes, allRes] = await Promise.all([
        fetch("/api/locations?tree=true").then((r) => r.json()),
        fetch("/api/locations").then((r) => r.json()),
      ]);

      if (!treeRes.success) throw new Error(treeRes.message);
      setLocations(treeRes.data);
      if (allRes.success) setAllLocations(allRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  function startEdit(loc: Location) {
    setEditingId(loc.id);
    setShowForm(true);
    setValue("name", loc.name);
    setValue("type", loc.type);
    setValue("parentId", loc.parentId || undefined);
  }

  function cancelForm() {
    setShowForm(false);
    setEditingId(null);
    reset({ type: "PROVINSI", name: "", parentId: undefined });
  }

  async function onSubmit(data: LocationInput) {
    setError(null);
    setSuccess(null);

    const url = editingId ? `/api/locations/${editingId}` : "/api/locations";
    const method = editingId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.message || "Gagal menyimpan lokasi");
      return;
    }

    setSuccess(editingId ? "Lokasi berhasil diupdate" : "Lokasi berhasil ditambahkan");
    cancelForm();
    fetchLocations();
  }

  async function handleDelete() {
    if (!deleteId) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`/api/locations/${deleteId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setDeleteId(null);
      setSuccess("Lokasi berhasil dihapus");
      fetchLocations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus");
    } finally {
      setDeleting(false);
    }
  }

  const parentOptions = allLocations.filter((loc) => {
    if (selectedType === "KOTA") return loc.type === "PROVINSI";
    if (selectedType === "KECAMATAN") return loc.type === "KOTA";
    return false;
  });

  const typeBadge = (type: string) => {
    switch (type) {
      case "PROVINSI":
        return <Badge>Provinsi</Badge>;
      case "KOTA":
        return <Badge variant="secondary">Kota</Badge>;
      case "KECAMATAN":
        return <Badge variant="outline">Kecamatan</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lokasi</h1>
          <p className="text-gray-500">
            Kelola lokasi: Provinsi → Kota → Kecamatan
          </p>
        </div>
        <Button onClick={() => { cancelForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4" />
          Tambah Lokasi
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Inline Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {editingId ? "Edit Lokasi" : "Tambah Lokasi Baru"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              <div className="space-y-2">
                <Label htmlFor="type" required>
                  Tipe
                </Label>
                <Select id="type" {...register("type")}>
                  <option value="PROVINSI">Provinsi</option>
                  <option value="KOTA">Kota</option>
                  <option value="KECAMATAN">Kecamatan</option>
                </Select>
              </div>

              {(selectedType === "KOTA" || selectedType === "KECAMATAN") && (
                <div className="space-y-2">
                  <Label htmlFor="parentId" required>
                    {selectedType === "KOTA" ? "Provinsi" : "Kota"} Induk
                  </Label>
                  <Select id="parentId" {...register("parentId")}>
                    <option value="">Pilih induk</option>
                    {parentOptions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </Select>
                  {errors.parentId && (
                    <p className="text-sm text-red-500">
                      {errors.parentId.message}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" required>
                  Nama
                </Label>
                <Input
                  id="name"
                  placeholder="Nama lokasi"
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="flex items-end gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Spinner size="sm" />
                  ) : editingId ? (
                    "Update"
                  ) : (
                    "Tambah"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm}>
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Location Tree */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : locations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <MapPin className="mx-auto mb-2 h-8 w-8" />
            Belum ada lokasi terdaftar
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {locations.map((provinsi) => (
            <Card key={provinsi.id}>
              <CardContent className="p-4">
                {/* Provinsi */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {typeBadge("PROVINSI")}
                    <span className="font-semibold">{provinsi.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEdit(provinsi)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(provinsi.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                {/* Kota */}
                {provinsi.children && provinsi.children.length > 0 && (
                  <div className="ml-6 mt-3 space-y-2">
                    {provinsi.children.map((kota) => (
                      <div key={kota.id}>
                        <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
                          <div className="flex items-center gap-2">
                            <ChevronRight className="h-3 w-3 text-gray-400" />
                            {typeBadge("KOTA")}
                            <span className="text-sm font-medium">
                              {kota.name}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEdit(kota)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteId(kota.id)}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        </div>

                        {/* Kecamatan */}
                        {kota.children && kota.children.length > 0 && (
                          <div className="ml-8 mt-1 space-y-1">
                            {kota.children.map((kecamatan) => (
                              <div
                                key={kecamatan.id}
                                className="flex items-center justify-between rounded px-3 py-1.5"
                              >
                                <div className="flex items-center gap-2">
                                  <ChevronRight className="h-3 w-3 text-gray-300" />
                                  {typeBadge("KECAMATAN")}
                                  <span className="text-sm">
                                    {kecamatan.name}
                                  </span>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => startEdit(kecamatan)}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setDeleteId(kecamatan.id)}
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Hapus Lokasi"
      >
        <p className="mb-4 text-sm text-gray-600">
          Apakah Anda yakin ingin menghapus lokasi ini? Lokasi dengan properti
          terkait tidak bisa dihapus.
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
