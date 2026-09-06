import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity, fmtEuro, fmtDateAlb } from "@/lib/activityLog";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; expenseId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, expenseId } = await params;
  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  await prisma.expense.delete({ where: { id: expenseId } });
  if (expense) await logActivity(id, "expense_deleted", `Shpenzim i fshirë: "${expense.name}" — ${fmtEuro(expense.amount)} (${fmtDateAlb(expense.date)})`);
  return NextResponse.json({ ok: true });
}
