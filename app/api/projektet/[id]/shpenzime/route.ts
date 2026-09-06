import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const expenses = await prisma.expense.findMany({
    where: { projectId: id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const { name, amount, date, note } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Emri është i detyrueshëm" }, { status: 400 });
  if (!amount || isNaN(parseFloat(amount))) return NextResponse.json({ error: "Shuma është e detyrueshme" }, { status: 400 });
  const expense = await prisma.expense.create({
    data: {
      projectId: id,
      name: name.trim(),
      amount: parseFloat(amount),
      date: date ? new Date(date) : new Date(),
      note: note?.trim() || null,
    },
  });
  return NextResponse.json(expense, { status: 201 });
}
