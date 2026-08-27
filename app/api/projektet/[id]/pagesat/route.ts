import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payments = await prisma.payment.findMany({
    where: { projectId: id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(payments);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { amount, date, note } = await req.json();
  if (!amount || isNaN(Number(amount))) {
    return NextResponse.json({ error: "Shuma është e detyrueshme." }, { status: 400 });
  }
  const payment = await prisma.payment.create({
    data: {
      projectId: id,
      amount: parseFloat(amount),
      date: date ? new Date(date) : new Date(),
      note: note || null,
    },
  });
  return NextResponse.json(payment, { status: 201 });
}
