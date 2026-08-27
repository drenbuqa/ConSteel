import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { totaliBarazimit } = await request.json();

    const project = await prisma.project.update({
      where: { id },
      data: { totaliBarazimit: parseFloat(totaliBarazimit) || 0 },
    });

    return NextResponse.json(project);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update payment" }, { status: 500 });
  }
}
