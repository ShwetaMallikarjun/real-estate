import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { agentSchema } from "@/lib/validations";

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

    const agent = await prisma.agent.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        _count: { select: { properties: true } },
      },
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, message: "Agent not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: agent });
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await requireAdmin();
    const { id } = await params;

    const existing = await prisma.agent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Agent not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validated = agentSchema.partial().parse(body);

    const agent = await prisma.agent.update({
      where: { id },
      data: {
        ...validated,
        ...(body.socialMedia !== undefined && { socialMedia: body.socialMedia }),
        ...(body.foto !== undefined && { foto: body.foto }),
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: agent,
      message: "Agent updated",
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

    const existing = await prisma.agent.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, message: "Agent not found" },
        { status: 404 }
      );
    }

    await prisma.agent.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Agent deleted",
    });
  } catch (error) {
    return handleError(error);
  }
}
