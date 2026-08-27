import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; paymentId: string }> }) {
  const { paymentId } = await params;
  await prisma.payment.delete({ where: { id: paymentId } });
  return NextResponse.json({ ok: true });
}
