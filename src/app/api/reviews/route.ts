import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { reviewSchema } from "@/lib/validations";

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
    const propertyId = searchParams.get("propertyId") || undefined;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (propertyId) {
      where.propertyId = propertyId;
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        property: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: reviews });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== "ADMIN" && user.role !== "AGENT") {
      return NextResponse.json(
        { success: false, message: "Forbidden: ADMIN or AGENT role required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = reviewSchema.parse(body);

    const property = await prisma.property.findUnique({
      where: { id: validated.propertyId },
    });
    if (!property) {
      return NextResponse.json(
        { success: false, message: "Property not found" },
        { status: 404 }
      );
    }

    const review = await prisma.review.create({
      data: {
        propertyId: validated.propertyId,
        youtubeUrl: validated.youtubeUrl,
        title: validated.title,
        description: validated.description || null,
      },
      include: {
        property: { select: { title: true } },
      },
    });

    return NextResponse.json(
      { success: true, data: review, message: "Review created" },
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
