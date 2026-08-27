"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Search, Mail, Phone, FolderOpen, X, AlertCircle, Users, MapPin, ArrowRight } from "lucide-react";
import { SkeletonClientGrid, useDelayedLoading } from "@/components/Skeleton";
import PageTransition from "@/components/PageTransition";

interface Client {
  id: string; name: string; phone: string | null; email: string | null;
  address: string | null; createdAt: string;
  _count: { projects: number };
  projects: { totalPrice: number; status: string }[];
}

const AVATAR_PALETTES = [
  { bg: "#F3F4F6", color: "#374151" },
  { bg: "#EFF6FF", color: "#1E40AF" },
  { bg: "#F0FDF4", color: "#166534" },
];
function avatarPalette(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return AVATAR_PALETTES[h % AVATAR_PALETTES.length];
}

function fmt(n: number) {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + " €";
}

// ── Add Client Modal ──────────────────────────────────────────────────────────
function AddClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Client) => void }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => { nameRef.current?.focus(); }, []);

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async () => {
    if (!form.name.trim()) { setErr("Emri i klientit është i detyrueshëm."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/klientet", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        onCreated(await res.json());
      } else {
        setErr("Gabim gjatë ruajtjes. Provoni përsëri.");
      }
    } catch { setErr("Gabim i lidhjes."); }
    setSaving(false);
  };

  const Label = ({ text, required }: { text: string; required?: boolean }) => (
    <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151", marginBottom: "5px" }}>
      {text}{required && <span style={{ color: "#EF4444", marginLeft: "3px" }}>*</span>}
    </label>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", background: "#F9FAFB",
    border: "1px solid #EAECF0", borderRadius: "8px",
    fontSize: "14px", fontFamily: "Inter, sans-serif", color: "#111827", outline: "none",
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px", backdropFilter: "blur(2px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "white", borderRadius: "16px", width: "100%", maxWidth: "460px", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #EAECF0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "36px", height: "36px", background: "#F3F4F6", borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Users size={17} color="#374151" />
            </div>
            <div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>Klient i ri</div>
              <div style={{ fontSize: "12px", color: "#9CA3AF" }}>Shto klient të ri në sistem</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "#F3F4F6", border: "none", borderRadius: "8px", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#E5E7EB"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6"; }}
          >
            <X size={16} color="#6B7280" />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <Label text="Emri i klientit" required />
            <input ref={nameRef} name="name" value={form.name} onChange={set}
              onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
              placeholder="Emri i kompanisë ose personit..."
              style={{ ...inputStyle, borderColor: err ? "#FCA5A5" : "#EAECF0", background: err ? "#FFF5F5" : "#F9FAFB" }}
            />
            {err && (
              <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "5px" }}>
                <AlertCircle size={12} color="#EF4444" />
                <span style={{ fontSize: "12px", color: "#EF4444" }}>{err}</span>
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <Label text="Telefon" />
              <input name="phone" value={form.phone} onChange={set} placeholder="+355 69 XXX XXXX" style={inputStyle} />
            </div>
            <div>
              <Label text="Email" />
              <input name="email" type="email" value={form.email} onChange={set} placeholder="email@example.com" style={inputStyle} />
            </div>
          </div>

          <div>
            <Label text="Adresa" />
            <input name="address" value={form.address} onChange={set} placeholder="Rruga, Qyteti..." style={inputStyle} />
          </div>

          <div>
            <Label text="Shënime" />
            <textarea name="notes" value={form.notes} onChange={set} rows={3}
              placeholder="Shënime shtesë rreth klientit..."
              style={{ ...inputStyle, resize: "vertical", lineHeight: "1.5" }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #EAECF0", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{ padding: "9px 20px", background: "white", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px", fontWeight: "500", color: "#374151", cursor: "pointer", fontFamily: "Inter, sans-serif", transition: "background 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F9FAFB"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
          >
            Anulo
          </button>
          <button
            onClick={submit}
            disabled={saving}
            style={{ padding: "9px 20px", background: saving ? "#6B7280" : "#111827", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", color: "white", cursor: saving ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", gap: "7px", transition: "background 0.15s" }}
            onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; }}
            onMouseLeave={(e) => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = "#111827"; }}
          >
            <Plus size={14} />
            {saving ? "Duke shtuar..." : "Regjistro klientin"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function KlientetPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);
  const [showModal, setShowModal] = useState(searchParams.get("new") === "1");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    fetch(`/api/klientet?${params}`)
      .then((r) => r.json())
      .then(setClients)
      .finally(() => setLoading(false));
  }, [search]);

  const openModal = () => {
    setShowModal(true);
    router.replace("/klientet?new=1", { scroll: false });
  };
  const closeModal = () => {
    setShowModal(false);
    router.replace("/klientet", { scroll: false });
  };

  return (
    <PageTransition>
      {showModal && (
        <AddClientModal
          onClose={closeModal}
          onCreated={(c) => {
            setClients((prev) => [c as unknown as Client, ...prev]);
            closeModal();
            router.push(`/klientet/${c.id}`);
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: 0 }}>Klientët</h1>
          <p style={{ fontSize: "14px", color: "#9CA3AF", margin: "2px 0 0" }}>{clients.length} klientë gjithsej</p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF" }} />
            <input
              type="text" placeholder="Kërko klient..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field" style={{ paddingLeft: "32px", width: "200px" }}
            />
          </div>
          <button onClick={openModal} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Plus size={15} /> Klient i ri
          </button>
        </div>
      </div>

      {/* Grid */}
      {showSkeleton ? (
        <SkeletonClientGrid count={6} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "14px" }}>
          {clients.map((c) => {
            const totalValue     = c.projects.reduce((s, p) => s + p.totalPrice, 0);
            const activeProjects = c.projects.filter((p) => p.status === "active").length;
            const pal            = avatarPalette(c.name);
            return (
              <Link key={c.id} href={`/klientet/${c.id}`} style={{ textDecoration: "none", display: "flex" }}>
                <div
                  className="card client-card"
                  style={{ padding: "18px 20px", transition: "box-shadow 0.18s, transform 0.18s, border-color 0.18s", display: "flex", flexDirection: "column", width: "100%" }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)";
                    el.style.transform = "translateY(-2px)";
                    el.style.borderColor = "#D1D5DB";
                    el.querySelector<HTMLElement>(".client-hint")!.style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = "";
                    el.style.transform = "";
                    el.style.borderColor = "";
                    el.querySelector<HTMLElement>(".client-hint")!.style.opacity = "0";
                  }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: "10px" }}>
                      <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
                      <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: "2px" }}>
                        Regjistruar: {new Date(c.createdAt).toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric" })}
                      </div>
                    </div>
                    <div style={{ width: "38px", height: "38px", background: pal.bg, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "800", color: pal.color, flexShrink: 0, letterSpacing: "-0.5px" }}>
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* Contact details */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px", marginBottom: "14px", flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12.5px", color: c.phone ? "#4B5563" : "#D1D5DB" }}>
                      <Phone size={11} color={c.phone ? "#9CA3AF" : "#D1D5DB"} strokeWidth={2} />
                      {c.phone || "—"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12.5px", color: c.email ? "#4B5563" : "#D1D5DB" }}>
                      <Mail size={11} color={c.email ? "#9CA3AF" : "#D1D5DB"} strokeWidth={2} />
                      {c.email || "—"}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "7px", fontSize: "12.5px", color: c.address ? "#4B5563" : "#D1D5DB" }}>
                      <MapPin size={11} color={c.address ? "#9CA3AF" : "#D1D5DB"} strokeWidth={2} />
                      {c.address || "—"}
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ borderTop: "1px solid #F3F4F6", paddingTop: "11px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <FolderOpen size={12} color="#9CA3AF" />
                      <span style={{ fontSize: "12.5px", color: "#6B7280" }}>
                        {c._count.projects} {c._count.projects === 1 ? "projekt" : "projekte"}
                        {activeProjects > 0 && <span style={{ color: "#16A34A", fontWeight: "600", marginLeft: "4px" }}>({activeProjects} aktive)</span>}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      {totalValue > 0 && (
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>{fmt(totalValue)}</div>
                      )}
                      <div className="client-hint" style={{ opacity: 0, transition: "opacity 0.15s", display: "flex", alignItems: "center", gap: "3px", fontSize: "11.5px", color: "#9CA3AF", whiteSpace: "nowrap" }}>
                        Shiko <ArrowRight size={11} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
          {clients.length === 0 && (
            <div style={{ gridColumn: "1 / -1", padding: "80px 24px", textAlign: "center" }}>
              <div style={{ width: "60px", height: "60px", background: "#F3F4F6", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" }}>
                <Users size={26} color="#9CA3AF" />
              </div>
              <div style={{ fontSize: "17px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>
                {search ? `Nuk u gjet "${search}"` : "Nuk ka klientë ende"}
              </div>
              <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "24px", maxWidth: "320px", margin: "0 auto 24px", lineHeight: 1.7 }}>
                {search
                  ? "Provoni me fjalë të tjera ose pastroni kërkimin për të parë të gjithë klientët."
                  : "Shtoni klientët e kompanisë për të gjurmuar projektet dhe financat sipas klientit."}
              </div>
              {search
                ? <button
                    onClick={() => setSearch("")}
                    className="btn-primary"
                    style={{ display: "inline-flex", transition: "background 0.15s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
                  >
                    Pastro kërkimin
                  </button>
                : <button
                    onClick={openModal}
                    className="btn-primary"
                    style={{ display: "inline-flex", transition: "background 0.15s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
                  >
                    <Plus size={14} /> Shto klientin e parë
                  </button>
              }
            </div>
          )}
        </div>
      )}
    </PageTransition>
  );
}
