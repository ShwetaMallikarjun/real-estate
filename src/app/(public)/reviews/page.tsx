import prisma from "@/lib/prisma";
import { Star } from "lucide-react";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: { property: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Video Review Properti</h1>
      {reviews.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Star className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Belum ada video review</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="aspect-video">
                <iframe
                  src={review.youtubeUrl.replace("watch?v=", "embed/")}
                  className="w-full h-full"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <h3 className="font-semibold">{review.title}</h3>
                {review.property && <p className="text-sm text-gray-500 mt-1">Properti: {review.property.title}</p>}
                {review.description && <p className="text-sm text-gray-600 mt-2">{review.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
