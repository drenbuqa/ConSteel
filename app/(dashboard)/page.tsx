import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FolderKanban,
  Euro,
  Wallet,
  TrendingUp,
  Plus,
  Building2,
  FileText,
  Briefcase,
  Activity,
  BarChart2,
} from "lucide-react";
import { formatEuro } from "@/lib/utils";
import DonutChart from "@/components/DonutChart";
import Sparkline from "@/components/Sparkline";
import ViewAllButton from "@/components/ViewAllButton";
import PageTransition from "@/components/PageTransition";

function StatusBadge({ status }: { status: string }) {
  if (status === "active") return <span className="badge-active">Në progres</span>;
  if (status === "pending") return <span className="badge-pending">Në pritje</span>;
  return <span className="badge-done">Përfunduar</span>;
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [projects, recentReports] = await Promise.all([
    prisma.project.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.report.findMany({
      include: { project: { include: { client: true } } },
      orderBy: { date: "desc" },
      take: 6,
    }),
  ]);

  const activeProjects = projects.filter((p) => p.status === "active");
  const totalValue = projects.reduce((s, p) => s + p.totalPrice, 0);
  const totalExpenses = projects.reduce((s, p) => s + p.totaliShpenzimeve, 0);
  const totalProfit = totalValue - totalExpenses;

  const expPct  = totalValue > 0 ? Math.round((totalExpenses / totalValue) * 100) : 0;
  const profPct = totalValue > 0 ? Math.round((Math.max(0, totalProfit) / totalValue) * 100) : 0;
  const remPct  = Math.max(0, 100 - expPct - profPct);

  const donutSegments = [
    { color: "#111827", pct: expPct,  label: "Shpenzimet",     value: formatEuro(totalExpenses) },
    { color: "#16A34A", pct: profPct, label: "Fitimi i llogaritur", value: formatEuro(Math.max(0, totalProfit)) },
    { color: "#E5E7EB", pct: remPct,  label: "Mbetja",          value: formatEuro(Math.max(0, totalValue - totalExpenses - Math.max(0, totalProfit))) },
  ];

  const displayedProjects = projects.slice(0, 6);

  const activities = recentReports.map((r) => ({
    title: r.title,
    description: r.project.name + " · " + r.project.client.name,
    date: r.date,
    href: `/projektet/${r.project.id}?tab=raportet`,
  }));

  function fmtDate(d: Date) {
    return new Intl.DateTimeFormat("sq-AL", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(d));
  }

  return (
    <>
    <style>{`
      .dash-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
      .dash-main-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 16px; }
      .dash-act-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      @media (max-width: 1024px) {
        .dash-stat-grid { grid-template-columns: repeat(2, 1fr); }
        .dash-main-grid { grid-template-columns: 1fr; }
      }
      @media (max-width: 768px) {
        .dash-stat-grid { grid-template-columns: repeat(2, 1fr); }
        .dash-stat-grid > *:last-child:nth-child(odd) { grid-column: 1 / -1; }
        .dash-act-grid  { grid-template-columns: 1fr; }
      }
    `}</style>
    <PageTransition>
      {/* ── Topbar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>
            Kryefaqja
          </h1>
          <p style={{ fontSize: "13px", color: "#9CA3AF", margin: "2px 0 0" }}>
            Përmbledhje e performancës së kompanisë
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* + Projekt i ri */}
          <Link href="/projektet/i-ri" className="btn-primary">
            <Plus size={15} />
            Projekt i ri
          </Link>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="dash-stat-grid" style={{ marginBottom: "24px" }}>
        {/* Card 1: Projekte aktive */}
        <div className="card stat-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div style={{ width: "40px", height: "40px", background: "#F3F4F6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <FolderKanban size={20} color="#6B7280" />
                </div>
                <span style={{ fontSize: "13px", color: "#9CA3AF", fontWeight: "500" }}>Projekte aktive</span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#111827", lineHeight: 1 }}>
                {activeProjects.length}
              </div>
              <div style={{ fontSize: "12px", color: activeProjects.length > 0 ? "#16A34A" : "#9CA3AF", marginTop: "6px" }}>
                {activeProjects.length} projekte në punë
              </div>
            </div>
            <Sparkline positive={true} />
          </div>
        </div>

        {/* Card 2: Vlera totale */}
        <div className="card stat-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div style={{ width: "40px", height: "40px", background: "#F3F4F6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Euro size={20} color="#6B7280" />
                </div>
                <span style={{ fontSize: "13px", color: "#9CA3AF", fontWeight: "500" }}>Vlera totale</span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#111827", lineHeight: 1 }}>
                {formatEuro(totalValue)}
              </div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "6px" }}>
                {projects.length} projekte gjithsej
              </div>
            </div>
            <Sparkline positive={true} />
          </div>
        </div>

        {/* Card 3: Shpenzime totale */}
        <div className="card stat-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div style={{ width: "40px", height: "40px", background: "#F3F4F6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Wallet size={20} color="#6B7280" />
                </div>
                <span style={{ fontSize: "13px", color: "#9CA3AF", fontWeight: "500" }}>Shpenzime totale</span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#111827", lineHeight: 1 }}>
                {formatEuro(totalExpenses)}
              </div>
              <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "6px" }}>
                {expPct}% e vlerës totale
              </div>
            </div>
            <Sparkline positive={false} />
          </div>
        </div>

        {/* Card 4: Bilanci / Fitimi */}
        <div className="card stat-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <div style={{ width: "40px", height: "40px", background: totalProfit >= 0 ? "#F0FDF4" : "#FEF2F2", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <TrendingUp size={20} color={totalProfit >= 0 ? "#16A34A" : "#DC2626"} />
                </div>
                <span style={{ fontSize: "13px", color: "#9CA3AF", fontWeight: "500" }}>Bilanci / Fitimi</span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: totalProfit >= 0 ? "#111827" : "#DC2626", lineHeight: 1 }}>
                {totalProfit >= 0 ? "+" : ""}{formatEuro(totalProfit)}
              </div>
              <div style={{ fontSize: "12px", color: totalProfit >= 0 ? "#16A34A" : "#DC2626", marginTop: "6px" }}>
                {profPct}% e vlerës totale
              </div>
            </div>
            <Sparkline positive={totalProfit >= 0} />
          </div>
        </div>
      </div>

      {/* ── Middle Row: Projects table (60%) + Donut chart (40%) ── */}
      <div className="dash-main-grid" style={{ marginBottom: "24px" }}>
        {/* LEFT: Projektet aktive table */}
        <div className="card" style={{ overflow: "hidden" }}>
          <div
            style={{
              padding: "18px 20px",
              borderBottom: "1px solid #EAECF0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>
              Projektet aktive
            </div>
            <ViewAllButton href="/projektet" label="Shiko projektet" icon={<FolderKanban size={13} />} />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F9FAFB" }}>
                  {["PROJEKTI", "KLIENTI", "VLERË KONTRATE", "STATUSI"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: "600",
                        color: "#9CA3AF",
                        letterSpacing: "0.05em",
                        borderBottom: "1px solid #EAECF0",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayedProjects.map((p, i) => {
                  const isLast = i === displayedProjects.length - 1;
                  return (
                    <tr
                      key={p.id} className="table-row"
                      style={{ borderBottom: isLast ? "none" : "1px solid #F3F4F6" }}
                    >
                      {/* Project — each cell wraps its content in a Link so the whole row is clickable */}
                      <td style={{ padding: 0 }}>
                        <Link href={`/projektet/${p.id}`} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", textDecoration: "none" }}>
                          <div style={{ width: "40px", height: "40px", background: "#F3F4F6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Building2 size={18} color="#9CA3AF" />
                          </div>
                          <div>
                            <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>{p.name}</div>
                            <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>
                              {p.client.address ?? p.notes?.slice(0, 30) ?? "—"}
                            </div>
                          </div>
                        </Link>
                      </td>

                      <td style={{ padding: 0 }}>
                        <Link href={`/projektet/${p.id}`} style={{ display: "block", padding: "12px 16px", fontSize: "13px", color: "#374151", textDecoration: "none" }}>
                          {p.client.name}
                        </Link>
                      </td>

                      <td style={{ padding: 0 }}>
                        <Link href={`/projektet/${p.id}`} style={{ display: "block", padding: "12px 16px", fontSize: "13px", fontWeight: "600", color: "#111827", whiteSpace: "nowrap", textDecoration: "none" }}>
                          {formatEuro(p.totalPrice)}
                        </Link>
                      </td>

                      <td style={{ padding: 0 }}>
                        <Link href={`/projektet/${p.id}`} style={{ display: "flex", alignItems: "center", padding: "12px 16px", textDecoration: "none" }}>
                          <StatusBadge status={p.status} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
                {displayedProjects.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <div style={{ padding: "48px 24px", textAlign: "center" }}>
                        <div style={{ width: "52px", height: "52px", background: "#F3F4F6", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                          <Building2 size={24} color="#9CA3AF" />
                        </div>
                        <div style={{ fontSize: "15px", fontWeight: "600", color: "#111827", marginBottom: "6px" }}>Nuk ka projekte ende</div>
                        <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "20px", lineHeight: 1.6 }}>Shtoni projektin e parë për të filluar gjurmimin e punimeve.</div>
                        <Link href="/projektet/i-ri" className="btn-primary" style={{ display: "inline-flex" }}>
                          <Plus size={14} /> Projekt i ri
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* RIGHT: Donut chart card */}
        <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
            <div style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>Përmbledhje financiare</div>
            <ViewAllButton href="/raportet" label="Shiko raportet" icon={<BarChart2 size={13} />} />
          </div>

          {/* Donut */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <DonutChart
              segments={donutSegments}
              centerValue={formatEuro(totalValue)}
              centerLabel="Vlera e projekteve"
            />
          </div>

          {/* Legend */}
          <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              { color: "#374151", label: "Vlera e projekteve", value: formatEuro(totalValue), pct: "100%" },
              { color: "#111827", label: "Shpenzimet", value: formatEuro(totalExpenses), pct: `${expPct}%` },
              {
                color: "#16A34A",
                label: "Bilanci/Fitimi",
                value: formatEuro(Math.max(0, totalProfit)),
                pct: `${Math.max(0, profPct)}%`,
              },
              { color: "#E5E7EB", label: "Mbetja", value: formatEuro(Math.max(0, totalValue - totalExpenses - Math.max(0, totalProfit))), pct: `${remPct}%` },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "13px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: item.color,
                      border: item.color === "#E5E7EB" ? "1px solid #D1D5DB" : "none",
                      flexShrink: 0,
                      display: "inline-block",
                    }}
                  />
                  <span style={{ color: "#374151" }}>{item.label}</span>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ fontWeight: "600", color: "#111827", fontSize: "12px" }}>{item.value}</span>
                  <span style={{ color: "#9CA3AF", fontSize: "12px", minWidth: "36px", textAlign: "right" }}>
                    {item.pct}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Activity Feed ── */}
      <div className="card" style={{ padding: "20px", marginBottom: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
          }}
        >
          <div style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>
            Aktiviteti i fundit
          </div>
          <ViewAllButton href="/raportet" label="Shiko aktivitetet" icon={<Activity size={13} />} />
        </div>

        {activities.length === 0 ? (
          <div style={{ color: "#9CA3AF", fontSize: "13px", textAlign: "center", padding: "20px 0" }}>
            Nuk ka aktivitete të fundit.
          </div>
        ) : (
          <div className="dash-act-grid">
            {activities.map((act, i) => (
              <Link
                key={i}
                href={act.href}
                className="activity-card-link"
                style={{
                  display: "flex", alignItems: "center", gap: "11px",
                  padding: "11px 14px",
                  background: "#F9FAFB",
                  border: "1px solid #F3F4F6",
                  borderRadius: "10px",
                  textDecoration: "none",
                  minWidth: 0, overflow: "hidden",
                }}
              >
                {/* Icon */}
                <div style={{ width: "32px", height: "32px", flexShrink: 0, borderRadius: "8px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FileText size={14} color="#6B7280" />
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {act.title}
                  </div>
                  <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {act.description}
                  </div>
                </div>

                {/* Badge + date */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280", background: "#F3F4F6", padding: "2px 8px", borderRadius: "20px", display: "inline-block" }}>
                    Raport
                  </div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
                    {fmtDate(act.date)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>

    </PageTransition>
    </>
  );
}
