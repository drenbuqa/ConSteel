"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Plus, Search, MapPin, Users, FolderOpen, CheckCircle2, Clock, Archive, ChevronDown, X } from "lucide-react";
import { SkeletonTable, useDelayedLoading } from "@/components/Skeleton";
import PageTransition from "@/components/PageTransition";

interface Project {
  id: string;
  name: string;
  location: string | null;
  client: { name: string };
  status: string;
  workers: number;
  totalPrice: number;
  totaliShpenzimeve: number;
  startDate: string | null;
  endDate: string | null;
}

function DeadlineBadge({ endDate, status }: { endDate: string | null; status: string }) {
  if (!endDate || status === "completed") return null;
  const now = new Date();
  const end = new Date(endDate);
  const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "2px 8px", borderRadius: "20px",
      background: "#FEF2F2", border: "1px solid #FECACA",
      fontSize: "11px", fontWeight: "600", color: "#DC2626", marginLeft: "6px",
    }}>
      ⚠ Vonuar
    </span>
  );
  if (diffDays <= 7) return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      padding: "2px 8px", borderRadius: "20px",
      background: "#FFFBEB", border: "1px solid #FDE68A",
      fontSize: "11px", fontWeight: "600", color: "#D97706", marginLeft: "6px",
    }}>
      ⏱ {diffDays}d
    </span>
  );
  return null;
}

function fmt(n: number) {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + " €";
}

const STATUS_OPTIONS = [
  { value: "", label: "Të gjitha", color: "#6B7280", dot: "#D1D5DB" },
  { value: "active", label: "Në progres", color: "#16A34A", dot: "#22C55E" },
  { value: "pending", label: "Në pritje", color: "#D97706", dot: "#F59E0B" },
  { value: "completed", label: "Përfunduar", color: "#6B7280", dot: "#9CA3AF" },
];

function StatusBadge({ status }: { status: string }) {
  if (status === "active") return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 10px", borderRadius: "20px",
      background: "#F0FDF4", border: "1px solid #BBF7D0",
      fontSize: "12px", fontWeight: "600", color: "#16A34A",
    }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
      Në progres
    </span>
  );
  if (status === "pending") return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 10px", borderRadius: "20px",
      background: "#FFFBEB", border: "1px solid #FDE68A",
      fontSize: "12px", fontWeight: "600", color: "#D97706",
    }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#F59E0B", display: "inline-block" }} />
      Në pritje
    </span>
  );
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "5px",
      padding: "3px 10px", borderRadius: "20px",
      background: "#F9FAFB", border: "1px solid #E5E7EB",
      fontSize: "12px", fontWeight: "600", color: "#6B7280",
    }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#9CA3AF", display: "inline-block" }} />
      Përfunduar
    </span>
  );
}

function StatusDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = STATUS_OPTIONS.find((o) => o.value === value) || STATUS_OPTIONS[0];

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", userSelect: "none" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "0 14px", height: "46px",
          border: open ? "1.5px solid #2563EB" : "1.5px solid #E5E7EB",
          borderRadius: "12px", background: "white",
          fontSize: "14px", fontWeight: "500", color: selected.value ? selected.color : "#374151",
          cursor: "pointer", whiteSpace: "nowrap", minWidth: "180px",
          boxShadow: open ? "0 0 0 3px rgba(37,99,235,0.08)" : "0 1px 2px rgba(0,0,0,0.04)",
          transition: "border-color 0.15s, box-shadow 0.15s",
          outline: "none",
        }}
      >
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: selected.dot, flexShrink: 0, transition: "background 0.15s" }} />
        <span style={{ flex: 1, textAlign: "left" }}>{selected.label}</span>
        <ChevronDown size={15} style={{ color: "#9CA3AF", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
          background: "white", border: "1px solid #E5E7EB", borderRadius: "12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)",
          zIndex: 200, overflow: "hidden",
          animation: "dropdownFadeIn 0.15s ease",
        }}>
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                width: "100%", padding: "10px 14px",
                border: "none", background: value === opt.value ? "#F0F9FF" : "transparent",
                cursor: "pointer", fontSize: "14px", fontWeight: value === opt.value ? "600" : "400",
                color: value === opt.value ? "#2563EB" : opt.value ? opt.color : "#374151",
                textAlign: "left",
                borderLeft: value === opt.value ? "3px solid #2563EB" : "3px solid transparent",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { if (value !== opt.value) (e.currentTarget as HTMLButtonElement).style.background = "#F9FAFB"; }}
              onMouseLeave={(e) => { if (value !== opt.value) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: opt.dot, flexShrink: 0 }} />
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProjektetPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/projektet?${params}`)
      .then((r) => r.json())
      .then((d) => { setProjects(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [search, statusFilter]);

  const counts = {
    total: projects.length,
    active: projects.filter((p) => p.status === "active").length,
    pending: projects.filter((p) => p.status === "pending").length,
    completed: projects.filter((p) => p.status === "completed").length,
  };

  const statCards = [
    { label: "Gjithsej projekte", value: counts.total, icon: FolderOpen, iconColor: "#6B7280", iconBg: "#F3F4F6" },
    { label: "Projekte aktive", value: counts.active, icon: CheckCircle2, iconColor: "#16A34A", iconBg: "#F0FDF4" },
    { label: "Në pritje", value: counts.pending, icon: Clock, iconColor: "#D97706", iconBg: "#FFFBEB" },
    { label: "Të mbylluara", value: counts.completed, icon: Archive, iconColor: "#6B7280", iconBg: "#F3F4F6" },
  ];

  return (
    <>
      <style>{`
        @keyframes dropdownFadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rowFadeIn {
          from { opacity: 0; transform: translateX(-6px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .proj-row {
          animation: rowFadeIn 0.22s ease both;
          transition: background 0.13s, box-shadow 0.13s;
          position: relative;
        }
        .proj-row:hover {
          background: #F9FAFB !important;
          box-shadow: inset 3px 0 0 #111827;
        }
        .proj-row:hover .proj-name {
          color: #111827;
          text-decoration: underline;
          text-decoration-color: #9CA3AF;
          text-underline-offset: 3px;
          text-decoration-thickness: 1.5px;
        }
        .proj-stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        @media (max-width: 1024px) { .proj-stat-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px)  {
          .proj-stat-grid { grid-template-columns: repeat(2, 1fr); }
          .proj-stat-grid > *:last-child:nth-child(odd) { grid-column: 1 / -1; }
        }
      `}</style>

      <PageTransition>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", margin: 0 }}>Projektet</h1>
          <p style={{ fontSize: "13px", color: "#9CA3AF", margin: "2px 0 0" }}>Menaxhoni të gjitha projektet e kompanisë</p>
        </div>
        <Link href="/projektet/i-ri" className="btn-primary">
          <Plus size={15} /> Projekt i ri
        </Link>
      </div>

      {/* Stat row */}
      <div className="proj-stat-grid" style={{ marginBottom: "20px" }}>
        {statCards.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="card stat-card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "10px", background: s.iconBg,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <Icon size={20} color={s.iconColor} />
              </div>
              <div>
                <div style={{ fontSize: "26px", fontWeight: "700", color: "#111827", lineHeight: 1.1 }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{s.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search + filter */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "center" }}>
        {/* Search */}
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={17} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="Kërko projekt, klient ose lokacion..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", height: "46px", paddingLeft: "46px", paddingRight: search ? "40px" : "16px",
              border: "1.5px solid #E5E7EB", borderRadius: "12px",
              fontSize: "14px", color: "#111827", background: "white", outline: "none",
              boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s",
              boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#2563EB";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.04)";
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              style={{
                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                background: "#E5E7EB", border: "none", borderRadius: "50%", cursor: "pointer",
                width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center",
                padding: 0, color: "#6B7280",
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Custom status dropdown */}
        <StatusDropdown value={statusFilter} onChange={setStatusFilter} />
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: "hidden" }}>
        {showSkeleton ? (
          <SkeletonTable rows={5} />
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #EAECF0" }}>
                  {["PROJEKTI", "KLIENTI", "PUNËTORË", "VLERA KONTRATËS", "STATUSI", "DATA FILLIMIT"].map((h) => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: "11px", fontWeight: "600", color: "#9CA3AF", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map((p, i) => {
                  const isLast = i === projects.length - 1;
                  return (
                    <tr
                      key={p.id}
                      className="proj-row"
                      style={{
                        borderBottom: isLast ? "none" : "1px solid #F3F4F6",
                        cursor: "pointer",
                        animationDelay: `${i * 0.04}s`,
                        background: hoveredRow === p.id ? "#F9FAFB" : "white",
                      }}
                      onClick={() => { window.location.href = `/projektet/${p.id}`; }}
                      onMouseEnter={() => setHoveredRow(p.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <div className="proj-name" style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>{p.name}</div>
                        {p.location && (
                          <div style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>
                            <MapPin size={11} />
                            {p.location}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#374151", fontWeight: "500" }}>{p.client.name}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#374151" }}>
                          <Users size={13} color="#9CA3AF" />
                          {p.workers}
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: "700", color: "#111827" }}>{fmt(p.totalPrice)}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <StatusBadge status={p.status} />
                        <DeadlineBadge endDate={p.endDate} status={p.status} />
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: "13px", color: "#9CA3AF" }}>
                        {p.startDate ? new Date(p.startDate).toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                      </td>
                    </tr>
                  );
                })}
                {projects.length === 0 && !showSkeleton && (
                  <tr>
                    <td colSpan={6} style={{ padding: "80px 24px", textAlign: "center" }}>
                      <div style={{ width: "60px", height: "60px", background: "#F3F4F6", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                        <FolderOpen size={26} color="#9CA3AF" />
                      </div>
                      <div style={{ fontSize: "17px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>
                        {search || statusFilter ? "Nuk u gjet asnjë projekt" : "Nuk ka projekte ende"}
                      </div>
                      <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "24px", maxWidth: "340px", margin: "0 auto 24px", lineHeight: 1.7 }}>
                        {search || statusFilter
                          ? "Provoni me fjalë të tjera ose hiqni filtrat për të parë të gjitha projektet."
                          : "Krijoni projektin e parë për të filluar gjurmimin e punës dhe financave të kompanisë."}
                      </div>
                      {(search || statusFilter) ? (
                        <button
                          onClick={() => { setSearch(""); setStatusFilter(""); }}
                          style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 20px", background: "#111827", color: "white", border: "none", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "background 0.15s" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#111827"; }}
                        >
                          Hiq filtrat
                        </button>
                      ) : (
                        <Link href="/projektet/i-ri" className="btn-primary" style={{ display: "inline-flex" }}>
                          <Plus size={14} /> Krijo projektin e parë →
                        </Link>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {projects.length > 0 && (
              <div style={{ padding: "11px 16px", borderTop: "1px solid #F3F4F6", fontSize: "12px", color: "#9CA3AF", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Po shfaqen <strong style={{ color: "#374151" }}>{projects.length}</strong> projekte</span>
              </div>
            )}
          </div>
        )}
      </div>
      </PageTransition>
    </>
  );
}
