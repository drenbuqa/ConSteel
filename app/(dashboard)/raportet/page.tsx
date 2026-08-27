"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Search, X, Calendar, User, FolderOpen, ChevronDown, ChevronUp } from "lucide-react";
import { useDelayedLoading } from "@/components/Skeleton";
import PageTransition from "@/components/PageTransition";

interface Report {
  id: string;
  title: string;
  content: string;
  date: string;
  project: {
    id: string;
    name: string;
    status: string;
    client: { id: string; name: string };
  };
}

function groupByDate(reports: Report[]): Record<string, Report[]> {
  const groups: Record<string, Report[]> = {};
  reports.forEach((r) => {
    const d = new Date(r.date);
    const key = d.toLocaleDateString("sq-AL", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  });
  return groups;
}

function StatusDot({ status }: { status: string }) {
  const color = status === "active" ? "#16A34A" : status === "pending" ? "#D97706" : "#6B7280";
  const label = status === "active" ? "Në progres" : status === "pending" ? "Në pritje" : "Përfunduar";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: "600", color }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function ReportCard({ r }: { r: Report }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const isLong = r.content.length > 240;
  const displayed = expanded ? r.content : r.content.substring(0, 240) + (isLong ? "…" : "");

  return (
    <div
      className="card"
      style={{
        padding: "18px 20px",
        cursor: "pointer",
        transition: "background 0.12s, box-shadow 0.12s",
        background: hovered ? "#F9FAFB" : "white",
        boxShadow: hovered ? "inset 3px 0 0 #111827" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        // Don't navigate if clicking expand button or project link
        if ((e.target as HTMLElement).closest("button, a")) return;
        router.push(`/projektet/${r.project.id}?tab=raportet`);
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginBottom: "7px" }}>{r.title}</div>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
            <Link href={`/projektet/${r.project.id}`}
              onClick={(e) => e.stopPropagation()}
              style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "600", color: "#374151", textDecoration: "none", background: "#F3F4F6", borderRadius: "6px", padding: "3px 8px" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#E5E7EB"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#F3F4F6"; }}
            >
              <FolderOpen size={11} color="#6B7280" />
              {r.project.name}
            </Link>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6B7280" }}>
              <User size={11} /> {r.project.client.name}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#9CA3AF" }}>
              <Calendar size={11} /> {new Date(r.date).toLocaleDateString("sq-AL", { day: "2-digit", month: "long", year: "numeric" })}
            </span>
            <StatusDot status={r.project.status} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ fontSize: "13.5px", color: "#4B5563", lineHeight: 1.7, whiteSpace: "pre-wrap", borderLeft: "3px solid #E5E7EB", paddingLeft: "12px", marginLeft: "2px" }}>
        {displayed}
      </div>

      {isLong && (
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
          style={{ marginTop: "8px", display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "600", color: "#6B7280", background: "none", border: "none", cursor: "pointer", padding: "0" }}
        >
          {expanded ? <><ChevronUp size={13} /> Trego më pak</> : <><ChevronDown size={13} /> Trego më shumë</>}
        </button>
      )}
    </div>
  );
}

export default function RaportetPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchReports = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    fetch(`/api/raportet?${params}`)
      .then((r) => r.json())
      .then((data) => { setReports(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [debouncedSearch]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const groups = groupByDate(reports);
  const months = Object.keys(groups);

  return (
    <PageTransition>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>Raportet</h1>
          <p style={{ fontSize: "13px", color: "#9CA3AF", margin: "3px 0 0" }}>
            Të gjitha raportet e projekteve, të renditura nga më i fundit.
          </p>
        </div>
        {!loading && reports.length > 0 && (
          <div style={{ fontSize: "13px", color: "#6B7280", fontWeight: "500", paddingTop: "4px", flexShrink: 0 }}>
            {reports.length} {reports.length === 1 ? "raport" : "raporte"}
            {search ? ` për "${search}"` : ""}
          </div>
        )}
      </div>

      {/* Search bar — full width */}
      <div style={{ position: "relative", marginBottom: "24px" }}>
        <Search size={15} color="#9CA3AF" style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        <input
          type="text"
          placeholder="Kërko raporte, projekte, klientë..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 36px 10px 38px", border: "1px solid #E5E7EB", borderRadius: "10px", fontSize: "13.5px", fontFamily: "Inter, sans-serif", outline: "none", boxSizing: "border-box", transition: "border-color 0.15s, box-shadow 0.15s" } as React.CSSProperties}
          onFocus={(e) => { e.target.style.borderColor = "#111827"; e.target.style.boxShadow = "0 0 0 3px rgba(17,24,39,0.06)"; }}
          onBlur={(e) => { e.target.style.borderColor = "#E5E7EB"; e.target.style.boxShadow = "none"; }}
        />
        {search && (
          <button onClick={() => setSearch("")}
            style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: "2px", display: "flex" }}
          >
            <X size={14} color="#9CA3AF" />
          </button>
        )}
      </div>

      {/* Skeleton */}
      {showSkeleton && (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[180, 140, 200].map((h, i) => (
            <div key={i} className="card" style={{ height: `${h}px`, background: "#F9FAFB" }} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && reports.length === 0 && (
        <div className="card" style={{ padding: "72px 24px", textAlign: "center" }}>
          <div style={{ width: "52px", height: "52px", background: "#F3F4F6", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <FileText size={22} color="#9CA3AF" />
          </div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginBottom: "6px" }}>
            {search ? "Asnjë rezultat" : "Nuk ka raporte ende"}
          </div>
          <div style={{ fontSize: "13px", color: "#9CA3AF", maxWidth: "340px", margin: "0 auto 20px", lineHeight: 1.7 }}>
            {search
              ? `Nuk u gjend asnjë raport për "${search}". Provoni fjalë kyçe të tjera.`
              : 'Raportet krijohen brenda çdo projekti. Hapni një projekt dhe klikoni "Shto raport" për të filluar.'}
          </div>
          {search ? (
            <button onClick={() => setSearch("")}
              style={{ padding: "9px 20px", background: "#111827", color: "white", border: "none", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}
            >
              Pastro kërkimin
            </button>
          ) : (
            <Link href="/projektet" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 20px", background: "#111827", color: "white", borderRadius: "9px", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}>
              Shko tek projektet →
            </Link>
          )}
        </div>
      )}

      {/* Grouped list */}
      {!loading && reports.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {months.map((month) => (
            <div key={month}>
              {/* Month divider */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <span style={{ fontSize: "11.5px", fontWeight: "800", color: "#374151", textTransform: "uppercase", letterSpacing: "0.07em", whiteSpace: "nowrap" }}>
                  {month}
                </span>
                <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280", background: "#F3F4F6", borderRadius: "20px", padding: "2px 8px", whiteSpace: "nowrap" }}>
                  {groups[month].length} {groups[month].length === 1 ? "raport" : "raporte"}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {groups[month].map((r) => <ReportCard key={r.id} r={r} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
