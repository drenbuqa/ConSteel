import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const files = await prisma.projectFile.findMany({
      where: { projectId: id },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(files);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gabim gjatë marrjes së skedarëve" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { url, name, size, type, data, ext } = await request.json();

    const file = await prisma.projectFile.create({
      data: { projectId: id, url: url || "", name: name || "skedar", size: size ? parseInt(size) : null, type: type || "image", data: data ?? null, ext: ext ?? null },
    });
    return NextResponse.json(file, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gabim gjatë ruajtjes së skedarit" }, { status: 500 });
  }
}
