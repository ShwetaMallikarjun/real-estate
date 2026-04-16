"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { propertySchema, type PropertyInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Location {
  id: string;
  name: string;
  type: string;
}

interface Developer {
  id: string;
  name: string;
}

export default function AgentCreatePropertyPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [galleryInput, setGalleryInput] = useState("");
  const [videoInput, setVideoInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PropertyInput>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      status: "DIJUAL",
      jenis: "RUMAH",
      kamarTidur: 1,
      kamarMandi: 1,
      kamarART: 0,
      kamarMandiART: 0,
      garasi: 0,
      tahunPembuatan: new Date().getFullYear(),
      fasilitas: [],
      gallery: [],
    },
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/locations").then((r) => r.json()),
      fetch("/api/developers").then((r) => r.json()),
    ]).then(([locationsRes, developersRes]) => {
      if (locationsRes.success) setLocations(locationsRes.data);
      if (developersRes.success) setDevelopers(developersRes.data);
    });
  }, []);

  async function onSubmit(data: PropertyInput) {
    setError(null);

    const gallery = galleryInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const videoReview = videoInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const body = { ...data, gallery, videoReview };

    const res = await fetch("/api/properties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.message || "Gagal membuat properti");
      return;
    }

    router.push("/my-properties");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/my-properties">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Tambah Properti</h1>
          <p className="text-gray-500">Buat listing properti baru</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title" required>Judul</Label>
              <Input id="title" placeholder="Judul properti" {...register("title")} />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status" required>Status</Label>
              <Select id="status" {...register("status")}>
                <option value="DIJUAL">Dijual</option>
                <option value="DISEWA">Disewa</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jenis" required>Jenis</Label>
              <Select id="jenis" {...register("jenis")}>
                <option value="RUMAH">Rumah</option>
                <option value="APARTEMEN">Apartemen</option>
                <option value="LAINNYA">Lainnya</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="harga_asli" required>Harga Asli (Rp)</Label>
              <Input id="harga_asli" type="number" placeholder="1000000000" {...register("harga_asli", { valueAsNumber: true })} />
              {errors.harga_asli && <p className="text-sm text-red-500">{errors.harga_asli.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="harga_diskon">Harga Diskon (Rp)</Label>
              <Input id="harga_diskon" type="number" placeholder="Opsional" {...register("harga_diskon", { valueAsNumber: true })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Spesifikasi</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="luasBangunan" required>Luas Bangunan (m²)</Label>
              <Input id="luasBangunan" type="number" {...register("luasBangunan", { valueAsNumber: true })} />
              {errors.luasBangunan && <p className="text-sm text-red-500">{errors.luasBangunan.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="luasTanah" required>Luas Tanah (m²)</Label>
              <Input id="luasTanah" type="number" {...register("luasTanah", { valueAsNumber: true })} />
              {errors.luasTanah && <p className="text-sm text-red-500">{errors.luasTanah.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="furnitur">Furnitur</Label>
              <Input id="furnitur" placeholder="Furnished / Semi / Unfurnished" {...register("furnitur")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kamarTidur" required>Kamar Tidur</Label>
              <Input id="kamarTidur" type="number" {...register("kamarTidur", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kamarMandi" required>Kamar Mandi</Label>
              <Input id="kamarMandi" type="number" {...register("kamarMandi", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kamarART">Kamar ART</Label>
              <Input id="kamarART" type="number" {...register("kamarART", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kamarMandiART">Kamar Mandi ART</Label>
              <Input id="kamarMandiART" type="number" {...register("kamarMandiART", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="garasi">Garasi</Label>
              <Input id="garasi" type="number" {...register("garasi", { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="listrik" required>Listrik (Watt)</Label>
              <Input id="listrik" type="number" {...register("listrik", { valueAsNumber: true })} />
              {errors.listrik && <p className="text-sm text-red-500">{errors.listrik.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="air" required>Air</Label>
              <Input id="air" placeholder="PAM / Sumur" {...register("air")} />
              {errors.air && <p className="text-sm text-red-500">{errors.air.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="sertifikat" required>Sertifikat</Label>
              <Input id="sertifikat" placeholder="SHM / HGB" {...register("sertifikat")} />
              {errors.sertifikat && <p className="text-sm text-red-500">{errors.sertifikat.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tahunPembuatan" required>Tahun Pembuatan</Label>
              <Input id="tahunPembuatan" type="number" {...register("tahunPembuatan", { valueAsNumber: true })} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Deskripsi &amp; Detail</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="deskripsi" required>Deskripsi</Label>
              <Textarea id="deskripsi" rows={5} placeholder="Deskripsi properti..." {...register("deskripsi")} />
              {errors.deskripsi && <p className="text-sm text-red-500">{errors.deskripsi.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="locationId" required>Lokasi</Label>
              <Select id="locationId" {...register("locationId")}>
                <option value="">Pilih lokasi</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>{loc.name} ({loc.type})</option>
                ))}
              </Select>
              {errors.locationId && <p className="text-sm text-red-500">{errors.locationId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="maps">Google Maps URL</Label>
              <Input id="maps" placeholder="https://maps.google.com/..." {...register("maps")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="developerId">Developer</Label>
              <Select id="developerId" {...register("developerId")}>
                <option value="">Pilih developer (opsional)</option>
                {developers.map((dev) => (
                  <option key={dev.id} value={dev.id}>{dev.name}</option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Media</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gallery">Gallery (URL dipisah koma)</Label>
              <Textarea
                id="gallery"
                rows={3}
                placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
                value={galleryInput}
                onChange={(e) => setGalleryInput(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoReview">Video Review YouTube (URL dipisah koma)</Label>
              <Textarea
                id="videoReview"
                rows={3}
                placeholder="https://youtube.com/watch?v=..."
                value={videoInput}
                onChange={(e) => setVideoInput(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link href="/my-properties">
            <Button type="button" variant="outline">Batal</Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <><Spinner size="sm" /> Menyimpan...</>
            ) : (
              "Simpan Properti"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
