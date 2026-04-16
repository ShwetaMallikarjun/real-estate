import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-utils";
import { propertySchema } from "@/lib/validations";
import { generatePropertyId } from "@/lib/utils";

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const jenis = searchParams.get("jenis") || undefined;
    const locationId = searchParams.get("locationId") || undefined;
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const kamarTidur = searchParams.get("kamarTidur");
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "12", 10));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }
    if (status) {
      where.status = status;
    }
    if (jenis) {
      where.jenis = jenis;
    }
    if (locationId) {
      where.locationId = locationId;
    }
    if (minPrice || maxPrice) {
      where.harga_asli = {};
      if (minPrice) where.harga_asli.gte = BigInt(minPrice);
      if (maxPrice) where.harga_asli.lte = BigInt(maxPrice);
    }
    if (kamarTidur) {
      where.kamarTidur = { gte: parseInt(kamarTidur, 10) };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any[] = [
      { isBoost: "desc" },
      { boostOrder: "asc" },
    ];

    switch (sort) {
      case "price_asc":
        orderBy.push({ harga_asli: "asc" });
        break;
      case "price_desc":
        orderBy.push({ harga_asli: "desc" });
        break;
      case "oldest":
        orderBy.push({ createdAt: "asc" });
        break;
      default:
        orderBy.push({ createdAt: "desc" });
    }

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where,
        include: { agent: true, location: true, developer: true },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.property.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: serialize(properties),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
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
    const validated = propertySchema.parse(body);

    let agentId = validated.agentId;

    if (user.role === "AGENT") {
      const agent = await prisma.agent.findUnique({
        where: { userId: user.id },
      });
      if (!agent) {
        return NextResponse.json(
          { success: false, message: "Agent record not found for current user" },
          { status: 400 }
        );
      }
      agentId = agent.id;
    }

    const count = await prisma.property.count();
    const propertyId = generatePropertyId(
      validated.jenis,
      validated.status,
      count + 1
    );

    const property = await prisma.property.create({
      data: {
        title: validated.title,
        propertyId,
        harga_asli: BigInt(validated.harga_asli),
        harga_diskon: validated.harga_diskon
          ? BigInt(validated.harga_diskon)
          : null,
        status: validated.status,
        jenis: validated.jenis,
        luasBangunan: validated.luasBangunan,
        luasTanah: validated.luasTanah,
        furnitur: validated.furnitur ?? null,
        kamarTidur: validated.kamarTidur,
        kamarART: validated.kamarART ?? 0,
        kamarMandi: validated.kamarMandi,
        kamarMandiART: validated.kamarMandiART ?? 0,
        garasi: validated.garasi ?? 0,
        listrik: validated.listrik,
        air: validated.air,
        sertifikat: validated.sertifikat,
        tahunPembuatan: validated.tahunPembuatan,
        deskripsi: validated.deskripsi,
        fasilitas: validated.fasilitas ?? [],
        locationId: validated.locationId,
        maps: validated.maps ?? null,
        agentId,
        developerId: validated.developerId ?? null,
        gallery: validated.gallery ?? [],
        videoReview: [],
        updatedOn: new Date(),
      },
      include: { agent: true, location: true, developer: true },
    });

    return NextResponse.json(
      { success: true, data: serialize(property), message: "Property created" },
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
