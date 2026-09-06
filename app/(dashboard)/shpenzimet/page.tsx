import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Euro } from "lucide-react";
import ExpenseTable from "./ExpenseTable";
import PageTransition from "@/components/PageTransition";

function fmt(n: number) {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + " €";
}

export default async function ShpenzimetPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const [projects, expenses, agg] = await Promise.all([
    prisma.project.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.expense.findMany({
      include: { project: { include: { client: true } } },
      orderBy: { date: "desc" },
    }),
    prisma.expense.aggregate({ _sum: { amount: true }, _count: true }),
  ]);

  const grandTotal = agg._sum.amount ?? 0;
  const totalCount = agg._count;

  const byProject = projects.map((p) => {
    const projExpenses = expenses.filter((e) => e.projectId === p.id);
    return {
      id: p.id,
      name: p.name,
      client: p.client,
      totalPrice: p.totalPrice,
      totalExpenses: projExpenses.reduce((s, e) => s + e.amount, 0),
      expenseCount: projExpenses.length,
    };
  }).filter((p) => p.totalExpenses > 0 || p.totalPrice > 0);

  return (
    <>
    <style>{`
      .sht-stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
      @media (max-width: 768px)  {
        .sht-stat-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
        .sht-stat-grid > *:last-child:nth-child(odd) { grid-column: 1 / -1; }
        .sht-card-value { font-size: 18px !important; }
        .sht-card-inner { padding: 12px 14px !important; }
      }
    `}</style>
    <PageTransition>
      {/* ── Header ── */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>Shpenzimet</h1>
        <p style={{ fontSize: "13px", color: "#9CA3AF", margin: "3px 0 0" }}>
          Pasqyrë e shpenzimeve në të gjitha projektet
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div className="sht-stat-grid" style={{ marginBottom: "22px" }}>
        {[
          { label: "Total shpenzime", value: fmt(grandTotal) },
          { label: "Numri i shpenzimeve", value: String(totalCount) },
          { label: "Projekte me shpenzime", value: String(byProject.filter((p) => p.totalExpenses > 0).length) },
        ].map((stat) => (
          <div key={stat.label} className="card sht-card-inner" style={{ padding: "16px 18px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#111827", borderRadius: "10px 10px 0 0" }} />
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>{stat.label}</div>
            <div className="sht-card-value" style={{ fontSize: "22px", fontWeight: "800", color: "#111827", letterSpacing: "-0.3px" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* ── Expense list or empty state ── */}
      {expenses.length === 0 ? (
        <div className="card" style={{ padding: "72px 24px", textAlign: "center" }}>
          <div style={{ width: "52px", height: "52px", background: "#F3F4F6", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <Euro size={22} color="#9CA3AF" />
          </div>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginBottom: "6px" }}>Nuk ka shpenzime ende</div>
          <div style={{ fontSize: "13px", color: "#9CA3AF", maxWidth: "340px", margin: "0 auto", lineHeight: 1.7 }}>
            Shtoni shpenzime nga brenda çdo projekti, nën skedën &quot;Shpenzimet&quot;.
          </div>
        </div>
      ) : (
        <ExpenseTable byProject={byProject} expenses={expenses} grandTotal={grandTotal} />
      )}
    </PageTransition>
    </>
  );
}
