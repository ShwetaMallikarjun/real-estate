import prisma from "@/lib/prisma";
import Link from "next/link";
import { Building2 } from "lucide-react";

export default async function DevelopersPage() {
  const developers = await prisma.developer.findMany({
    include: { _count: { select: { properties: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Daftar Developer</h1>
      {developers.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Belum ada developer terdaftar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {developers.map((dev) => (
            <Link key={dev.id} href={`/developers/${dev.id}`} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6">
              {dev.foto ? (
                <img src={dev.foto} alt={dev.name} className="w-20 h-20 rounded-lg mx-auto object-cover" />
              ) : (
                <div className="w-20 h-20 rounded-lg mx-auto bg-blue-100 flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-blue-600" />
                </div>
              )}
              <h3 className="font-semibold mt-4 text-lg text-center">{dev.name}</h3>
              {dev.alamat && <p className="text-gray-500 text-sm text-center mt-1">{dev.alamat}</p>}
              <p className="text-blue-600 text-sm text-center mt-2">{dev._count.properties} Properti</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
