import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";

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

    const review = await prisma.review.findUnique({
      where: { id },
      include: {
        property: { select: { title: true } },
      },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: review });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 }
      );
    }

    await prisma.review.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Review deleted",
    });
  } catch (error) {
    return handleError(error);
  }
}
