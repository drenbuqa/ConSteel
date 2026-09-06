import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function notFound() {
  return NextResponse.json({ error: "Projekti nuk u gjet" }, { status: 404 });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        reports: { orderBy: { date: "desc" } },
        files: { orderBy: { createdAt: "desc" } },
        payments: { orderBy: { date: "desc" } },
      },
    });
    if (!project) return notFound();
    const totalPaid = project.payments.reduce((s, p) => s + p.amount, 0);
    const safe = { ...project, files: project.files.map(({ data: _d, ...f }) => f), totalPaid };
    // Note: expenses and workerLogs are fetched via separate routes
    return NextResponse.json(safe);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gabim gjatë marrjes së projektit" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, location, clientId, startDate, endDate, status, totalPrice, notes } = body;

    if (!name?.trim()) return NextResponse.json({ error: "Emri i projektit është i detyrueshëm" }, { status: 400 });
    if (!clientId) return NextResponse.json({ error: "Klienti është i detyrueshëm" }, { status: 400 });

    const project = await prisma.project.update({
      where: { id },
      data: {
        name: name.trim(), location: location || null, clientId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        status,
        totalPrice: parseFloat(totalPrice) || 0,
        notes: notes || null,
      },
      include: { client: true, reports: { orderBy: { date: "desc" } }, files: { orderBy: { createdAt: "desc" } } },
    });
    const safe = { ...project, files: project.files.map(({ data: _d, ...f }) => f) };
    return NextResponse.json(safe);
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") return notFound();
    console.error(error);
    return NextResponse.json({ error: "Gabim gjatë përditësimit" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") return notFound();
    console.error(error);
    return NextResponse.json({ error: "Gabim gjatë fshirjes" }, { status: 500 });
  }
}
