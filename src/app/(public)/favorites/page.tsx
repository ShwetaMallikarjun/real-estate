"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Heart, Home, LogIn } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface FavoriteItem {
  id: string;
  property: {
    id: string;
    title: string;
    harga_asli: string;
    harga_diskon: string | null;
    gallery: string[];
    location?: { name: string };
    status: string;
    jenis: string;
  };
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/favorites")
        .then((r) => r.json())
        .then((data) => { if (data.success) setFavorites(data.data || []); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [status]);

  const removeFavorite = async (favId: string) => {
    await fetch(`/api/favorites/${favId}`, { method: "DELETE" });
    setFavorites((prev) => prev.filter((f) => f.id !== favId));
  };

  if (status === "unauthenticated") {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <LogIn className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h1 className="text-2xl font-bold mb-4">Login untuk melihat favorit</h1>
        <Link href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">Login</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Properti Favorit</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-64 bg-gray-100 rounded-lg animate-pulse" />)}
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-xl">Belum ada properti favorit</p>
          <Link href="/properties" className="text-blue-600 hover:underline mt-2 inline-block">Cari Properti →</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <div key={fav.id} className="bg-white rounded-lg shadow overflow-hidden relative">
              <button onClick={() => removeFavorite(fav.id)} className="absolute top-3 right-3 bg-white rounded-full p-2 shadow hover:bg-red-50 z-10">
                <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              </button>
              <Link href={`/properties/${fav.property.id}`}>
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {fav.property.gallery?.length > 0 ? (
                    <img src={fav.property.gallery[0]} alt={fav.property.title} className="w-full h-full object-cover" />
                  ) : <Home className="w-10 h-10 text-gray-400" />}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold truncate">{fav.property.title}</h3>
                  <p className="text-blue-600 font-bold">{formatCurrency(Number(fav.property.harga_diskon || fav.property.harga_asli))}</p>
                  <p className="text-sm text-gray-500">{fav.property.location?.name}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
