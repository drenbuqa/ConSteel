import { prisma } from "@/lib/db";

export async function logActivity(projectId: string, action: string, description: string) {
  await prisma.activityLog.create({ data: { projectId, action, description } });
}

export function fmtEuro(n: number) {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + " €";
}

export function fmtDateAlb(d: Date | string) {
  return new Date(d).toLocaleDateString("sq-AL", { day: "2-digit", month: "long", year: "numeric" });
}

const STATUS_LABELS: Record<string, string> = {
  active: "Në progres",
  pending: "Në pritje",
  completed: "Përfunduar",
};

export function statusLabel(s: string) {
  return STATUS_LABELS[s] ?? s;
}
