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

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    // Try finding by id first, then by slug
    let blog = await prisma.blog.findUnique({ where: { id } });

    if (!blog) {
      blog = await prisma.blog.findUnique({ where: { slug: id } });
    }

    if (!blog) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = blogSchema.partial().parse(body);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { ...validated };

    if (validated.title && validated.title !== existing.title) {
      data.slug = generateSlug(validated.title);
      const slugConflict = await prisma.blog.findUnique({
        where: { slug: data.slug },
      });
      if (slugConflict && slugConflict.id !== id) {
        data.slug = `${data.slug}-${Date.now()}`;
      }
    }

    if (body.publishedAt !== undefined) {
      data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
    }

    const blog = await prisma.blog.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      data: blog,
      message: "Blog updated",
    });
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

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.blog.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Blog not found" },
        { status: 404 }
      );
    }

    await prisma.blog.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Blog deleted",
    });
  } catch (error) {
    return handleError(error);
  }
}
