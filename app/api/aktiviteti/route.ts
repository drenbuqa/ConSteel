import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { project: { select: { id: true, name: true } } },
  });
  return NextResponse.json(logs);
}
