import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  UserCircle,
  MapPin,
  BookOpen,
} from "lucide-react";
import Link from "next/link";

function serialize(data: unknown): unknown {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

export default async function DashboardPage() {
  const [
    totalProperties,
    totalAgents,
    totalDevelopers,
    totalLocations,
    totalBlogs,
    recentPropertiesRaw,
  ] = await Promise.all([
    prisma.property.count(),
    prisma.agent.count(),
    prisma.developer.count(),
    prisma.location.count(),
    prisma.blog.count(),
    prisma.property.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { agent: true, location: true },
    }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recentProperties = serialize(recentPropertiesRaw) as any[];

  const stats = [
    {
      label: "Total Properti",
      value: totalProperties,
      icon: Building2,
      href: "/properties",
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Total Agen",
      value: totalAgents,
      icon: Users,
      href: "/agents",
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Total Developer",
      value: totalDevelopers,
      icon: UserCircle,
      href: "/developers",
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Total Lokasi",
      value: totalLocations,
      icon: MapPin,
      href: "/locations",
      color: "text-orange-600 bg-orange-50",
    },
    {
      label: "Total Blog",
      value: totalBlogs,
      icon: BookOpen,
      href: "/blogs",
      color: "text-pink-600 bg-pink-50",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Selamat datang di panel admin</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
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
          </Link>
        ))}
      </div>

      {/* Recent Properties */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Properti Terbaru</CardTitle>
          <CardDescription>5 properti terakhir yang ditambahkan</CardDescription>
        </CardHeader>
        <CardContent>
          {recentProperties.length === 0 ? (
            <p className="py-4 text-center text-gray-500">
              Belum ada properti
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
                  agent: { name: string } | null;
                  location: { name: string } | null;
                  createdAt: string;
                }) => (
                  <div
                    key={property.id}
                    className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <Link
                        href={`/properties/${property.id}/edit`}
                        className="font-medium hover:text-blue-600"
                      >
                        {property.title}
                      </Link>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                        <span>{property.agent?.name || "-"}</span>
                        <span>•</span>
                        <span>{property.location?.name || "-"}</span>
                        <span>•</span>
                        <span>{formatDate(property.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
