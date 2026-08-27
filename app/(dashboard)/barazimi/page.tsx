"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock, AlertCircle, TrendingUp, Edit2, Check, X, Info } from "lucide-react";
import { useDelayedLoading } from "@/components/Skeleton";
import PageTransition from "@/components/PageTransition";

interface Project {
  id: string;
  name: string;
  status: string;
  totalPrice: number;
  totaliBarazimit: number;
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

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/projektet")
      .then((r) => r.json())
      .then((data) => { setProjects(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const startEdit = (p: Project) => {
    setEditingId(p.id);
    setEditValue(String(p.totaliBarazimit || 0));
  };

  const cancelEdit = () => { setEditingId(null); setEditValue(""); };

  const saveEdit = async (id: string) => {
    setSaving(true);
    const res = await fetch(`/api/projektet/${id}/pagesa`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totaliBarazimit: parseFloat(editValue) || 0 }),
    });
    if (res.ok) {
      setProjects((prev) =>
        prev.map((p) => p.id === id ? { ...p, totaliBarazimit: parseFloat(editValue) || 0 } : p)
      );
    }
    setSaving(false);
    setEditingId(null);
    setEditValue("");
  };

  const totalPrice    = projects.reduce((s, p) => s + p.totalPrice, 0);
  const totalReceived = projects.reduce((s, p) => s + p.totaliBarazimit, 0);
  const totalPending  = totalPrice - totalReceived;
  const overallPct    = totalPrice > 0 ? (totalReceived / totalPrice) * 100 : 0;

  return (
    <>
    <style>{`
      .bar-sum-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
      @media (max-width: 768px) {
        .bar-sum-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
        .bar-sum-grid > *:last-child:nth-child(odd) { grid-column: 1 / -1; }
      }
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
      <div style={{ marginBottom: "6px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>Pagesat</h1>
        <p style={{ fontSize: "14px", color: "#9CA3AF", margin: "4px 0 0" }}>
          Gjurmoni sa para keni mbledhur nga çdo projekt krahasuar me vlerën e kontratës.
        </p>
      </div>

      {/* Explanation banner */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 16px", background: "#F8FAFF", border: "1px solid #E0E7FF", borderRadius: "10px", marginBottom: "20px" }}>
        <Info size={15} color="#6366F1" style={{ flexShrink: 0, marginTop: "1px" }} />
        <p style={{ margin: 0, fontSize: "13px", color: "#4B5563", lineHeight: 1.6 }}>
          Për çdo projekt, klikoni <strong>ikonën e lapsit</strong> pranë shumës së mbledhur për ta përditësuar. Shuma e mbledhur është ajo që klienti ka paguar deri tani.
        </p>
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

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #EAECF0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "600", color: "#111827" }}>Gjendja e pagesave sipas projektit</div>
            <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>Klikoni lapsin për të përditësuar shumën e mbledhur</div>
          </div>
          {projects.some(p => p.totaliBarazimit < p.totalPrice && p.status !== "pending") && (
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
                  const remaining = Math.max(p.totalPrice - p.totaliBarazimit, 0);
                  const pct = p.totalPrice > 0 ? (p.totaliBarazimit / p.totalPrice) * 100 : 0;
                  const isEditing = editingId === p.id;
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

                      {/* Collected — editable */}
                      <td style={{ padding: "14px 16px" }}>
                        {isEditing ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <input
                              type="number"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") saveEdit(p.id); if (e.key === "Escape") cancelEdit(); }}
                              autoFocus
                              style={{ width: "110px", padding: "6px 9px", border: "1.5px solid #111827", borderRadius: "7px", fontSize: "13px", fontFamily: "Inter, sans-serif", outline: "none", MozAppearance: "textfield", WebkitAppearance: "none" } as React.CSSProperties}
                              className="no-spinner"
                            />
                            <button
                              onClick={() => saveEdit(p.id)}
                              disabled={saving}
                              style={{ width: "28px", height: "28px", background: "#111827", border: "none", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                            >
                              <Check size={13} color="white" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              style={{ width: "28px", height: "28px", background: "#F3F4F6", border: "none", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                            >
                              <X size={13} color="#6B7280" />
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <span style={{ fontSize: "13px", fontWeight: "600", color: "#16A34A" }}>
                              {fmt(p.totaliBarazimit)}
                            </span>
                            <button
                              onClick={() => startEdit(p)}
                              title="Ndrysho shumën e mbledhur"
                              style={{ width: "24px", height: "24px", background: "transparent", border: "none", borderRadius: "5px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", opacity: 0.4, transition: "opacity 0.15s, background 0.15s" }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "0.4"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                            >
                              <Edit2 size={12} color="#374151" />
                            </button>
                          </div>
                        )}
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
