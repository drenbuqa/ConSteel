import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity, fmtDateAlb } from "@/lib/activityLog";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; logId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, logId } = await params;
  const log = await prisma.workerLog.findUnique({ where: { id: logId } });
  await prisma.workerLog.delete({ where: { id: logId } });
  if (log) await logActivity(id, "worker_deleted", `Prezencë e fshirë: ${log.count} punëtorë — ${fmtDateAlb(log.date)}`);
  return NextResponse.json({ ok: true });
}
