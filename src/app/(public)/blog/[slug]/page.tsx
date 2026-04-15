import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await prisma.blog.findUnique({ where: { slug } });

  if (!blog) return notFound();

  const relatedBlogs = await prisma.blog.findMany({
    where: { id: { not: blog.id } },
    take: 3,
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {blog.featuredImage && (
        <img src={blog.featuredImage} alt={blog.title} className="w-full h-64 md:h-96 object-cover rounded-lg mb-6" />
      )}
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>
      <div className="flex gap-4 text-gray-500 mb-8">
        <span>Oleh {blog.author}</span>
        {blog.publishedAt && <span>{formatDate(blog.publishedAt)}</span>}
      </div>
      <div className="prose max-w-none mb-12">
        <div className="text-gray-700 whitespace-pre-line leading-relaxed">{blog.content}</div>
      </div>

      {relatedBlogs.length > 0 && (
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Artikel Lainnya</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedBlogs.map((b) => (
              <Link key={b.id} href={`/blog/${b.slug}`} className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition">
                <h3 className="font-semibold line-clamp-2">{b.title}</h3>
                {b.publishedAt && <p className="text-sm text-gray-500 mt-2">{formatDate(b.publishedAt)}</p>}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
