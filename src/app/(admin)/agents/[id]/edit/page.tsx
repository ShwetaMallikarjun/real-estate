"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { agentSchema, type AgentInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditAgentPage({
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
  } = useForm<AgentInput>({
    resolver: zodResolver(agentSchema),
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/agents/${id}`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Agent not found");
        const a = json.data;
        reset({
          name: a.name,
          email: a.email,
          phone: a.phone,
          whatsapp: a.whatsapp || undefined,
          tentang: a.tentang || undefined,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, reset]);

  async function onSubmit(data: AgentInput) {
    setError(null);

    const res = await fetch(`/api/agents/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.message || "Gagal mengupdate agen");
      return;
    }

    router.push("/agents");
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
        <Link href="/agents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Edit Agen</h1>
          <p className="text-gray-500">Ubah data agen</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Agen</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" required>
                Nama
              </Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" required>
                Email
              </Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" required>
                Telepon
              </Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input id="whatsapp" {...register("whatsapp")} />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="tentang">Tentang</Label>
              <Textarea id="tentang" rows={4} {...register("tentang")} />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-2">
          <Link href="/agents">
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
              "Update Agen"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
