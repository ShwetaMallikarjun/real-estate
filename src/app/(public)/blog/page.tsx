import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { BookOpen } from "lucide-react";

export default async function BlogPage() {
  const blogs = await prisma.blog.findMany({
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Blog</h1>
      {blogs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Belum ada artikel blog</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Link key={blog.id} href={`/blog/${blog.slug}`} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
              {blog.featuredImage ? (
                <img src={blog.featuredImage} alt={blog.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                  <BookOpen className="w-12 h-12 text-gray-300" />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-2 line-clamp-2">{blog.title}</h2>
                {blog.excerpt && <p className="text-gray-600 text-sm line-clamp-3 mb-3">{blog.excerpt}</p>}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{blog.author}</span>
                  {blog.publishedAt && <span>{formatDate(blog.publishedAt)}</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
