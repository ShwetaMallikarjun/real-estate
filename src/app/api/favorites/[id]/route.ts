import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";

function handleError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Internal server error";
  let status = 500;
  if (message.includes("Unauthorized")) status = 401;
  if (message.includes("Forbidden")) status = 403;
  return NextResponse.json({ success: false, message }, { status });
}

type Params = { params: Promise<{ id: string }> };

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    const favorite = await prisma.favorite.findUnique({ where: { id } });

    if (!favorite) {
      return NextResponse.json(
        { success: false, message: "Favorite not found" },
        { status: 404 }
      );
    }

    if (favorite.userId !== user.id) {
      return NextResponse.json(
        { success: false, message: "Forbidden: You can only remove your own favorites" },
        { status: 403 }
      );
    }

    await prisma.favorite.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Removed from favorites",
    });
  } catch (error) {
    return handleError(error);
  }
}
