import prisma from "@/lib/prisma";
import Link from "next/link";
import { Users } from "lucide-react";

export default async function AgentsPage() {
  const agents = await prisma.agent.findMany({
    include: { _count: { select: { properties: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Daftar Agent</h1>
      {agents.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Belum ada agent terdaftar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {agents.map((agent) => (
            <Link key={agent.id} href={`/agents/${agent.id}`} className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 text-center">
              {agent.foto ? (
                <img src={agent.foto} alt={agent.name} className="w-24 h-24 rounded-full mx-auto object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full mx-auto bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold">
                  {agent.name.charAt(0)}
                </div>
              )}
              <h3 className="font-semibold mt-4 text-lg">{agent.name}</h3>
              <p className="text-gray-500 text-sm">{agent.email}</p>
              {agent.phone && <p className="text-gray-500 text-sm">{agent.phone}</p>}
              <p className="text-blue-600 text-sm mt-2">{agent._count.properties} Properti</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
