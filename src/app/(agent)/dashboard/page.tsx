import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Eye, TrendingUp } from "lucide-react";
import Link from "next/link";

function serialize(data: unknown): unknown {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

export default async function AgentDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "AGENT") {
    redirect("/login");
  }

  const agent = await prisma.agent.findUnique({
    where: { userId: session.user.id },
  });

  if (!agent) {
    return (
      <div className="py-12 text-center text-gray-500">
        Profil agen tidak ditemukan. Hubungi administrator.
      </div>
    );
  }

  const [totalProperties, recentPropertiesRaw] = await Promise.all([
    prisma.property.count({ where: { agentId: agent.id } }),
    prisma.property.findMany({
      where: { agentId: agent.id },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { location: true },
    }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentProperties = serialize(recentPropertiesRaw) as any[];

  const stats = [
    {
      label: "Total Properti",
      value: totalProperties,
      icon: Building2,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Properti Dijual",
      value: recentProperties.filter(
        (p: { status: string }) => p.status === "DIJUAL"
      ).length,
      icon: TrendingUp,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Properti Disewa",
      value: recentProperties.filter(
        (p: { status: string }) => p.status === "DISEWA"
      ).length,
      icon: Eye,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Agen</h1>
        <p className="text-gray-500">Selamat datang, {agent.name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="transition-shadow hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <div className={`rounded-full p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Properti Terbaru</CardTitle>
          <CardDescription>5 properti terakhir Anda</CardDescription>
        </CardHeader>
        <CardContent>
          {recentProperties.length === 0 ? (
            <p className="py-4 text-center text-gray-500">
              Belum ada properti.{" "}
              <Link href="/my-properties/create" className="text-blue-600 hover:underline">
                Tambah properti pertama
              </Link>
            </p>
          ) : (
            <div className="space-y-4">
              {recentProperties.map(
                (property: {
                  id: string;
                  title: string;
                  status: string;
                  jenis: string;
                  harga_asli: string;
                  location: { name: string } | null;
                  createdAt: string;
                }) => (
                  <div
                    key={property.id}
                    className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <Link
                        href={`/my-properties/${property.id}/edit`}
                        className="font-medium hover:text-blue-600"
                      >
                        {property.title}
                      </Link>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                        <span>{formatCurrency(Number(property.harga_asli))}</span>
                        <span>•</span>
                        <span>{property.location?.name || "-"}</span>
                        <span>•</span>
                        <span>{formatDate(property.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          property.status === "DIJUAL" ? "default" : "secondary"
                        }
                      >
                        {property.status}
                      </Badge>
                      <Badge variant="outline">{property.jenis}</Badge>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
