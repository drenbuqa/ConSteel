import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Activity, Calendar, FolderOpen } from "lucide-react";
import PageTransition from "@/components/PageTransition";

function fmtDate(d: Date | string) {
  return new Date(d).toLocaleDateString("sq-AL", { day: "2-digit", month: "long", year: "numeric" });
}
function fmtTime(d: Date | string) {
  return new Date(d).toLocaleTimeString("sq-AL", { hour: "2-digit", minute: "2-digit" });
}

export default async function AktivitetiPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { project: { select: { id: true, name: true } } },
  });

  // Group by date
  const grouped: Record<string, typeof logs> = {};
  for (const log of logs) {
    const day = new Date(log.createdAt).toISOString().split("T")[0];
    if (!grouped[day]) grouped[day] = [];
    grouped[day].push(log);
  }
  const days = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  function dotColor(action: string) {
    if (action.includes("deleted")) return "#EF4444";
    if (action.includes("payment")) return "#16A34A";
    if (action === "project_updated") return "#2563EB";
    return "#6B7280";
  }

  return (
    <PageTransition>
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>Aktiviteti</h1>
        <p style={{ fontSize: "13px", color: "#9CA3AF", margin: "3px 0 0" }}>
          Të gjitha ndryshimet e bëra në platforma — {logs.length} regjistrime
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="card" style={{ padding: "72px 24px", textAlign: "center" }}>
          <div style={{ width: "52px", height: "52px", background: "#F3F4F6", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <Activity size={22} color="#9CA3AF" />
          </div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginBottom: "6px" }}>Nuk ka aktivitet ende</div>
          <div style={{ fontSize: "13px", color: "#9CA3AF", maxWidth: "320px", margin: "0 auto", lineHeight: 1.7 }}>
            Çdo ndryshim i bërë në projekte do të regjistrohet këtu automatikisht.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {days.map((day) => (
            <div key={day}>
              {/* Day header */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <Calendar size={13} color="#9CA3AF" />
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {fmtDate(day)}
                </span>
                <div style={{ flex: 1, height: "1px", background: "#F3F4F6" }} />
                <span style={{ fontSize: "11px", color: "#D1D5DB" }}>{grouped[day].length}</span>
              </div>

              {/* Entries for this day */}
              <div className="card" style={{ overflow: "hidden" }}>
                {grouped[day].map((log, i) => {
                  const isLast = i === grouped[day].length - 1;
                  return (
                    <div key={log.id} style={{ display: "flex", gap: "14px", padding: "13px 18px", borderBottom: isLast ? "none" : "1px solid #F3F4F6", alignItems: "flex-start" }}>
                      {/* Dot */}
                      <div style={{ paddingTop: "5px", flexShrink: 0 }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: dotColor(log.action) }} />
                      </div>
                      {/* Description */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", color: "#111827", fontWeight: "500", lineHeight: 1.5 }}>{log.description}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "4px", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{fmtTime(log.createdAt)}</span>
                          <Link href={`/projektet/${log.project.id}?tab=aktiviteti`}
                            style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "11px", color: "#6B7280", fontWeight: "500", textDecoration: "none" }}
                          >
                            <FolderOpen size={10} /> {log.project.name}
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
