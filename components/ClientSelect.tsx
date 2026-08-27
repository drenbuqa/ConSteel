"use client";

import { useState, useRef, useEffect } from "react";
import { Users, ChevronDown, Search, CheckCircle2, Plus, AlertCircle, X } from "lucide-react";

export interface ClientOption { id: string; name: string; }

// ─── Quick-add modal ──────────────────────────────────────────────────────────
function QuickAddModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: (c: ClientOption) => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const submit = async () => {
    if (!name.trim()) { setErr("Shkruani emrin e klientit."); return; }
    setSaving(true);
    const res = await fetch("/api/klientet", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) { onCreated(await res.json()); }
    else setErr("Gabim gjatë krijimit. Provoni përsëri.");
    setSaving(false);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "white", borderRadius: "14px", width: "100%", maxWidth: "360px", padding: "24px", boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>Klient i ri</div>
            <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>Do të shtohet direkt në listë</div>
          </div>
          <button onClick={onClose} style={{ background: "#F3F4F6", border: "none", borderRadius: "7px", width: "30px", height: "30px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#E5E7EB"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6"; }}
          >
            <X size={15} color="#6B7280" />
          </button>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>
            Emri i klientit <span style={{ color: "#EF4444" }}>*</span>
          </label>
          <input
            ref={inputRef} value={name}
            onChange={(e) => { setName(e.target.value); setErr(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") onClose(); }}
            placeholder="p.sh. Ndërtim Shqipëria SH.A."
            style={{ width: "100%", padding: "10px 12px", border: `1px solid ${err ? "#FCA5A5" : "#EAECF0"}`, borderRadius: "8px", fontSize: "14px", fontFamily: "Inter, sans-serif", background: err ? "#FFF5F5" : "#F9FAFB", outline: "none", color: "#111827", boxSizing: "border-box" } as React.CSSProperties}
          />
          {err && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "5px" }}>
              <AlertCircle size={12} color="#EF4444" />
              <span style={{ fontSize: "12px", color: "#EF4444" }}>{err}</span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "9px", background: "white", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px", fontWeight: "500", color: "#374151", cursor: "pointer", fontFamily: "Inter, sans-serif" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F9FAFB"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
          >Anulo</button>
          <button onClick={submit} disabled={saving}
            style={{ flex: 1, padding: "9px", background: saving ? "#6B7280" : "#111827", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", color: "white", cursor: saving ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
            onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; }}
            onMouseLeave={(e) => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = "#111827"; }}
          >
            <Plus size={14} />{saving ? "Duke shtuar..." : "Shto klientin"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ClientSelect ─────────────────────────────────────────────────────────────
export default function ClientSelect({ clients, value, onChange, onClientAdded, error }: {
  clients: ClientOption[];
  value: string;
  onChange: (id: string) => void;
  onClientAdded: (c: ClientOption) => void;
  error?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = clients.find((c) => c.id === value);
  const filtered = clients.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const borderColor = error ? "#FCA5A5" : open ? "#111827" : "#E5E7EB";

  return (
    <>
      <div ref={ref} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          style={{
            width: "100%", display: "flex", alignItems: "center",
            padding: "10px 13px 10px 36px",
            background: error ? "#FFF5F5" : "white",
            border: `1.5px solid ${borderColor}`,
            borderRadius: open ? "9px 9px 0 0" : "9px",
            cursor: "pointer", fontSize: "14px",
            color: selected ? "#111827" : "#9CA3AF",
            fontFamily: "Inter, sans-serif", textAlign: "left",
            boxShadow: open ? "0 0 0 3px rgba(17,24,39,0.06)" : "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
        >
          <Users size={14} color={error ? "#EF4444" : "#9CA3AF"} style={{ position: "absolute", left: "12px" }} />
          <span style={{ flex: 1 }}>{selected ? selected.name : "Zgjidhni klientin..."}</span>
          <ChevronDown size={14} color="#9CA3AF" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>

        {open && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
            background: "white", border: "1.5px solid #111827", borderTop: "none",
            borderRadius: "0 0 10px 10px", boxShadow: "0 10px 28px rgba(0,0,0,0.13)",
          }}>
            {/* Search */}
            <div style={{ padding: "8px 10px", borderBottom: "1px solid #F3F4F6" }}>
              <div style={{ position: "relative" }}>
                <Search size={13} color="#9CA3AF" style={{ position: "absolute", left: "9px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  autoFocus placeholder="Kërko klient..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  style={{ width: "100%", padding: "7px 10px 7px 28px", border: "1px solid #EAECF0", borderRadius: "6px", fontSize: "13px", fontFamily: "Inter, sans-serif", outline: "none", background: "#F9FAFB", boxSizing: "border-box" } as React.CSSProperties}
                />
              </div>
            </div>

            {/* List */}
            <div style={{ maxHeight: "200px", overflowY: "auto" }}>
              {filtered.length === 0 ? (
                <div style={{ padding: "14px 16px", textAlign: "center" }}>
                  <p style={{ fontSize: "13px", color: "#6B7280", margin: "0 0 10px" }}>
                    {search ? `Nuk u gjet "${search}"` : "Nuk ka klientë"}
                  </p>
                  <button type="button" onClick={() => { setOpen(false); setShowModal(true); }}
                    style={{ fontSize: "13px", color: "white", background: "#111827", border: "1px solid #111827", borderRadius: "7px", padding: "6px 14px", cursor: "pointer", fontFamily: "Inter, sans-serif", fontWeight: "600" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1F2937"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#111827"; }}
                  >
                    + Krijo {search ? `"${search}"` : "klient të ri"}
                  </button>
                </div>
              ) : (
                filtered.map((c) => (
                  <button key={c.id} type="button"
                    onClick={() => { onChange(c.id); setOpen(false); setSearch(""); }}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", background: c.id === value ? "#F9FAFB" : "transparent", border: "none", cursor: "pointer", fontSize: "14px", color: "#111827", fontFamily: "Inter, sans-serif", textAlign: "left" }}
                    onMouseEnter={(e) => { if (c.id !== value) (e.currentTarget as HTMLButtonElement).style.background = "#F9FAFB"; }}
                    onMouseLeave={(e) => { if (c.id !== value) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700", color: "#6B7280", flexShrink: 0 }}>
                      {c.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ flex: 1 }}>{c.name}</span>
                    {c.id === value && <CheckCircle2 size={14} color="#16A34A" />}
                  </button>
                ))
              )}
            </div>

            {filtered.length > 0 && (
              <div style={{ padding: "8px 14px", borderTop: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{filtered.length} klient{filtered.length !== 1 ? "ë" : ""}</span>
                <button type="button" onClick={() => { setOpen(false); setShowModal(true); }}
                  style={{ fontSize: "12px", color: "#374151", background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: "6px", padding: "4px 10px", cursor: "pointer", fontFamily: "Inter, sans-serif", fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#E5E7EB"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6"; }}
                >
                  <Plus size={12} /> Klient i ri
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showModal && (
        <QuickAddModal
          onClose={() => setShowModal(false)}
          onCreated={(c) => { onClientAdded(c); onChange(c.id); setShowModal(false); }}
        />
      )}
    </>
  );
}
