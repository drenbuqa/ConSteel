"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FolderKanban, Users, MapPin } from "lucide-react";

interface Client { id: string; name: string; phone: string | null; email: string | null; }
interface Project { id: string; name: string; location: string | null; status: string; totalPrice: number; client: { name: string }; }
interface Results { clients: Client[]; projects: Project[]; }

function fmt(n: number) {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + " €";
}

const statusLabel: Record<string, { text: string; color: string }> = {
  active:    { text: "Në progres", color: "#16A34A" },
  pending:   { text: "Në pritje",  color: "#D97706" },
  completed: { text: "Përfunduar", color: "#6B7280" },
};

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Results>({ clients: [], projects: [] });
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Open on Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setResults({ clients: [], projects: [] });
      setActiveIdx(0);
    }
  }, [open]);

  // Search with debounce
  useEffect(() => {
    if (query.length < 2) { setResults({ clients: [], projects: [] }); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
        setActiveIdx(0);
      } finally { setLoading(false); }
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  const allItems = [
    ...results.clients.map((c) => ({ type: "client" as const, id: c.id, href: `/klientet/${c.id}`, data: c })),
    ...results.projects.map((p) => ({ type: "project" as const, id: p.id, href: `/projektet/${p.id}`, data: p })),
  ];

  const navigate = useCallback((href: string) => {
    setOpen(false);
    router.push(href);
  }, [router]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, allItems.length - 1)); }
      if (e.key === "ArrowUp")   { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, 0)); }
      if (e.key === "Enter" && allItems[activeIdx]) navigate(allItems[activeIdx].href);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, allItems, activeIdx, navigate]);

  const hasResults = allItems.length > 0;

  return (
    <>
      {/* Trigger button — shown in sidebar */}
      <button
        onClick={() => setOpen(true)}
        style={{
          display: "flex", alignItems: "center", gap: "8px",
          width: "100%", padding: "8px 10px", borderRadius: "8px",
          background: "#F3F4F6", border: "none", cursor: "pointer",
          fontSize: "13px", color: "#6B7280", textAlign: "left",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#E5E7EB"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6"; }}
      >
        <Search size={14} color="#9CA3AF" />
        <span style={{ flex: 1 }}>Kërko...</span>
        <span style={{ fontSize: "10px", color: "#D1D5DB", background: "white", border: "1px solid #E5E7EB", borderRadius: "4px", padding: "1px 5px", fontFamily: "monospace" }}>⌘K</span>
      </button>

      {/* Modal */}
      {open && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "80px 16px 16px", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)" }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{ width: "100%", maxWidth: "560px", background: "white", borderRadius: "14px", boxShadow: "0 24px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", borderBottom: "1px solid #F3F4F6" }}>
              <Search size={18} color="#9CA3AF" style={{ flexShrink: 0 }} />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kërko projekte, klientë, lokacione..."
                style={{ flex: 1, border: "none", outline: "none", fontSize: "15px", color: "#111827", fontFamily: "Inter, sans-serif", background: "transparent" }}
              />
              {query && (
                <button onClick={() => setQuery("")} style={{ background: "#F3F4F6", border: "none", borderRadius: "50%", width: "22px", height: "22px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
                  <X size={12} color="#6B7280" />
                </button>
              )}
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "3px 7px", fontSize: "11px", color: "#9CA3AF", cursor: "pointer", flexShrink: 0, fontFamily: "monospace" }}>ESC</button>
            </div>

            {/* Results */}
            {query.length >= 2 && (
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {loading && (
                  <div style={{ padding: "24px", textAlign: "center", fontSize: "13px", color: "#9CA3AF" }}>Duke kërkuar...</div>
                )}

                {!loading && !hasResults && (
                  <div style={{ padding: "40px 24px", textAlign: "center" }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "4px" }}>Nuk u gjet asgjë</div>
                    <div style={{ fontSize: "13px", color: "#9CA3AF" }}>Provoni me fjalë të tjera</div>
                  </div>
                )}

                {!loading && hasResults && (
                  <>
                    {results.clients.length > 0 && (
                      <div>
                        <div style={{ padding: "10px 16px 4px", fontSize: "10px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>Klientët</div>
                        {results.clients.map((c, i) => {
                          const idx = i;
                          const active = activeIdx === idx;
                          return (
                            <button
                              key={c.id}
                              onClick={() => navigate(`/klientet/${c.id}`)}
                              onMouseEnter={() => setActiveIdx(idx)}
                              style={{
                                display: "flex", alignItems: "center", gap: "12px",
                                width: "100%", padding: "10px 16px", border: "none", textAlign: "left",
                                background: active ? "#F3F4F6" : "transparent",
                                cursor: "pointer", transition: "background 0.1s",
                                borderLeft: active ? "3px solid #111827" : "3px solid transparent",
                              }}
                            >
                              <div style={{ width: "34px", height: "34px", background: "#F3F4F6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Users size={15} color="#6B7280" />
                              </div>
                              <div>
                                <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>{c.name}</div>
                                {(c.phone || c.email) && (
                                  <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "1px" }}>{c.phone || c.email}</div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {results.projects.length > 0 && (
                      <div>
                        <div style={{ padding: "10px 16px 4px", fontSize: "10px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>Projektet</div>
                        {results.projects.map((p, i) => {
                          const idx = results.clients.length + i;
                          const active = activeIdx === idx;
                          const st = statusLabel[p.status] ?? statusLabel.completed;
                          return (
                            <button
                              key={p.id}
                              onClick={() => navigate(`/projektet/${p.id}`)}
                              onMouseEnter={() => setActiveIdx(idx)}
                              style={{
                                display: "flex", alignItems: "center", gap: "12px",
                                width: "100%", padding: "10px 16px", border: "none", textAlign: "left",
                                background: active ? "#F3F4F6" : "transparent",
                                cursor: "pointer", transition: "background 0.1s",
                                borderLeft: active ? "3px solid #111827" : "3px solid transparent",
                              }}
                            >
                              <div style={{ width: "34px", height: "34px", background: "#F3F4F6", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <FolderKanban size={15} color="#6B7280" />
                              </div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <span style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>{p.name}</span>
                                  <span style={{ fontSize: "11px", fontWeight: "600", color: st.color }}>{st.text}</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "1px" }}>
                                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{p.client.name}</span>
                                  {p.location && (
                                    <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#9CA3AF" }}>
                                      <MapPin size={10} /> {p.location}
                                    </span>
                                  )}
                                  <span style={{ fontSize: "12px", color: "#6B7280", fontWeight: "600", marginLeft: "auto" }}>{fmt(p.totalPrice)}</span>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {/* Footer hint */}
                {hasResults && (
                  <div style={{ padding: "8px 16px", borderTop: "1px solid #F3F4F6", display: "flex", gap: "14px", fontSize: "11px", color: "#D1D5DB" }}>
                    <span>↑↓ navigo</span>
                    <span>↵ hap</span>
                    <span>ESC mbyll</span>
                  </div>
                )}
              </div>
            )}

            {/* Empty state (before typing) */}
            {query.length < 2 && (
              <div style={{ padding: "24px 16px", fontSize: "13px", color: "#9CA3AF" }}>
                Shkruani të paktën 2 karaktere për të kërkuar...
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
