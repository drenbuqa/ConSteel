import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { fileId } = await params;
    const { name } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: "Emri nuk mund të jetë bosh" }, { status: 400 });
    const file = await prisma.projectFile.update({ where: { id: fileId }, data: { name: name.trim() } });
    return NextResponse.json(file);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gabim gjatë riemërtimit" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { fileId } = await params;
    await prisma.projectFile.delete({ where: { id: fileId } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025")
      return NextResponse.json({ error: "Skedari nuk u gjet" }, { status: 404 });
    console.error(error);
    return NextResponse.json({ error: "Gabim gjatë fshirjes" }, { status: 500 });
  }
}
