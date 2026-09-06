import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string; expenseId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { expenseId } = await params;
  await prisma.expense.delete({ where: { id: expenseId } });
  return NextResponse.json({ ok: true });
}
