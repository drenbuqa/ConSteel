import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; logId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { logId } = await params;
  await prisma.workerLog.delete({ where: { id: logId } });
  return NextResponse.json({ ok: true });
}
