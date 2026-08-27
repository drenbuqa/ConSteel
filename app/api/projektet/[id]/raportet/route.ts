import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { title, content, date } = await request.json();
    const report = await prisma.report.create({
      data: {
        projectId: id,
        title,
        content: content || "",
        date: date ? new Date(date) : new Date(),
      },
    });
    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create report" }, { status: 500 });
  }
}
