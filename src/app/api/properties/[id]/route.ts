import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { propertySchema } from "@/lib/validations";

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

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        agent: true,
        location: true,
        developer: true,
        reviews: true,
      },
    });

    if (!property) {
      return NextResponse.json(
        { success: false, message: "Property not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: serialize(property) });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    if (user.role !== "ADMIN" && user.role !== "AGENT") {
      return NextResponse.json(
        { success: false, message: "Forbidden: ADMIN or AGENT role required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Property not found" },
        { status: 404 }
      );
    }

    if (user.role === "AGENT") {
      const agent = await prisma.agent.findUnique({
        where: { userId: user.id },
      });
      if (!agent || agent.id !== existing.agentId) {
        return NextResponse.json(
          { success: false, message: "Forbidden: You can only update your own properties" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const validated = propertySchema.partial().parse(body);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { ...validated, updatedOn: new Date() };
    if (validated.harga_asli !== undefined) {
      data.harga_asli = BigInt(validated.harga_asli);
    }
    if (validated.harga_diskon !== undefined) {
      data.harga_diskon = validated.harga_diskon
        ? BigInt(validated.harga_diskon)
        : null;
    }

    const property = await prisma.property.update({
      where: { id },
      data,
      include: { agent: true, location: true, developer: true },
    });

    return NextResponse.json({
      success: true,
      data: serialize(property),
      message: "Property updated",
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
    const user = await requireAuth();
    if (user.role !== "ADMIN" && user.role !== "AGENT") {
      return NextResponse.json(
        { success: false, message: "Forbidden: ADMIN or AGENT role required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Property not found" },
        { status: 404 }
      );
    }

    if (user.role === "AGENT") {
      const agent = await prisma.agent.findUnique({
        where: { userId: user.id },
      });
      if (!agent || agent.id !== existing.agentId) {
        return NextResponse.json(
          { success: false, message: "Forbidden: You can only delete your own properties" },
          { status: 403 }
        );
      }
    }

    await prisma.property.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Property deleted",
    });
  } catch (error) {
    return handleError(error);
  }
}
