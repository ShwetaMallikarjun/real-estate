"use client";

import { useState, useEffect, use } from "react";
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

export default function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BlogInput>({
    resolver: zodResolver(blogSchema),
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/blogs/${id}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Blog not found");
        const b = json.data;
        reset({
          title: b.title,
          content: b.content,
          excerpt: b.excerpt || undefined,
          featuredImage: b.featuredImage || undefined,
          author: b.author,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, reset]);

  async function onSubmit(data: BlogInput) {
    setError(null);

    const res = await fetch(`/api/blogs/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.message || "Gagal mengupdate artikel");
      return;
    }

    router.push("/blogs");
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
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
          <h1 className="text-3xl font-bold">Edit Artikel</h1>
          <p className="text-gray-500">Ubah konten artikel blog</p>
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
              <Input id="title" {...register("title")} />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author" required>
                Penulis
              </Label>
              <Input id="author" {...register("author")} />
              {errors.author && (
                <p className="text-sm text-red-500">{errors.author.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Ringkasan</Label>
              <Textarea id="excerpt" rows={2} {...register("excerpt")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" required>
                Konten
              </Label>
              <Textarea id="content" rows={12} {...register("content")} />
              {errors.content && (
                <p className="text-sm text-red-500">
                  {errors.content.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="featuredImage">URL Gambar Utama</Label>
              <Input id="featuredImage" {...register("featuredImage")} />
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
              "Update Artikel"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
