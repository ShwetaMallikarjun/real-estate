import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { truncateText } from "@/lib/utils";

interface DeveloperCardProps {
  developer: {
    id: string;
    name: string;
    foto: string;
    deskripsi: string;
    alamat: string;
  };
}

export function DeveloperCard({ developer }: DeveloperCardProps) {
  return (
    <Link href={`/developers/${developer.id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <div className="aspect-[3/2] overflow-hidden bg-gray-100">
          <img
            src={developer.foto || "/placeholder-developer.jpg"}
            alt={developer.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="mb-1 font-semibold text-gray-900">{developer.name}</h3>
          <div className="mb-2 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="line-clamp-1">{developer.alamat}</span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {truncateText(developer.deskripsi, 100)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
