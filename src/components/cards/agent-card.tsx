import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Phone } from "lucide-react";

interface AgentCardProps {
  agent: {
    id: string;
    name: string;
    foto: string;
    phone: string;
    _count?: { properties: number };
  };
}

export function AgentCard({ agent }: AgentCardProps) {
  return (
    <Link href={`/agents/${agent.id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <div className="aspect-square overflow-hidden bg-gray-100">
          <img
            src={agent.foto || "/placeholder-avatar.jpg"}
            alt={agent.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4 text-center">
          <h3 className="mb-1 font-semibold text-gray-900">{agent.name}</h3>
          <div className="flex items-center justify-center gap-1 text-sm text-gray-500">
            <Phone className="h-3 w-3" />
            <span>{agent.phone}</span>
          </div>
          {agent._count && (
            <div className="mt-2 flex items-center justify-center gap-1 text-sm text-blue-600">
              <Building2 className="h-3 w-3" />
              <span>{agent._count.properties} properti</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
