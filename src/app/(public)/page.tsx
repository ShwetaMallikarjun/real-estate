import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Building2, Users, Home, Search } from "lucide-react";

export default async function HomePage() {
  const [propertyCount, agentCount, developerCount, boostedProperties, latestProperties] = await Promise.all([
    prisma.property.count(),
    prisma.agent.count(),
    prisma.developer.count(),
    prisma.property.findMany({
      where: { isBoost: true },
      orderBy: { boostOrder: "asc" },
      take: 4,
      include: { agent: true, location: true },
    }),
    prisma.property.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { agent: true, location: true },
    }),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Temukan Properti Impian Anda</h1>
          <p className="text-xl mb-8 text-blue-100">Platform properti terpercaya dengan ribuan pilihan terbaik</p>
          <div className="max-w-2xl mx-auto">
            <Link href="/properties" className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition">
              <Search className="w-5 h-5" /> Cari Properti
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="bg-white p-6 rounded-lg shadow">
            <Home className="w-10 h-10 mx-auto mb-2 text-blue-600" />
            <p className="text-3xl font-bold">{propertyCount}</p>
            <p className="text-gray-600">Properti</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <Users className="w-10 h-10 mx-auto mb-2 text-blue-600" />
            <p className="text-3xl font-bold">{agentCount}</p>
            <p className="text-gray-600">Agent</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <Building2 className="w-10 h-10 mx-auto mb-2 text-blue-600" />
            <p className="text-3xl font-bold">{developerCount}</p>
            <p className="text-gray-600">Developer</p>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      {boostedProperties.length > 0 && (
        <section className="py-12 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Properti Unggulan</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {boostedProperties.map((p) => (
                <Link key={p.id} href={`/properties/${p.id}`} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {p.gallery && (p.gallery as string[]).length > 0 ? (
                      <img src={(p.gallery as string[])[0]} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <Home className="w-12 h-12 text-gray-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold truncate">{p.title}</h3>
                    <p className="text-blue-600 font-bold">{formatCurrency(Number(p.harga_diskon || p.harga_asli))}</p>
                    <p className="text-sm text-gray-500">{p.location?.name}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{p.status}</span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{p.jenis}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest Properties */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Properti Terbaru</h2>
            <Link href="/properties" className="text-blue-600 hover:underline">Lihat Semua →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {latestProperties.map((p) => (
              <Link key={p.id} href={`/properties/${p.id}`} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {p.gallery && (p.gallery as string[]).length > 0 ? (
                    <img src={(p.gallery as string[])[0]} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <Home className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{p.title}</h3>
                  <p className="text-blue-600 font-bold">{formatCurrency(Number(p.harga_diskon || p.harga_asli))}</p>
                  <p className="text-sm text-gray-500">{p.location?.name}</p>
                  <div className="flex gap-2 mt-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{p.status}</span>
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">{p.jenis}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-blue-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Siap Menemukan Properti Impian?</h2>
        <p className="mb-8 text-blue-100">Hubungi agent kami untuk konsultasi gratis</p>
        <Link href="/agents" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
          Lihat Agent Kami
        </Link>
      </section>
    </div>
  );
}
