import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, truncateText } from "@/lib/utils";
import { Calendar, User } from "lucide-react";

interface BlogCardProps {
  blog: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    featuredImage?: string | null;
    author: string;
    publishedAt?: string | null;
    createdAt: string;
  };
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Link href={`/blog/${blog.slug}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
          <img
            src={blog.featuredImage || "/placeholder-blog.jpg"}
            alt={blog.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900 group-hover:text-blue-600">
            {blog.title}
          </h3>
          {blog.excerpt && (
            <p className="mb-3 text-sm text-gray-600 line-clamp-2">
              {truncateText(blog.excerpt, 120)}
            </p>
          )}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" /> {blog.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {formatDate(blog.publishedAt || blog.createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
