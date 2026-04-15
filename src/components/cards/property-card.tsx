"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Heart, BedDouble, Bath, Maximize } from "lucide-react";
import { useSession } from "next-auth/react";

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    harga_asli: string | number;
    harga_diskon?: string | number | null;
    status: string;
    jenis: string;
    kamarTidur: number;
    kamarMandi: number;
    luasBangunan: number;
    gallery?: string[];
    location?: { name: string } | null;
    agent?: { name: string } | null;
  };
  favoriteId?: string | null;
  onToggleFavorite?: (propertyId: string, favoriteId?: string | null) => void;
}

export function PropertyCard({ property, favoriteId, onToggleFavorite }: PropertyCardProps) {
  const { data: session } = useSession();
  const [isFav, setIsFav] = useState(!!favoriteId);
  const [currentFavId, setCurrentFavId] = useState(favoriteId);
  const [toggling, setToggling] = useState(false);

  const image = Array.isArray(property.gallery) && property.gallery.length > 0
    ? property.gallery[0]
    : "/placeholder-property.jpg";

  async function handleToggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!session || toggling) return;
    setToggling(true);
    try {
      if (isFav && currentFavId) {
        await fetch(`/api/favorites/${currentFavId}`, { method: "DELETE" });
        setIsFav(false);
        setCurrentFavId(null);
        onToggleFavorite?.(property.id, null);
      } else {
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ propertyId: property.id }),
        });
        const json = await res.json();
        if (json.success) {
          setIsFav(true);
          setCurrentFavId(json.data.id);
          onToggleFavorite?.(property.id, json.data.id);
        }
      }
    } catch {
      // silently fail
    } finally {
      setToggling(false);
    }
  }

  return (
    <Link href={`/properties/${property.id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={image}
            alt={property.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute left-2 top-2 flex gap-1">
            <Badge variant={property.status === "DIJUAL" ? "default" : "secondary"}>
              {property.status === "DIJUAL" ? "Dijual" : "Disewa"}
            </Badge>
            <Badge variant="outline" className="bg-white/90">{property.jenis}</Badge>
          </div>
          {session && (
            <button
              onClick={handleToggleFavorite}
              className="absolute right-2 top-2 rounded-full bg-white/90 p-2 transition-colors hover:bg-white"
              disabled={toggling}
            >
              <Heart className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </button>
          )}
        </div>
        <CardContent className="p-4">
          <div className="mb-2">
            {property.harga_diskon ? (
              <div className="flex items-baseline gap-2">
                <p className="text-lg font-bold text-blue-600">
                  {formatCurrency(Number(property.harga_diskon))}
                </p>
                <p className="text-sm text-gray-400 line-through">
                  {formatCurrency(Number(property.harga_asli))}
                </p>
              </div>
            ) : (
              <p className="text-lg font-bold text-blue-600">
                {formatCurrency(Number(property.harga_asli))}
              </p>
            )}
          </div>
          <h3 className="mb-1 line-clamp-1 font-semibold text-gray-900">{property.title}</h3>
          {property.location && (
            <p className="mb-3 text-sm text-gray-500">{property.location.name}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <BedDouble className="h-4 w-4" /> {property.kamarTidur}
            </span>
            <span className="flex items-center gap-1">
              <Bath className="h-4 w-4" /> {property.kamarMandi}
            </span>
            <span className="flex items-center gap-1">
              <Maximize className="h-4 w-4" /> {property.luasBangunan} m²
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
