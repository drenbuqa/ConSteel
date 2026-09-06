import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity, fmtEuro, fmtDateAlb, statusLabel } from "@/lib/activityLog";

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

    // Fetch old values for comparison
    const old = await prisma.project.findUnique({ where: { id }, include: { client: true } });

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

    // Log each changed field — wrapped so log failures never break the save
    try {
      if (old) {
        const newPrice = parseFloat(totalPrice) || 0;
        if (old.name !== name.trim())
          await logActivity(id, "project_updated", `Emri ndryshoi: "${old.name}" → "${name.trim()}"`);
        if (old.totalPrice !== newPrice)
          await logActivity(id, "project_updated", `Çmimi i kontratës ndryshoi: ${fmtEuro(old.totalPrice)} → ${fmtEuro(newPrice)}`);
        if (old.status !== status)
          await logActivity(id, "project_updated", `Statusi ndryshoi: ${statusLabel(old.status)} → ${statusLabel(status)}`);
        if ((old.location || "") !== (location || ""))
          await logActivity(id, "project_updated", `Lokacioni ndryshoi: "${old.location || "—"}" → "${location || "—"}"`);
        if ((old.notes || "") !== (notes || ""))
          await logActivity(id, "project_updated", `Shënimet u përditësuan`);
        const oldStart = old.startDate ? old.startDate.toISOString().split("T")[0] : "";
        if (oldStart !== (startDate || ""))
          await logActivity(id, "project_updated", `Data e fillimit ndryshoi: ${old.startDate ? fmtDateAlb(old.startDate) : "—"} → ${startDate ? fmtDateAlb(startDate) : "—"}`);
        const oldEnd = old.endDate ? old.endDate.toISOString().split("T")[0] : "";
        if (oldEnd !== (endDate || ""))
          await logActivity(id, "project_updated", `Data e mbarimit ndryshoi: ${old.endDate ? fmtDateAlb(old.endDate) : "—"} → ${endDate ? fmtDateAlb(endDate) : "—"}`);
      }
    } catch (logErr) {
      console.error("Activity log error:", logErr);
    }

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
