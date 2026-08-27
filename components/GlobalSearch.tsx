"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, X, FolderKanban, Users, FileText, ArrowRight, Clock, Loader2,
} from "lucide-react";

interface SearchResult {
  id: string;
  type: "project" | "client" | "report";
  title: string;
  subtitle: string;
  href: string;
  meta?: string;
  status?: string;
}

const STATUS_COLOR: Record<string, string> = {
  active: "#16A34A",
  pending: "#D97706",
  completed: "#9CA3AF",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Në progres",
  pending: "Në pritje",
  completed: "Përfunduar",
};

const RECENT_KEY = "consteel_recent_searches";
const MAX_RECENT = 5;

function getRecent(): string[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; }
}
function addRecent(q: string) {
  const prev = getRecent().filter((r) => r !== q);
  localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, MAX_RECENT)));
}
function clearRecent() {
  localStorage.removeItem(RECENT_KEY);
}

interface Props { onClose: () => void; }

export default function GlobalSearch({ onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(0);
  const [visible, setVisible] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null); // kept for clear-button refocus
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setRecent(getRecent());
    requestAnimationFrame(() => setVisible(true));
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 220);
  }, [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        const items: SearchResult[] = [
          ...(data.projects ?? []).map((p: {id:string;name:string;location:string|null;status:string;totalPrice:number;client:{name:string}}) => ({
            id: p.id, type: "project" as const,
            title: p.name,
            subtitle: p.client.name + (p.location ? ` · ${p.location}` : ""),
            href: `/projektet/${p.id}`,
            status: p.status,
            meta: new Intl.NumberFormat("de-DE").format(p.totalPrice) + " €",
          })),
          ...(data.clients ?? []).map((c: {id:string;name:string;phone:string|null;email:string|null;_count:{projects:number}}) => ({
            id: c.id, type: "client" as const,
            title: c.name,
            subtitle: c.phone ?? c.email ?? "Pa kontakt",
            href: `/klientet/${c.id}`,
            meta: `${c._count.projects} projekte`,
          })),
          ...(data.reports ?? []).map((r: {id:string;title:string;date:string;project:{id:string;name:string}}) => ({
            id: r.id, type: "report" as const,
            title: r.title,
            subtitle: r.project.name,
            href: `/projektet/${r.project.id}?tab=raportet`,
            meta: new Date(r.date).toLocaleDateString("sq-AL", { day: "2-digit", month: "short", year: "numeric" }),
          })),
        ];
        setResults(items);
        setFocused(0);
      } catch { /* silent */ }
      setLoading(false);
    }, 260);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Keyboard nav
  useEffect(() => {
    const list = results.length > 0 ? results : [];
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setFocused((f) => Math.min(f + 1, list.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setFocused((f) => Math.max(f - 1, 0)); }
      if (e.key === "Enter" && list[focused]) navigate(list[focused].href);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [results, focused]);

  const navigate = (href: string) => {
    if (query.trim().length >= 2) addRecent(query.trim());
    setVisible(false);
    setTimeout(() => { onClose(); router.push(href); }, 180);
  };

  const typeIcon = (type: string) => {
    if (type === "project") return <FolderKanban size={15} color="#6B7280" />;
    if (type === "client")  return <Users size={15} color="#6B7280" />;
    return <FileText size={15} color="#6B7280" />;
  };

  const typeLabel = (type: string) =>
    type === "project" ? "Projekt" : type === "client" ? "Klient" : "Raport";

  const grouped = [
    { type: "project", label: "Projektet",  items: results.filter((r) => r.type === "project") },
    { type: "client",  label: "Klientët",   items: results.filter((r) => r.type === "client") },
    { type: "report",  label: "Raportet",   items: results.filter((r) => r.type === "report") },
  ].filter((g) => g.items.length > 0);

  const totalCount = results.length;

  return (
    <>
      <style>{`
        .gs-backdrop { position: fixed; inset: 0; z-index: 300; }
        .gs-panel {
          position: absolute; top: 0; left: 0; right: 0;
          background: white;
          border-radius: 0 0 20px 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.18), 0 4px 16px rgba(0,0,0,0.08);
          display: flex; flex-direction: column;
          max-height: 88dvh; overflow: hidden;
          transition: transform 0.22s cubic-bezier(0.34, 1.1, 0.64, 1), opacity 0.18s ease;
        }
        .gs-item { display: flex; align-items: center; gap: "12px"; cursor: pointer; transition: background 0.1s; }
        .gs-item:hover, .gs-item.gs-focused { background: #F9FAFB; }
        @media (max-width: 768px) { .gs-kbd-hint { display: none !important; } }
        @media (min-width: 769px) {
          .gs-backdrop { display: flex; align-items: flex-start; justify-content: center; padding-top: 80px; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); }
          .gs-panel { position: relative; top: auto; left: auto; right: auto; border-radius: 16px; width: 100%; max-width: 580px; box-shadow: 0 32px 80px rgba(0,0,0,0.22); }
        }
      `}</style>

      <div
        className="gs-backdrop"
        style={{ background: visible ? "rgba(0,0,0,0.28)" : "rgba(0,0,0,0)", backdropFilter: visible ? "blur(3px)" : "none", transition: "background 0.22s, backdrop-filter 0.22s" }}
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      >
        <div
          className="gs-panel"
          style={{ transform: visible ? "translateY(0)" : "translateY(-16px)", opacity: visible ? 1 : 0 }}
        >
          {/* Search input */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 18px", borderBottom: "1px solid #F3F4F6", flexShrink: 0 }}>
            {loading
              ? <Loader2 size={18} color="#9CA3AF" style={{ flexShrink: 0, animation: "spin 0.8s linear infinite" }} />
              : <Search size={18} color={query ? "#111827" : "#9CA3AF"} style={{ flexShrink: 0, transition: "color 0.15s" }} />
            }
            <input
              ref={inputRef}
              autoFocus
              value={query}
              onChange={(e) => { setQuery(e.target.value); setFocused(0); }}
              placeholder="Kërko projekte, klientë, raporte..."
              style={{
                flex: 1, border: "none", outline: "none", fontSize: "16px",
                color: "#111827", background: "transparent",
                fontFamily: "Inter, sans-serif",
              }}
            />
            {query ? (
              <button onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
                style={{ width: "26px", height: "26px", borderRadius: "50%", background: "#E5E7EB", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <X size={12} color="#6B7280" />
              </button>
            ) : (
              <button onClick={close}
                style={{ width: "26px", height: "26px", borderRadius: "6px", background: "#F3F4F6", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <X size={13} color="#374151" />
              </button>
            )}
          </div>

          {/* Results / States */}
          <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" } as React.CSSProperties}>

            {/* Recent searches — shown when input is empty */}
            {!query && recent.length > 0 && (
              <div style={{ padding: "12px 0 8px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px 8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Kërkimet e fundit</span>
                  <button onClick={() => { clearRecent(); setRecent([]); }}
                    style={{ fontSize: "11px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                    Pastro
                  </button>
                </div>
                {recent.map((r) => (
                  <button key={r} onClick={() => setQuery(r)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "10px 18px", background: "none", border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", textAlign: "left" }}>
                    <Clock size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: "14px", color: "#374151" }}>{r}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Empty hint when no query and no recent */}
            {!query && recent.length === 0 && (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <div style={{ width: "48px", height: "48px", background: "#F3F4F6", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <Search size={20} color="#9CA3AF" />
                </div>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Kërko në të gjithë platformën</div>
                <div style={{ fontSize: "13px", color: "#9CA3AF", lineHeight: 1.6 }}>Projekte, klientë dhe raporte — të gjitha në një kërkim.</div>
              </div>
            )}

            {/* No results */}
            {query.length >= 2 && !loading && totalCount === 0 && (
              <div style={{ padding: "40px 24px", textAlign: "center" }}>
                <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Nuk u gjet asgjë</div>
                <div style={{ fontSize: "13px", color: "#9CA3AF" }}>Nuk ka rezultate për &ldquo;{query}&rdquo;</div>
              </div>
            )}

            {/* Grouped results */}
            {grouped.map((group, gi) => {
              let globalIndex = grouped.slice(0, gi).reduce((s, g) => s + g.items.length, 0);
              return (
                <div key={group.type} style={{ paddingBottom: gi < grouped.length - 1 ? "0" : "8px" }}>
                  <div style={{ padding: "12px 18px 6px", fontSize: "11px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {group.label}
                  </div>
                  {group.items.map((item) => {
                    const idx = globalIndex++;
                    const isFocused = focused === idx;
                    return (
                      <button
                        key={item.id}
                        onClick={() => navigate(item.href)}
                        onMouseEnter={() => setFocused(idx)}
                        className={`gs-item${isFocused ? " gs-focused" : ""}`}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: "12px",
                          padding: "10px 18px", background: isFocused ? "#F9FAFB" : "transparent",
                          border: "none", cursor: "pointer", fontFamily: "Inter, sans-serif", textAlign: "left",
                        }}
                      >
                        {/* Icon */}
                        <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {typeIcon(item.type)}
                        </div>

                        {/* Text */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {item.title}
                            </span>
                            {item.status && (
                              <span style={{ fontSize: "10px", fontWeight: "700", color: STATUS_COLOR[item.status], background: item.status === "active" ? "#F0FDF4" : item.status === "pending" ? "#FFFBEB" : "#F3F4F6", padding: "1px 6px", borderRadius: "20px", flexShrink: 0 }}>
                                {STATUS_LABEL[item.status]}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {item.subtitle}
                          </div>
                        </div>

                        {/* Meta */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                          {item.meta && <span style={{ fontSize: "12px", color: "#9CA3AF", fontVariantNumeric: "tabular-nums" }}>{item.meta}</span>}
                          <ArrowRight size={13} color={isFocused ? "#374151" : "#D1D5DB"} style={{ transition: "color 0.1s" }} />
                        </div>
                      </button>
                    );
                  })}
                  {gi < grouped.length - 1 && <div style={{ height: "1px", background: "#F3F4F6", margin: "6px 0" }} />}
                </div>
              );
            })}
          </div>

          {/* Footer hint — keyboard shortcuts, desktop only */}
          {results.length > 0 && (
            <div className="gs-kbd-hint" style={{ borderTop: "1px solid #F3F4F6", padding: "8px 18px", display: "flex", gap: "14px", flexShrink: 0 }}>
              {[["↑↓", "navigo"], ["↵", "hap"], ["Esc", "mbyll"]].map(([key, label]) => (
                <span key={key} style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", color: "#9CA3AF" }}>
                  <kbd style={{ background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: "4px", padding: "1px 5px", fontSize: "10px", fontFamily: "Inter, sans-serif", color: "#374151" }}>{key}</kbd>
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
