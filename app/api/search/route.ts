import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ clients: [], projects: [] });

  const [clients, projects] = await Promise.all([
    prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
          { phone: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, phone: true, email: true },
      take: 5,
    }),
    prisma.project.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { location: { contains: q, mode: "insensitive" } },
          { client: { name: { contains: q, mode: "insensitive" } } },
        ],
      },
      select: {
        id: true, name: true, location: true, status: true, totalPrice: true,
        client: { select: { name: true } },
      },
      take: 5,
    }),
  ]);

  return NextResponse.json({ clients, projects });
}
