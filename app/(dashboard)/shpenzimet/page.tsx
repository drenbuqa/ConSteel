import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings, Layers, Coffee, Truck, Wrench } from "lucide-react";
import ExpenseTable from "./ExpenseTable";
import PageTransition from "@/components/PageTransition";

function fmt(n: number) {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + " €";
}

export default async function ShpenzimetPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const projects = await prisma.project.findMany({
    include: { client: true },
    orderBy: { createdAt: "desc" },
  });

  const totals = {
    operative: projects.reduce((s, p) => s + p.shpenzimeOperative, 0),
    materiali: projects.reduce((s, p) => s + p.shpenzimeMateriali, 0),
    ushqim:    projects.reduce((s, p) => s + p.shpenzimeUshqimBonuse, 0),
    transport: projects.reduce((s, p) => s + p.shpenzimeTransportSherbimi, 0),
    extra:     projects.reduce((s, p) => s + p.puneShteseTotal, 0),
  };
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

  const categories = [
    { label: "Operative",            key: "operative" as const, value: totals.operative, color: "#374151", Icon: Settings },
    { label: "Materiali",            key: "materiali" as const, value: totals.materiali, color: "#374151", Icon: Layers   },
    { label: "Ushqim & Bonuse",      key: "ushqim"    as const, value: totals.ushqim,    color: "#374151", Icon: Coffee   },
    { label: "Transport & Shërbimi", key: "transport" as const, value: totals.transport, color: "#374151", Icon: Truck    },
    { label: "Punë shtesë",          key: "extra"     as const, value: totals.extra,     color: "#374151", Icon: Wrench   },
  ];

  return (
    <>
    <style>{`
      .sht-stat-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
      @media (max-width: 1024px) { .sht-stat-grid { grid-template-columns: repeat(3, 1fr); } }
      @media (max-width: 768px)  {
        .sht-stat-grid { grid-template-columns: repeat(2, 1fr); }
        .sht-stat-grid > *:last-child:nth-child(odd) { grid-column: 1 / -1; }
      }
    `}</style>
    <PageTransition>
      {/* ── Header ── */}
      <div style={{ marginBottom: "26px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>Shpenzimet</h1>
        <p style={{ fontSize: "13px", color: "#9CA3AF", margin: "3px 0 0" }}>
          Pasqyrë e shpenzimeve në të gjitha projektet
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="sht-stat-grid" style={{ marginBottom: "22px" }}>
        {categories.map((cat) => {
          const pct = grandTotal > 0 ? (cat.value / grandTotal) * 100 : 0;
          const { Icon } = cat;
          return (
            <div key={cat.key} className="card" style={{ padding: "16px 18px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#111827", borderRadius: "10px 10px 0 0" }} />

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.3 }}>{cat.label}</span>
                <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={14} color="#6B7280" strokeWidth={2} />
                </div>
              </div>

              <div style={{ fontSize: "18px", fontWeight: "800", color: "#111827", letterSpacing: "-0.3px" }}>{fmt(cat.value)}</div>

              <div style={{ marginTop: "10px" }}>
                <div style={{ height: "4px", background: "#F3F4F6", borderRadius: "2px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "#111827", borderRadius: "2px" }} />
                </div>
                <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>{pct.toFixed(1)}% e totalit</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Table (full width) ── */}
      <ExpenseTable projects={projects} totals={totals} grandTotal={grandTotal} />
    </PageTransition>
    </>
  );
}
