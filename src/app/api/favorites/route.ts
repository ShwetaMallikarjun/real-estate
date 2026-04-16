import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

function serialize(data: unknown): unknown {
  return JSON.parse(
    JSON.stringify(data, (_, v) => (typeof v === "bigint" ? v.toString() : v))
  );
}

function handleError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Internal server error";
  let status = 500;
  if (message.includes("Unauthorized")) status = 401;
  if (message.includes("Forbidden")) status = 403;
  return NextResponse.json({ success: false, message }, { status });
}

export async function GET() {
  try {
    const user = await requireAuth();

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        property: {
          include: { agent: true, location: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: serialize(favorites),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const body = await request.json();
    const { propertyId } = body;

    if (!propertyId) {
      return NextResponse.json(
        { success: false, message: "propertyId is required" },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) {
      return NextResponse.json(
        { success: false, message: "Property not found" },
        { status: 404 }
      );
    }

    const existingFavorite = await prisma.favorite.findUnique({
      where: { userId_propertyId: { userId: user.id, propertyId } },
    });
    if (existingFavorite) {
      return NextResponse.json(
        { success: false, message: "Property already in favorites" },
        { status: 409 }
      );
    }

    const favorite = await prisma.favorite.create({
      data: { userId: user.id, propertyId },
      include: {
        property: {
          include: { agent: true, location: true },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: serialize(favorite),
        message: "Added to favorites",
      },
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
