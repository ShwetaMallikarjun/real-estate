import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { developerSchema } from "@/lib/validations";

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
    const developers = await prisma.developer.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: developers });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validated = developerSchema.parse(body);

    const developer = await prisma.developer.create({
      data: {
        name: validated.name,
        deskripsi: validated.deskripsi || "",
        alamat: validated.alamat || "",
        socialMedia: body.socialMedia || {},
        foto: body.foto || "",
      },
    });

    return NextResponse.json(
      { success: true, data: developer, message: "Developer created" },
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
