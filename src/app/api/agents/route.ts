import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { agentSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";

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
    const agents = await prisma.agent.findMany({
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: agents });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const validated = agentSchema.parse(body);

    let userId = body.userId as string | undefined;

    if (!userId) {
      const existingUser = await prisma.user.findUnique({
        where: { email: validated.email },
      });

      if (existingUser) {
        userId = existingUser.id;
      } else {
        const defaultPassword = body.password || "agent123456";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const newUser = await prisma.user.create({
          data: {
            name: validated.name,
            email: validated.email,
            password: hashedPassword,
            role: "AGENT",
          },
        });
        userId = newUser.id;
      }
    }

    const agent = await prisma.agent.create({
      data: {
        userId,
        name: validated.name,
        email: validated.email,
        phone: validated.phone,
        whatsapp: validated.whatsapp || validated.phone,
        tentang: validated.tentang || "",
        socialMedia: body.socialMedia || {},
        foto: body.foto || "",
      },
      include: {
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(
      { success: true, data: agent, message: "Agent created" },
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
