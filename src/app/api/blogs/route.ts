import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { blogSchema } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";

function handleError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Internal server error";
  let status = 500;
  if (message.includes("Unauthorized")) status = 401;
  if (message.includes("Forbidden")) status = 403;
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const blogs = await prisma.blog.findMany({
      where,
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: blogs });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validated = blogSchema.parse(body);

    let slug = generateSlug(validated.title);

    const existingSlug = await prisma.blog.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const blog = await prisma.blog.create({
      data: {
        title: validated.title,
        slug,
        content: validated.content,
        excerpt: validated.excerpt || null,
        featuredImage: validated.featuredImage || null,
        author: validated.author,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
      },
    });

    return NextResponse.json(
      { success: true, data: blog, message: "Blog created" },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: "Validation error", data: error },
        { status: 400 }
      );
    }
    return handleError(error);
  }
}
