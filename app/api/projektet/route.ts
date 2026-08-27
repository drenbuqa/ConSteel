import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { location: { contains: search, mode: "insensitive" } },
        { client: { name: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (status) where.status = status;

    const projects = await prisma.project.findMany({
      where,
      include: { client: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const {
      name, location, clientId, startDate, endDate, status, workers,
      totalPrice, shpenzimeOperative, shpenzimeMateriali,
      shpenzimeUshqimBonuse, shpenzimeTransportSherbimi, puneShteseTotal, notes,
    } = body;

    const totaliShpenzimeve =
      (parseFloat(shpenzimeOperative) || 0) +
      (parseFloat(shpenzimeMateriali) || 0) +
      (parseFloat(shpenzimeUshqimBonuse) || 0) +
      (parseFloat(shpenzimeTransportSherbimi) || 0) +
      (parseFloat(puneShteseTotal) || 0);

    const project = await prisma.project.create({
      data: {
        name,
        location: location || null,
        clientId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status: status || "active",
        workers: parseInt(workers) || 0,
        totalPrice: parseFloat(totalPrice) || 0,
        shpenzimeOperative: parseFloat(shpenzimeOperative) || 0,
        shpenzimeMateriali: parseFloat(shpenzimeMateriali) || 0,
        shpenzimeUshqimBonuse: parseFloat(shpenzimeUshqimBonuse) || 0,
        shpenzimeTransportSherbimi: parseFloat(shpenzimeTransportSherbimi) || 0,
        puneShteseTotal: parseFloat(puneShteseTotal) || 0,
        totaliShpenzimeve,
        notes: notes || null,
      },
      include: { client: true },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
