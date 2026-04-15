"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blogSchema, type BlogInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateBlogPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BlogInput>({
    resolver: zodResolver(blogSchema),
  });

  async function onSubmit(data: BlogInput) {
    setError(null);

    const res = await fetch("/api/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.message || "Gagal membuat artikel");
      return;
    }

    router.push("/blogs");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/blogs">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Tambah Artikel</h1>
          <p className="text-gray-500">Buat artikel blog baru</p>
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
            <CardTitle className="text-lg">Konten Artikel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" required>
                Judul
              </Label>
              <Input
                id="title"
                placeholder="Judul artikel"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author" required>
                Penulis
              </Label>
              <Input
                id="author"
                placeholder="Nama penulis"
                {...register("author")}
              />
              {errors.author && (
                <p className="text-sm text-red-500">{errors.author.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Ringkasan</Label>
              <Textarea
                id="excerpt"
                rows={2}
                placeholder="Ringkasan singkat artikel..."
                {...register("excerpt")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" required>
                Konten
              </Label>
              <Textarea
                id="content"
                rows={12}
                placeholder="Tulis konten artikel di sini..."
                {...register("content")}
              />
              {errors.content && (
                <p className="text-sm text-red-500">
                  {errors.content.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuredImage">URL Gambar Utama</Label>
              <Input
                id="featuredImage"
                placeholder="https://example.com/image.jpg"
                {...register("featuredImage")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-2">
          <Link href="/blogs">
            <Button type="button" variant="outline">
              Batal
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner size="sm" />
                Menyimpan...
              </>
            ) : (
              "Publikasikan"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
