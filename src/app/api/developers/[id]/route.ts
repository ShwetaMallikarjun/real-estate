import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { developerSchema } from "@/lib/validations";

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

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    const developer = await prisma.developer.findUnique({
      where: { id },
      include: { properties: true },
    });

    if (!developer) {
      return NextResponse.json(
        { success: false, message: "Developer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: serialize(developer),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.developer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Developer not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = developerSchema.partial().parse(body);

    const developer = await prisma.developer.update({
      where: { id },
      data: {
        ...validated,
        ...(body.socialMedia !== undefined && { socialMedia: body.socialMedia }),
        ...(body.foto !== undefined && { foto: body.foto }),
      },
    });

    return NextResponse.json({
      success: true,
      data: developer,
      message: "Developer updated",
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

    const existing = await prisma.developer.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Developer not found" },
        { status: 404 }
      );
    }

    await prisma.developer.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Developer deleted",
    });
  } catch (error) {
    return handleError(error);
  }
}
