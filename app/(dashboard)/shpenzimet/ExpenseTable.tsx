"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";

function fmt(n: number) {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + " €";
}
function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString("sq-AL", { day: "2-digit", month: "short", year: "numeric" });
}

interface ProjectRow {
  id: string;
  name: string;
  client: { name: string };
  totalPrice: number;
  totalExpenses: number;
  expenseCount: number;
}

interface Expense {
  id: string;
  projectId: string;
  name: string;
  amount: number;
  date: string | Date;
  note: string | null;
  project: { id: string; name: string; client: { name: string } };
}

export default function ExpenseTable({ byProject, expenses, grandTotal }: {
  byProject: ProjectRow[];
  expenses: Expense[];
  grandTotal: number;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  return (
    <>
    <style>{`
      @media (max-width: 768px) {
        .exp-desktop { display: none !important; }
        .exp-mobile  { display: flex !important; }
      }
      .exp-mobile { display: none; flex-direction: column; gap: 8px; padding: 12px; }
    `}</style>

    {/* ── Recent expenses ── */}
    <div className="card" style={{ overflow: "hidden", marginBottom: "16px" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>
          Të gjitha shpenzimet
          <span style={{ fontSize: "12px", fontWeight: "600", background: "#F3F4F6", color: "#6B7280", padding: "2px 8px", borderRadius: "20px", marginLeft: "8px" }}>{expenses.length}</span>
        </div>
        <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>Total: {fmt(grandTotal)}</div>
      </div>

      {/* Desktop table */}
      <div className="exp-desktop" style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              {["Shpenzimi", "Projekti", "Data", "Shuma"].map((h, i) => (
                <th key={h} style={{ padding: "10px 16px", textAlign: i === 3 ? "right" : "left", fontSize: "10.5px", fontWeight: "700", color: "#9CA3AF", letterSpacing: "0.05em", textTransform: "uppercase", borderBottom: "1px solid #EAECF0", whiteSpace: "nowrap" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.map((e, i) => {
              const isLast = i === expenses.length - 1;
              const isH = hoveredId === e.id;
              return (
                <tr key={e.id}
                  style={{ borderBottom: isLast ? "none" : "1px solid #F3F4F6", cursor: "pointer", background: isH ? "#F9FAFB" : "white", boxShadow: isH ? "inset 3px 0 0 #111827" : "none", transition: "background 0.12s, box-shadow 0.12s" }}
                  onMouseEnter={() => setHoveredId(e.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => { window.location.href = `/projektet/${e.projectId}?tab=shpenzimet`; }}
                >
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{e.name}</div>
                    {e.note && <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "1px" }}>{e.note}</div>}
                  </td>
                  <td style={{ padding: "11px 16px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "500", color: "#374151" }}>{e.project.name}</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{e.project.client.name}</div>
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}><Calendar size={11} /> {fmtDate(e.date)}</span>
                  </td>
                  <td style={{ padding: "11px 16px", fontSize: "13px", fontWeight: "700", color: "#111827", textAlign: "right", whiteSpace: "nowrap" }}>{fmt(e.amount)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="exp-mobile">
        {expenses.map((e) => (
          <div key={e.id}
            onClick={() => { window.location.href = `/projektet/${e.projectId}?tab=shpenzimet`; }}
            style={{ background: "#F9FAFB", borderRadius: "10px", padding: "12px 14px", cursor: "pointer" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>{e.name}</div>
                <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "1px" }}>{e.project.name} · {fmtDate(e.date)}</div>
              </div>
              <div style={{ fontSize: "14px", fontWeight: "800", color: "#111827", flexShrink: 0, marginLeft: "12px" }}>{fmt(e.amount)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* ── By project summary ── */}
    {byProject.length > 0 && (
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6" }}>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>Sipas projektit</div>
        </div>
        {byProject.map((p, i) => {
          const isLast = i === byProject.length - 1;
          const isH = hoveredId === `proj-${p.id}`;
          const pct = grandTotal > 0 ? (p.totalExpenses / grandTotal) * 100 : 0;
          return (
            <div key={p.id}
              style={{ padding: "13px 20px", borderBottom: isLast ? "none" : "1px solid #F3F4F6", cursor: "pointer", background: isH ? "#F9FAFB" : "white", boxShadow: isH ? "inset 3px 0 0 #111827" : "none", transition: "background 0.12s, box-shadow 0.12s" }}
              onMouseEnter={() => setHoveredId(`proj-${p.id}`)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => { window.location.href = `/projektet/${p.id}?tab=shpenzimet`; }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <div>
                  <span style={{ fontSize: "13px", fontWeight: "600", color: "#111827" }}>{p.name}</span>
                  <span style={{ fontSize: "11px", color: "#9CA3AF", marginLeft: "6px" }}>{p.client.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ fontSize: "11px", color: "#9CA3AF" }}>{p.expenseCount} shpenzime</span>
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>{fmt(p.totalExpenses)}</span>
                </div>
              </div>
              <div style={{ height: "4px", background: "#F3F4F6", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: "#111827", borderRadius: "2px", transition: "width 0.4s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    )}
    </>
  );
}
