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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get("type") || undefined;
    const tree = searchParams.get("tree") === "true";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};
    if (type) {
      where.type = type;
    }

    if (tree) {
      const locations = await prisma.location.findMany({
        where: { parentId: null },
        include: {
          children: {
            include: {
              children: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      return NextResponse.json({ success: true, data: locations });
    }

    const locations = await prisma.location.findMany({
      where,
      include: { parent: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ success: true, data: locations });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validated = locationSchema.parse(body);

    if (validated.parentId) {
      const parent = await prisma.location.findUnique({
        where: { id: validated.parentId },
      });
      if (!parent) {
        return NextResponse.json(
          { success: false, message: "Parent location not found" },
          { status: 400 }
        );
      }
    }

    const location = await prisma.location.create({
      data: {
        name: validated.name,
        type: validated.type,
        parentId: validated.parentId || null,
      },
      include: { parent: true },
    });

    return NextResponse.json(
      { success: true, data: location, message: "Location created" },
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
