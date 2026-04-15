import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Phone, Mail, Home } from "lucide-react";

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await prisma.agent.findUnique({
    where: { id },
    include: { properties: { include: { location: true }, orderBy: { createdAt: "desc" } } },
  });

  if (!agent) return notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {agent.foto ? (
            <img src={agent.foto} alt={agent.name} className="w-32 h-32 rounded-full object-cover" />
          ) : (
            <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-5xl font-bold">
              {agent.name.charAt(0)}
            </div>
          )}
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold">{agent.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-gray-600 justify-center md:justify-start">
              <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {agent.email}</span>
              {agent.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {agent.phone}</span>}
            </div>
            {agent.whatsapp && (
              <a href={`https://wa.me/${agent.whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                WhatsApp
              </a>
            )}
          </div>
        </div>
        {agent.tentang && <div className="mt-6"><h2 className="text-xl font-bold mb-2">Tentang</h2><p className="text-gray-700">{agent.tentang}</p></div>}
      </div>

      <h2 className="text-2xl font-bold mb-4">Properti oleh {agent.name} ({agent.properties.length})</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {agent.properties.map((p) => (
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
