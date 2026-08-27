import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; fileId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { fileId } = await params;
  const file = await prisma.projectFile.findUnique({ where: { id: fileId } });
  if (!file || !file.data) return NextResponse.json({ error: "Skedari nuk u gjet" }, { status: 404 });

  const buffer = Buffer.from(file.data, "base64");
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.name)}"`,
      "Content-Length": buffer.length.toString(),
    },
  });
}
