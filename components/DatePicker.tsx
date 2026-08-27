"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";

const MONTHS_AL = ["Janar","Shkurt","Mars","Prill","Maj","Qershor","Korrik","Gusht","Shtator","Tetor","Nëntor","Dhjetor"];
const DAYS_AL   = ["H","M","M","E","P","Sh","D"];

export default function DatePicker({ value, onChange, placeholder, minDate, dropUp }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minDate?: string;
  dropUp?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"days" | "months" | "years">("days");
  const ref = useRef<HTMLDivElement>(null);
  const today = new Date();

  const parsed = value ? new Date(value + "T12:00:00") : null;
  const [view, setView] = useState(() => parsed ?? new Date(today.getFullYear(), today.getMonth(), 1));

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setMode("days");
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // ── Days mode helpers ──
  const firstDay = new Date(view.getFullYear(), view.getMonth(), 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const daysInPrev  = new Date(view.getFullYear(), view.getMonth(), 0).getDate();
  const cells: { day: number; month: "prev" | "cur" | "next" }[] = [];
  for (let i = startOffset - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, month: "prev" });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, month: "cur" });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - daysInMonth - startOffset + 1, month: "next" });

  const minParsed = minDate ? new Date(minDate + "T12:00:00") : null;
  const isDisabled = (d: number) => {
    if (!minParsed) return false;
    const cell = new Date(view.getFullYear(), view.getMonth(), d);
    return cell < new Date(minParsed.getFullYear(), minParsed.getMonth(), minParsed.getDate());
  };
  const isSel = (d: number) =>
    parsed && parsed.getDate() === d && parsed.getMonth() === view.getMonth() && parsed.getFullYear() === view.getFullYear();
  const isToday = (d: number) =>
    today.getDate() === d && today.getMonth() === view.getMonth() && today.getFullYear() === view.getFullYear();

  const selectDay = (d: number) => {
    const m = String(view.getMonth() + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    onChange(`${view.getFullYear()}-${m}-${dd}`);
    setOpen(false);
    setMode("days");
  };

  // ── Years grid ──
  const yearBase = Math.floor(view.getFullYear() / 12) * 12;
  const years = Array.from({ length: 12 }, (_, i) => yearBase + i);

  const displayValue = parsed
    ? `${parsed.getDate()} ${MONTHS_AL[parsed.getMonth()]} ${parsed.getFullYear()}`
    : "";

  const headerLabel =
    mode === "days"   ? `${MONTHS_AL[view.getMonth()]} ${view.getFullYear()}` :
    mode === "months" ? `${view.getFullYear()}` :
    `${years[0]} – ${years[years.length - 1]}`;

  const handleHeaderClick = () => {
    if (mode === "days")   setMode("months");
    else if (mode === "months") setMode("years");
  };

  const handlePrev = () => {
    if (mode === "days")   setView(new Date(view.getFullYear(), view.getMonth() - 1, 1));
    else if (mode === "months") setView(new Date(view.getFullYear() - 1, view.getMonth(), 1));
    else setView(new Date(view.getFullYear() - 12, view.getMonth(), 1));
  };
  const handleNext = () => {
    if (mode === "days")   setView(new Date(view.getFullYear(), view.getMonth() + 1, 1));
    else if (mode === "months") setView(new Date(view.getFullYear() + 1, view.getMonth(), 1));
    else setView(new Date(view.getFullYear() + 12, view.getMonth(), 1));
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <style>{`@media (max-width: 768px) { .dp-btn { padding: 13px 13px 13px 38px !important; font-size: 15px !important; } }`}</style>
      <button
        type="button"
        className="dp-btn"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 13px 10px 36px", background: "white",
          border: `1.5px solid ${open ? "#111827" : "#E5E7EB"}`,
          borderRadius: open ? (dropUp ? "0 0 9px 9px" : "9px 9px 0 0") : "9px",
          cursor: "pointer", fontSize: "14px",
          color: displayValue ? "#111827" : "#9CA3AF",
          fontFamily: "Inter, sans-serif", textAlign: "left",
          boxShadow: open ? "0 0 0 3px rgba(17,24,39,0.06)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
        }}
      >
        <Calendar size={14} color={open ? "#111827" : "#9CA3AF"} style={{ position: "absolute", left: "12px" }} />
        <span style={{ flex: 1 }}>{displayValue || placeholder || "Zgjidh datën..."}</span>
        {value
          ? <X size={13} color="#9CA3AF" style={{ flexShrink: 0 }} onClick={(e) => { e.stopPropagation(); onChange(""); }} />
          : <ChevronDown size={13} color="#9CA3AF" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        }
      </button>

      {open && (
        <>
        <style>{`@media (max-width: 768px) { .dp-cal { left: 0 !important; right: 0 !important; min-width: unset !important; } }`}</style>
        <div className="dp-cal" style={{
          position: "absolute",
          ...(dropUp ? { bottom: "100%" } : { top: "100%" }),
          left: 0, zIndex: 1100, minWidth: "252px",
          background: "white", border: "1.5px solid #111827",
          ...(dropUp ? { borderBottom: "none", borderRadius: "10px 10px 0 0" } : { borderTop: "none", borderRadius: "0 0 10px 10px" }),
          boxShadow: "0 10px 32px rgba(0,0,0,0.13)",
          padding: "12px",
        }}>
          {/* Navigation header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
            <button type="button" onClick={handlePrev} style={{ background: "#F3F4F6", border: "none", borderRadius: "6px", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <ChevronLeft size={13} color="#374151" />
            </button>
            <button
              type="button"
              onClick={handleHeaderClick}
              style={{
                background: "none", border: "none", cursor: mode === "years" ? "default" : "pointer",
                fontSize: "13px", fontWeight: "700", color: "#111827",
                display: "flex", alignItems: "center", gap: "4px",
                padding: "3px 8px", borderRadius: "6px",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { if (mode !== "years") (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
            >
              {headerLabel}
              {mode !== "years" && <ChevronDown size={11} color="#9CA3AF" />}
            </button>
            <button type="button" onClick={handleNext} style={{ background: "#F3F4F6", border: "none", borderRadius: "6px", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <ChevronRight size={13} color="#374151" />
            </button>
          </div>

          {/* ── Days view ── */}
          {mode === "days" && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", marginBottom: "4px" }}>
                {DAYS_AL.map((d, i) => (
                  <div key={i} style={{ textAlign: "center", fontSize: "10px", fontWeight: "600", color: "#9CA3AF", padding: "3px 0" }}>{d}</div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px" }}>
                {cells.map((c, i) => {
                  const cur = c.month === "cur";
                  const dis = cur && isDisabled(c.day);
                  const sel = cur && !dis && !!isSel(c.day);
                  const tod = cur && isToday(c.day);
                  const clickable = cur && !dis;
                  return (
                    <button
                      key={i} type="button" disabled={!clickable}
                      onClick={() => clickable && selectDay(c.day)}
                      style={{
                        width: "100%", aspectRatio: "1", borderRadius: "50%", border: "none",
                        background: sel ? "#111827" : "transparent",
                        color: sel ? "white" : dis ? "#D1D5DB" : cur ? "#111827" : "#D1D5DB",
                        fontSize: "12px", fontWeight: sel || tod ? "700" : "400",
                        cursor: clickable ? "pointer" : "default",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontFamily: "Inter, sans-serif", transition: "background 0.1s",
                        outline: tod && !sel && !dis ? "2px solid #111827" : "none",
                        outlineOffset: "-2px",
                        opacity: dis ? 0.4 : 1,
                      }}
                      onMouseEnter={(e) => { if (clickable && !sel) (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6"; }}
                      onMouseLeave={(e) => { if (clickable && !sel) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                      {c.day}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #F3F4F6", textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => {
                    const t = new Date();
                    setView(new Date(t.getFullYear(), t.getMonth(), 1));
                    selectDay(t.getDate());
                  }}
                  style={{ fontSize: "12px", color: "#374151", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", fontWeight: "600" }}
                >
                  Sot
                </button>
              </div>
            </>
          )}

          {/* ── Months view ── */}
          {mode === "months" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
              {MONTHS_AL.map((m, i) => {
                const isCurMonth = parsed && parsed.getMonth() === i && parsed.getFullYear() === view.getFullYear();
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setView(new Date(view.getFullYear(), i, 1));
                      setMode("days");
                    }}
                    style={{
                      padding: "8px 4px", border: "none", borderRadius: "8px", cursor: "pointer",
                      background: isCurMonth ? "#111827" : "transparent",
                      color: isCurMonth ? "white" : "#111827",
                      fontSize: "12px", fontWeight: isCurMonth ? "700" : "500",
                      fontFamily: "Inter, sans-serif", transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => { if (!isCurMonth) (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6"; }}
                    onMouseLeave={(e) => { if (!isCurMonth) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    {m}
                  </button>
                );
              })}
            </div>
          )}

          {/* ── Years view ── */}
          {mode === "years" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px" }}>
              {years.map((y) => {
                const isCurYear = parsed && parsed.getFullYear() === y;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setView(new Date(y, view.getMonth(), 1));
                      setMode("months");
                    }}
                    style={{
                      padding: "8px 4px", border: "none", borderRadius: "8px", cursor: "pointer",
                      background: isCurYear ? "#111827" : "transparent",
                      color: isCurYear ? "white" : "#111827",
                      fontSize: "12px", fontWeight: isCurYear ? "700" : "500",
                      fontFamily: "Inter, sans-serif", transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => { if (!isCurYear) (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6"; }}
                    onMouseLeave={(e) => { if (!isCurYear) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        </>
      )}
    </div>
  );
}
