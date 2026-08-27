"use client";
import { useEffect, useState } from "react";

// Only show loading UI if data takes longer than `delay` ms.
// For fast responses the skeleton never appears — no jarring flash.
export function useDelayedLoading(loading: boolean, delay = 150): boolean {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!loading) { setShow(false); return; }
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [loading, delay]);
  return show;
}

const SHIMMER = `@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`;
const shimmerStyle = {
  background: "linear-gradient(90deg,#F3F4F6 25%,#E9EAEC 50%,#F3F4F6 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s ease-in-out infinite",
  borderRadius: "5px",
} as React.CSSProperties;

function Line({ w = "100%", h = "13px" }: { w?: string; h?: string }) {
  return <div style={{ ...shimmerStyle, width: w, height: h }} />;
}

// ── Projects list table skeleton ───────────────────────────────────────────────
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  const cols = [
    { w: "44%", h: "15px" }, { w: "18%", h: "13px" }, { w: "10%", h: "13px" },
    { w: "16%", h: "13px" }, { w: "14%", h: "20px" }, { w: "12%", h: "13px" }, { w: "6%", h: "13px" },
  ];
  return (
    <>
      <style>{SHIMMER}</style>
      <div>
        <div style={{ display: "flex", gap: "16px", padding: "11px 16px", background: "#F9FAFB", borderBottom: "1px solid #EAECF0" }}>
          {cols.map((c, i) => <Line key={i} w={c.w} h="10px" />)}
        </div>
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} style={{ display: "flex", gap: "16px", padding: "16px 16px", borderBottom: r < rows - 1 ? "1px solid #F3F4F6" : "none", alignItems: "center" }}>
            {cols.map((c, i) => <Line key={i} w={c.w} h={c.h} />)}
          </div>
        ))}
      </div>
    </>
  );
}

// ── Client list card grid skeleton ────────────────────────────────────────────
export function SkeletonClientGrid({ count = 6 }: { count?: number }) {
  return (
    <>
      <style>{SHIMMER}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ ...shimmerStyle, width: "44px", height: "44px", borderRadius: "10px", flexShrink: 0 }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "7px" }}>
                <Line w="65%" h="15px" />
                <Line w="40%" h="11px" />
              </div>
            </div>
            <div style={{ height: "1px", background: "#F3F4F6" }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px" }}>
              {[0, 1, 2].map((j) => (
                <div key={j} style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <Line w="60%" h="10px" />
                  <Line w="80%" h="14px" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Project detail page skeleton ───────────────────────────────────────────────
export function SkeletonProjectDetail() {
  return (
    <>
      <style>{SHIMMER}</style>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <Line w="80px" h="13px" />
        <Line w="4px" h="13px" />
        <Line w="120px" h="13px" />
      </div>

      {/* Header card */}
      <div className="card" style={{ padding: "24px 28px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1 }}>
            <div style={{ ...shimmerStyle, width: "52px", height: "52px", borderRadius: "12px", flexShrink: 0 }} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
              <Line w="45%" h="22px" />
              <div style={{ display: "flex", gap: "14px" }}>
                <Line w="100px" h="12px" />
                <Line w="80px" h="12px" />
                <Line w="90px" h="12px" />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <div style={{ ...shimmerStyle, width: "100px", height: "36px", borderRadius: "9px" }} />
            <div style={{ ...shimmerStyle, width: "72px", height: "36px", borderRadius: "9px" }} />
          </div>
        </div>
      </div>

      {/* 3 stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", marginBottom: "20px" }}>
        {[0, 1, 2].map((i) => (
          <div key={i} className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ height: "3px", ...shimmerStyle, borderRadius: "3px 3px 0 0", marginTop: "-20px", marginLeft: "-20px", marginRight: "-20px", width: "calc(100% + 40px)" }} />
            <Line w="55%" h="11px" />
            <Line w="70%" h="26px" />
            <Line w="85%" h="11px" />
          </div>
        ))}
      </div>

      {/* Tabs + content */}
      <div style={{ display: "flex", gap: "0", marginBottom: "16px", borderBottom: "2px solid #EAECF0" }}>
        {["Përmbledhje", "Shpenzimet", "Raportet"].map((t, i) => (
          <div key={t} style={{ padding: "10px 18px" }}>
            <Line w={`${50 + i * 10}px`} h="13px" />
          </div>
        ))}
      </div>
      <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <Line w="40%" h="16px" />
        <Line w="100%" />
        <Line w="95%" />
        <Line w="80%" />
        <Line w="60%" />
      </div>
    </>
  );
}

// ── Client detail page skeleton ────────────────────────────────────────────────
export function SkeletonClientDetail() {
  return (
    <>
      <style>{SHIMMER}</style>
      {/* Breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
        <Line w="70px" h="13px" />
        <Line w="4px" h="13px" />
        <Line w="130px" h="13px" />
      </div>

      {/* Hero card */}
      <div className="card" style={{ marginBottom: "16px", overflow: "hidden" }}>
        <div style={{ height: "4px", ...shimmerStyle }} />
        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "20px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <div style={{ ...shimmerStyle, width: "64px", height: "64px", borderRadius: "50%", flexShrink: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <Line w="180px" h="22px" />
                <div style={{ display: "flex", gap: "16px" }}>
                  <Line w="110px" h="12px" />
                  <Line w="140px" h="12px" />
                  <Line w="100px" h="12px" />
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <div style={{ ...shimmerStyle, width: "90px", height: "36px", borderRadius: "9px" }} />
              <div style={{ ...shimmerStyle, width: "64px", height: "36px", borderRadius: "9px" }} />
            </div>
          </div>
          <div style={{ height: "1px", background: "#F3F4F6", margin: "0 -28px 20px" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0" }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{ padding: "0 20px", borderRight: i < 3 ? "1px solid #F3F4F6" : "none", display: "flex", flexDirection: "column", gap: "7px" }}>
                <Line w="55%" h="10px" />
                <Line w="70%" h="22px" />
                <Line w="45%" h="10px" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projects table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Line w="160px" h="15px" />
          <div style={{ ...shimmerStyle, width: "110px", height: "34px", borderRadius: "8px" }} />
        </div>
        {[0, 1, 2].map((r) => (
          <div key={r} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 130px 80px", gap: "0", padding: "16px 24px", borderBottom: r < 2 ? "1px solid #F3F4F6" : "none", alignItems: "center" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Line w="55%" h="14px" />
              <Line w="35%" h="11px" />
            </div>
            <Line w="70%" h="13px" />
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <Line w="65%" h="13px" />
              <Line w="40%" h="10px" />
            </div>
            <Line w="40%" h="13px" />
            <div style={{ ...shimmerStyle, width: "68px", height: "22px", borderRadius: "20px" }} />
            <Line w="50%" h="13px" />
          </div>
        ))}
      </div>
    </>
  );
}

// Legacy — kept for any other usage
export function SkeletonCard() {
  return (
    <>
      <style>{SHIMMER}</style>
      <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <Line w="55%" h="16px" />
        <Line />
        <Line w="90%" />
        <Line w="75%" />
      </div>
    </>
  );
}
