import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const logs = await prisma.workerLog.findMany({
    where: { projectId: id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(logs);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { count, date, note } = await req.json();
  if (!count || isNaN(parseInt(count)) || parseInt(count) < 1) {
    return NextResponse.json({ error: "Numri i punëtorëve është i detyrueshëm" }, { status: 400 });
  }
  const log = await prisma.workerLog.create({
    data: {
      projectId: id,
      count: parseInt(count),
      date: date ? new Date(date) : new Date(),
      note: note?.trim() || null,
    },
  });
  return NextResponse.json(log, { status: 201 });
}
