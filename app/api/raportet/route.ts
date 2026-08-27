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
    const projectId = searchParams.get("projectId") || "";

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
        { project: { name: { contains: search, mode: "insensitive" } } },
        { project: { client: { name: { contains: search, mode: "insensitive" } } } },
      ];
    }
    if (projectId) where.projectId = projectId;

    const reports = await prisma.report.findMany({
      where,
      include: { project: { include: { client: true } } },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
