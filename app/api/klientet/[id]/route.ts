import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

function notFound() {
  return NextResponse.json({ error: "Klienti nuk u gjet" }, { status: 404 });
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const client = await prisma.client.findUnique({
      where: { id },
      include: { projects: { orderBy: { createdAt: "desc" } } },
    });
    if (!client) return notFound();
    return NextResponse.json(client);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gabim gjatë marrjes së klientit" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { name, phone, email, address, notes } = await request.json();
    if (!name?.trim()) return NextResponse.json({ error: "Emri është i detyrueshëm" }, { status: 400 });

    const client = await prisma.client.update({
      where: { id },
      data: { name: name.trim(), phone: phone || null, email: email || null, address: address || null, notes: notes || null },
    });
    return NextResponse.json(client);
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
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if ((error as { code?: string }).code === "P2025") return notFound();
    console.error(error);
    return NextResponse.json({ error: "Gabim gjatë fshirjes" }, { status: 500 });
  }
}
