import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Building2, Home } from "lucide-react";

export default async function DeveloperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const developer = await prisma.developer.findUnique({
    where: { id },
    include: { properties: { include: { location: true }, orderBy: { createdAt: "desc" } } },
  });

  if (!developer) return notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {developer.foto ? (
            <img src={developer.foto} alt={developer.name} className="w-32 h-32 rounded-lg object-cover" />
          ) : (
            <div className="w-32 h-32 rounded-lg bg-blue-100 flex items-center justify-center">
              <Building2 className="w-16 h-16 text-blue-600" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{developer.name}</h1>
            {developer.alamat && <p className="text-gray-600 mt-1">{developer.alamat}</p>}
          </div>
        </div>
        {developer.deskripsi && <div className="mt-6"><h2 className="text-xl font-bold mb-2">Deskripsi</h2><p className="text-gray-700">{developer.deskripsi}</p></div>}
      </div>

      <h2 className="text-2xl font-bold mb-4">Properti ({developer.properties.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {developer.properties.map((p) => (
          <Link key={p.id} href={`/properties/${p.id}`} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
            <div className="h-48 bg-gray-200 flex items-center justify-center">
              {(p.gallery as string[])?.length > 0 ? (
                <img src={(p.gallery as string[])[0]} alt={p.title} className="w-full h-full object-cover" />
              ) : <Home className="w-10 h-10 text-gray-400" />}
            </div>
            <div className="p-4">
              <h3 className="font-semibold truncate">{p.title}</h3>
              <p className="text-blue-600 font-bold">{formatCurrency(Number(p.harga_diskon || p.harga_asli))}</p>
              <p className="text-sm text-gray-500">{p.location?.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
