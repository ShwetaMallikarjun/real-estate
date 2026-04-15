import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Home, MapPin, Phone, BedDouble, Bath, Maximize, Calendar, Zap, Droplets, FileText } from "lucide-react";

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const property = await prisma.property.findUnique({
    where: { id },
    include: { agent: true, location: { include: { parent: { include: { parent: true } } } }, developer: true, reviews: true },
  });

  if (!property) return notFound();

  const relatedProperties = await prisma.property.findMany({
    where: { locationId: property.locationId, id: { not: property.id } },
    take: 4,
    include: { location: true },
  });

  const gallery = (property.gallery as string[]) || [];
  const videoReview = (property.videoReview as string[]) || [];
  const fasilitas = (property.fasilitas as string[]) || [];

  const locationPath = [
    property.location?.parent?.parent?.name,
    property.location?.parent?.name,
    property.location?.name,
  ].filter(Boolean).join(", ");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="h-80 bg-gray-200 rounded-lg overflow-hidden">
          {gallery.length > 0 ? (
            <img src={gallery[0]} alt={property.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center"><Home className="w-16 h-16 text-gray-400" /></div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {gallery.slice(1, 5).map((img, i) => (
            <div key={i} className="h-[calc(10rem-0.5rem)] bg-gray-200 rounded-lg overflow-hidden">
              <img src={img} alt={`${property.title} ${i + 2}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex gap-2 mb-2">
              <span className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{property.status}</span>
              <span className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">{property.jenis}</span>
              <span className="text-sm text-gray-500">ID: {property.propertyId}</span>
            </div>
            <h1 className="text-3xl font-bold">{property.title}</h1>
            <p className="text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-4 h-4" /> {locationPath}</p>
          </div>

          <div>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(Number(property.harga_diskon || property.harga_asli))}</p>
            {property.harga_diskon && (
              <p className="text-lg text-gray-400 line-through">{formatCurrency(Number(property.harga_asli))}</p>
            )}
          </div>

          {/* Specs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <BedDouble className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              <p className="font-semibold">{property.kamarTidur}</p><p className="text-sm text-gray-500">Kamar Tidur</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <Bath className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              <p className="font-semibold">{property.kamarMandi}</p><p className="text-sm text-gray-500">Kamar Mandi</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <Maximize className="w-6 h-6 mx-auto mb-1 text-blue-600" />
              <p className="font-semibold">{property.luasBangunan} m²</p><p className="text-sm text-gray-500">Luas Bangunan</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <Maximize className="w-6 h-6 mx-auto mb-1 text-green-600" />
              <p className="font-semibold">{property.luasTanah} m²</p><p className="text-sm text-gray-500">Luas Tanah</p>
            </div>
          </div>

          {/* Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Detail Properti</h2>
            <div className="grid grid-cols-2 gap-y-3 text-sm">
              <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> Listrik: {property.listrik} Watt</div>
              <div className="flex items-center gap-2"><Droplets className="w-4 h-4" /> Air: {property.air}</div>
              <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Sertifikat: {property.sertifikat}</div>
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Tahun: {property.tahunPembuatan}</div>
              {property.furnitur && <div>Furnitur: {property.furnitur}</div>}
              <div>Garasi: {property.garasi}</div>
              {property.kamarART > 0 && <div>Kamar ART: {property.kamarART}</div>}
              {property.kamarMandiART > 0 && <div>KM ART: {property.kamarMandiART}</div>}
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-bold mb-3">Deskripsi</h2>
            <p className="text-gray-700 whitespace-pre-line">{property.deskripsi}</p>
          </div>

          {/* Facilities */}
          {fasilitas.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3">Fasilitas</h2>
              <div className="flex flex-wrap gap-2">
                {fasilitas.map((f, i) => <span key={i} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">{f}</span>)}
              </div>
            </div>
          )}

          {/* Video Reviews */}
          {videoReview.length > 0 && (
            <div>
              <h2 className="text-xl font-bold mb-3">Video Review</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {videoReview.map((url, i) => (
                  <div key={i} className="aspect-video">
                    <iframe src={url.replace("watch?v=", "embed/")} className="w-full h-full rounded-lg" allowFullScreen />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Map */}
          {property.maps && (
            <div>
              <h2 className="text-xl font-bold mb-3">Lokasi</h2>
              <div className="aspect-video rounded-lg overflow-hidden">
                <iframe src={property.maps} className="w-full h-full" allowFullScreen loading="lazy" />
              </div>
            </div>
          )}
        </div>

        {/* Sidebar - Agent Card */}
        <div className="space-y-6">
          {property.agent && (
            <div className="bg-white border rounded-lg p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Agent</h3>
              <div className="text-center mb-4">
                {property.agent.foto ? (
                  <img src={property.agent.foto} alt={property.agent.name} className="w-20 h-20 rounded-full mx-auto object-cover" />
                ) : (
                  <div className="w-20 h-20 rounded-full mx-auto bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                    {property.agent.name.charAt(0)}
                  </div>
                )}
                <p className="font-semibold mt-2">{property.agent.name}</p>
                <p className="text-sm text-gray-500">{property.agent.email}</p>
              </div>
              <div className="space-y-2">
                {property.agent.phone && (
                  <a href={`tel:${property.agent.phone}`} className="flex items-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 justify-center">
                    <Phone className="w-4 h-4" /> Telepon
                  </a>
                )}
                {property.agent.whatsapp && (
                  <a href={`https://wa.me/${property.agent.whatsapp}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 justify-center">
                    WhatsApp
                  </a>
                )}
              </div>
              <Link href={`/agents/${property.agent.id}`} className="block text-center mt-4 text-blue-600 hover:underline text-sm">
                Lihat Profil Agent →
              </Link>
            </div>
          )}

          {property.developer && (
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-bold mb-2">Developer</h3>
              <p className="font-semibold">{property.developer.name}</p>
              <Link href={`/developers/${property.developer.id}`} className="text-blue-600 hover:underline text-sm">Lihat Developer →</Link>
            </div>
          )}
        </div>
      </div>

      {/* Related Properties */}
      {relatedProperties.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Properti Serupa</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProperties.map((p) => (
              <Link key={p.id} href={`/properties/${p.id}`} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                <div className="h-40 bg-gray-200 flex items-center justify-center">
                  {(p.gallery as string[])?.length > 0 ? (
                    <img src={(p.gallery as string[])[0]} alt={p.title} className="w-full h-full object-cover" />
                  ) : <Home className="w-10 h-10 text-gray-400" />}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold truncate text-sm">{p.title}</h3>
                  <p className="text-blue-600 font-bold text-sm">{formatCurrency(Number(p.harga_diskon || p.harga_asli))}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
