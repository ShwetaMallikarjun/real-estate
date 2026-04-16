import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { locationSchema } from "@/lib/validations";

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

    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        children: true,
        parent: true,
        _count: { select: { properties: true } },
      },
    });

    if (!location) {
      return NextResponse.json(
        { success: false, message: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: location });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.location.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Location not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = locationSchema.partial().parse(body);

    const location = await prisma.location.update({
      where: { id },
      data: validated,
      include: { parent: true },
    });

    return NextResponse.json({
      success: true,
      data: location,
      message: "Location updated",
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

    const existing = await prisma.location.findUnique({
      where: { id },
      include: { _count: { select: { properties: true } } },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Location not found" },
        { status: 404 }
      );
    }

    if (existing._count.properties > 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Cannot delete location with assigned properties",
        },
        { status: 400 }
      );
    }

    await prisma.location.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Location deleted",
    });
  } catch (error) {
    return handleError(error);
  }
}
