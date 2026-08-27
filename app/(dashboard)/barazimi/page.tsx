"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, AlertCircle, TrendingUp, ExternalLink } from "lucide-react";
import { useDelayedLoading } from "@/components/Skeleton";
import PageTransition from "@/components/PageTransition";

interface Project {
  id: string;
  name: string;
  status: string;
  totalPrice: number;
  totalPaid: number;
  client: { id: string; name: string };
}

function fmt(n: number) {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + " €";
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active")    return <span className="badge-active">Në progres</span>;
  if (status === "pending")   return <span className="badge-pending">Në pritje</span>;
  return <span className="badge-done">Përfunduar</span>;
}

function ProgressBar({ pct }: { pct: number }) {
  const capped = Math.min(pct, 100);
  const color = pct >= 100 ? "#16A34A" : pct >= 50 ? "#2563EB" : "#D97706";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div style={{ flex: 1, height: "6px", background: "#F3F4F6", borderRadius: "3px", overflow: "hidden", minWidth: "60px" }}>
        <div style={{ height: "100%", width: `${capped}%`, background: color, borderRadius: "3px", transition: "width 0.3s" }} />
      </div>
      <span style={{ fontSize: "12px", fontWeight: "600", color, width: "38px", textAlign: "right" }}>
        {Math.round(pct)}%
      </span>
    </div>
  );
}

export default function BarazimiPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);

  useEffect(() => {
    fetch("/api/projektet")
      .then((r) => r.json())
      .then((data) => { setProjects(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalPrice    = projects.reduce((s, p) => s + p.totalPrice, 0);
  const totalReceived = projects.reduce((s, p) => s + p.totalPaid, 0);
  const totalPending  = totalPrice - totalReceived;
  const overallPct    = totalPrice > 0 ? (totalReceived / totalPrice) * 100 : 0;

  return (
    <>
    <style>{`
      .bar-sum-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
      @media (max-width: 768px) {
        .bar-sum-grid { grid-template-columns: 1fr; gap: 10px; }
        .bar-desktop-table { display: none !important; }
        .bar-mobile-cards  { display: flex !important; }
      }
      .bar-mobile-cards { display: none; flex-direction: column; gap: 10px; }
    `}</style>
    <PageTransition>
    {showSkeleton ? (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div className="bar-sum-grid">
          {[0,1,2].map(i => (
            <div key={i} className="card" style={{ padding: "20px", height: "88px", background: "#F9FAFB" }} />
          ))}
        </div>
        <div className="card" style={{ height: "320px", background: "#F9FAFB" }} />
      </div>
    ) : (<>
      {/* Header */}
      <div className="page-hdr" style={{ marginBottom: "6px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>Pagesat</h1>
          <p style={{ fontSize: "13px", color: "#9CA3AF", margin: "4px 0 0" }}>
            Gjurmoni sa para keni mbledhur nga çdo projekt krahasuar me vlerën e kontratës.
          </p>
        </div>
      </div>


      {/* 3 summary cards */}
      <div className="bar-sum-grid" style={{ marginBottom: "24px" }}>
        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={15} color="#6B7280" />
            </div>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em" }}>Vlera totale kontratave</span>
          </div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "#111827" }}>{fmt(totalPrice)}</div>
          <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "3px" }}>{projects.length} projekte gjithsej</div>
        </div>

        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckCircle2 size={15} color="#16A34A" />
            </div>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em" }}>Mbledhur</span>
          </div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "#111827" }}>{fmt(totalReceived)}</div>
          <div style={{ fontSize: "12px", color: "#16A34A", marginTop: "3px" }}>{Math.round(overallPct)}% e vlerës totale</div>
        </div>

        <div className="card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "10px" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: totalPending > 0 ? "#FFFBEB" : "#F0FDF4", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Clock size={15} color={totalPending > 0 ? "#D97706" : "#16A34A"} />
            </div>
            <span style={{ fontSize: "12px", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.04em" }}>Mbetur për t'u mbledhur</span>
          </div>
          <div style={{ fontSize: "26px", fontWeight: "700", color: "#111827" }}>{fmt(Math.max(totalPending, 0))}</div>
          <div style={{ fontSize: "12px", color: totalPending > 0 ? "#D97706" : "#16A34A", marginTop: "3px" }}>
            {totalPending > 0 ? "Ende pa mbledhur" : "Gjithçka u mblodh"}
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="bar-mobile-cards">
        {projects.map((p) => {
          const remaining = Math.max(p.totalPrice - p.totalPaid, 0);
          const pct = p.totalPrice > 0 ? (p.totalPaid / p.totalPrice) * 100 : 0;
          return (
            <div key={p.id} className="card" style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                <div>
                  <Link href={`/projektet/${p.id}`} style={{ fontSize: "15px", fontWeight: "700", color: "#111827", textDecoration: "none" }}>{p.name}</Link>
                  <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>
                    <Link href={`/klientet/${p.client.id}`} style={{ color: "#9CA3AF", textDecoration: "none" }}>{p.client.name}</Link>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div style={{ marginBottom: "10px" }}>
                <ProgressBar pct={pct} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F3F4F6", paddingTop: "10px" }}>
                <div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "2px" }}>Mbledhur</div>
                  <span style={{ fontSize: "14px", fontWeight: "700", color: "#16A34A" }}>{fmt(p.totalPaid)}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "2px" }}>Mbetur</div>
                    <div style={{ fontSize: "14px", fontWeight: "700", color: remaining > 0 ? "#D97706" : "#16A34A" }}>
                      {remaining > 0 ? fmt(remaining) : "Paguar ✓"}
                    </div>
                  </div>
                  <Link href={`/projektet/${p.id}?tab=pagesat`} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", background: "#F3F4F6", borderRadius: "8px", flexShrink: 0 }}>
                    <ExternalLink size={14} color="#374151" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table (desktop only) */}
      <div className="bar-desktop-table card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #EAECF0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>Gjendja e pagesave sipas projektit</div>
            <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>Shtoni pagesa nga skeda Pagesat brenda çdo projekti</div>
          </div>
          {projects.some(p => p.totalPaid < p.totalPrice && p.status !== "pending") && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "#D97706", fontWeight: "500" }}>
              <AlertCircle size={13} /> Ka projekte me pagesa të papërfunduara
            </div>
          )}
        </div>

        {projects.length === 0 ? (
          <div style={{ padding: "64px 24px", textAlign: "center" }}>
            <div style={{ width: "52px", height: "52px", background: "#F3F4F6", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <TrendingUp size={22} color="#9CA3AF" />
            </div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginBottom: "6px" }}>Nuk ka projekte ende</div>
            <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "20px", maxWidth: "300px", margin: "0 auto 20px", lineHeight: 1.6 }}>
              Krijoni projektet e para dhe shtoni vlerat e kontratave për të gjurmuar pagesat.
            </div>
            <a href="/projektet/i-ri" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 20px", background: "#111827", color: "white", borderRadius: "9px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
              + Krijo projekt të ri
            </a>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F9FAFB" }}>
                  {["Projekti", "Klienti", "Vlera kontratës", "Mbledhur", "Mbetur", "Progresi i pagesës", "Statusi"].map((h) => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: "600", color: "#9CA3AF", borderBottom: "1px solid #EAECF0", whiteSpace: "nowrap", letterSpacing: "0.04em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => {
                  const remaining = Math.max(p.totalPrice - p.totalPaid, 0);
                  const pct = p.totalPrice > 0 ? (p.totalPaid / p.totalPrice) * 100 : 0;
                  const isLast = i === projects.length - 1;

                  return (
                    <tr key={p.id} style={{ borderBottom: isLast ? "none" : "1px solid #F3F4F6" }}>
                      {/* Project */}
                      <td style={{ padding: "14px 16px" }}>
                        <Link href={`/projektet/${p.id}`} style={{ fontSize: "14px", fontWeight: "600", color: "#111827", textDecoration: "none" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"; }}
                        >
                          {p.name}
                        </Link>
                      </td>

                      {/* Client */}
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#6B7280" }}>
                        <Link href={`/klientet/${p.client.id}`} style={{ color: "#6B7280", textDecoration: "none" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"; }}
                        >
                          {p.client.name}
                        </Link>
                      </td>

                      {/* Contract value */}
                      <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "500", color: "#374151" }}>
                        {fmt(p.totalPrice)}
                      </td>

                      {/* Collected */}
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "600", color: "#16A34A" }}>{fmt(p.totalPaid)}</span>
                          <Link href={`/projektet/${p.id}?tab=pagesat`} title="Shko tek pagesat" style={{ width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "5px", opacity: 0.35, transition: "opacity 0.15s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.35")}
                          >
                            <ExternalLink size={12} color="#374151" />
                          </Link>
                        </div>
                      </td>

                      {/* Remaining */}
                      <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "600", color: remaining > 0 ? "#D97706" : "#16A34A" }}>
                        {remaining > 0 ? fmt(remaining) : <span style={{ color: "#16A34A", display: "flex", alignItems: "center", gap: "4px" }}><CheckCircle2 size={13} /> Paguar</span>}
                      </td>

                      {/* Progress */}
                      <td style={{ padding: "14px 16px", minWidth: "140px" }}>
                        <ProgressBar pct={pct} />
                      </td>

                      {/* Status */}
                      <td style={{ padding: "14px 16px" }}>
                        <StatusBadge status={p.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Footer totals */}
              {projects.length > 0 && (
                <tfoot>
                  <tr style={{ background: "#F9FAFB", borderTop: "2px solid #EAECF0" }}>
                    <td colSpan={2} style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "700", color: "#111827" }}>TOTAL</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "700", color: "#111827" }}>{fmt(totalPrice)}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "700", color: "#16A34A" }}>{fmt(totalReceived)}</td>
                    <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: "700", color: totalPending > 0 ? "#D97706" : "#16A34A" }}>{fmt(Math.max(totalPending, 0))}</td>
                    <td style={{ padding: "12px 16px" }}><ProgressBar pct={overallPct} /></td>
                    <td />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </>)}
    </PageTransition>
    </>
  );
}
