import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { logActivity, fmtEuro, fmtDateAlb } from "@/lib/activityLog";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; paymentId: string }> }) {
  const { id, paymentId } = await params;
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  await prisma.payment.delete({ where: { id: paymentId } });
  if (payment) await logActivity(id, "payment_deleted", `Pagesë e fshirë: ${fmtEuro(payment.amount)} (${fmtDateAlb(payment.date)})`);
  return NextResponse.json({ ok: true });
}
