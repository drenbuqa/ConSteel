"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit2, Trash2, X, Check,
  Phone, Mail, MapPin, FolderKanban,
  FileText, Users, Calendar,
  Plus, ChevronRight, TrendingUp, User,
} from "lucide-react";
import Modal from "@/components/Modal";
import { SkeletonClientDetail, useDelayedLoading } from "@/components/Skeleton";
import PageTransition from "@/components/PageTransition";
import { useSetPageTitle } from "@/contexts/PageTitle";

interface Project {
  id: string;
  name: string;
  status: string;
  totalPrice: number;
  totaliShpenzimeve: number;
  workers: number;
  startDate: string | null;
  endDate: string | null;
  location: string | null;
}

interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  createdAt: string;
  projects: Project[];
}

function fmt(n: number) {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + " €";
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
    active:    { label: "Në progres", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", dot: "#22C55E" },
    pending:   { label: "Në pritje",  color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B" },
    completed: { label: "Përfunduar", color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB", dot: "#9CA3AF" },
  };
  const s = map[status] || map.completed;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "3px 10px", borderRadius: "20px", background: s.bg, border: `1px solid ${s.border}`, fontSize: "12px", fontWeight: "600", color: s.color, whiteSpace: "nowrap" }}>
      <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: s.dot }} />
      {s.label}
    </span>
  );
}

/* ── Shared input style (matches project drawer) ── */
const inputBase: React.CSSProperties = {
  width: "100%", padding: "10px 13px", border: "1.5px solid #E5E7EB",
  borderRadius: "9px", fontSize: "14px", color: "#111827", background: "white",
  outline: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function FLabel({ text }: { text: string }) {
  return (
    <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6B7280", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
      {text}
    </label>
  );
}

function FInput({ label, name, value, onChange, type = "text", placeholder, icon }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; placeholder?: string; icon?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <FLabel text={label} />
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", display: "flex" }}>
            {icon}
          </span>
        )}
        <input
          name={name} type={type} value={value} onChange={onChange}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...inputBase,
            paddingLeft: icon ? "36px" : "13px",
            borderColor: focused ? "#111827" : "#E5E7EB",
            boxShadow: focused ? "0 0 0 3px rgba(17,24,39,0.06)" : "none",
          }}
        />
      </div>
    </div>
  );
}

function FTextarea({ label, name, value, onChange, placeholder, rows = 4 }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string; rows?: number;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <FLabel text={label} />
      <textarea
        name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputBase, resize: "vertical",
          borderColor: focused ? "#111827" : "#E5E7EB",
          boxShadow: focused ? "0 0 0 3px rgba(17,24,39,0.06)" : "none",
        } as React.CSSProperties}
      />
    </div>
  );
}

function SectionDivider({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #F3F4F6" }}>
      <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <span style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>{title}</span>
    </div>
  );
}

/* ── Edit Drawer ── */
function EditDrawer({ form, saving, onClose, onSave, onChange }: {
  form: { name: string; phone: string; email: string; address: string; notes: string };
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: string, value: string) => void;
}) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const makeHandler = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange(field, e.target.value);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 40, backdropFilter: "blur(2px)" }} />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "min(480px, 100vw)",
        background: "white", zIndex: 50, display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#111827" }}>Ndrysho klientin</div>
            <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>Të gjitha ndryshimet ruhen me butonin e poshtëm</div>
          </div>
          <button onClick={onClose}
            style={{ width: "32px", height: "32px", background: "#F3F4F6", border: "none", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#E5E7EB"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6"; }}
          >
            <X size={16} color="#6B7280" />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>

          {/* Identity */}
          <div>
            <SectionDivider icon={<User size={14} color="#6B7280" />} title="Identiteti" />
            <FInput
              label="Emri i klientit"
              name="name"
              value={form.name}
              onChange={makeHandler("name")}
              placeholder="p.sh. Ndërtim Albania SH.A."
            />
          </div>

          {/* Contact */}
          <div>
            <SectionDivider icon={<Phone size={14} color="#6B7280" />} title="Kontakti" />
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <FInput
                label="Numri i telefonit"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={makeHandler("phone")}
                placeholder="+355 6X XXX XXXX"
                icon={<Phone size={13} color="#9CA3AF" />}
              />
              <FInput
                label="Adresa e email-it"
                name="email"
                type="email"
                value={form.email}
                onChange={makeHandler("email")}
                placeholder="kontakt@kompania.al"
                icon={<Mail size={13} color="#9CA3AF" />}
              />
              <FInput
                label="Adresa fizike"
                name="address"
                value={form.address}
                onChange={makeHandler("address")}
                placeholder="p.sh. Tiranë, Rruga e Elbasanit"
                icon={<MapPin size={13} color="#9CA3AF" />}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <SectionDivider icon={<FileText size={14} color="#6B7280" />} title="Shënime" />
            <FTextarea
              label="Shënime shtesë"
              name="notes"
              value={form.notes}
              onChange={makeHandler("notes")}
              placeholder="Informacione shtesë rreth klientit, kushtet e bashkëpunimit, etj..."
              rows={5}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #F3F4F6", display: "flex", gap: "10px", flexShrink: 0, background: "white" }}>
          <button onClick={onClose}
            style={{ flex: 1, padding: "11px", background: "white", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", fontWeight: "600", color: "#374151", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F9FAFB"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
          >
            Anulo
          </button>
          <button onClick={onSave} disabled={saving}
            style={{ flex: 2, padding: "11px", background: saving ? "#4B5563" : "#111827", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", color: "white", cursor: saving ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", transition: "background 0.15s" }}
            onMouseEnter={(e) => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; }}
            onMouseLeave={(e) => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = "#111827"; }}
          >
            {saving ? (
              <><span style={{ width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} /> Duke ruajtur...</>
            ) : (
              <><Check size={14} /> Ruaj ndryshimet</>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", notes: "" });

  useSetPageTitle(client?.name ?? null);

  const fetchClient = useCallback(async () => {
    const res = await fetch(`/api/klientet/${id}`);
    if (res.ok) {
      const data = await res.json();
      setClient(data);
      setForm({ name: data.name, phone: data.phone || "", email: data.email || "", address: data.address || "", notes: data.notes || "" });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => { fetchClient(); }, [fetchClient]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/klientet/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) { await fetchClient(); setEditOpen(false); }
    setSaving(false);
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/klientet/${id}`, { method: "DELETE" });
    if (res.ok) router.push("/klientet");
  };

  if (loading) return showSkeleton ? <SkeletonClientDetail /> : null;
  if (!client) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" }}>
      <div style={{ width: "64px", height: "64px", background: "#FEF2F2", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
        <Users size={28} color="#EF4444" />
      </div>
      <div style={{ fontSize: "18px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>Klienti nuk u gjet</div>
      <div style={{ fontSize: "14px", color: "#9CA3AF", marginBottom: "28px", maxWidth: "340px", lineHeight: 1.6 }}>
        Ky klient nuk ekziston ose është fshirë. Kthehuni tek lista e klientëve.
      </div>
      <a href="/klientet" style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 22px", background: "#111827", color: "white", borderRadius: "10px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
        ← Kthehu tek klientët
      </a>
    </div>
  );

  const totalValue = client.projects.reduce((s, p) => s + p.totalPrice, 0);
  const totalExpenses = client.projects.reduce((s, p) => s + p.totaliShpenzimeve, 0);
  const activeProjects = client.projects.filter((p) => p.status === "active");
  const initials = client.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .proj-row { transition: background 0.12s; cursor: pointer; }
        .proj-row:hover { background: #F9FAFB !important; }
        .proj-row:hover .open-chip { opacity: 1 !important; }
        .open-chip { opacity: 0; transition: opacity 0.15s; }
        .stats-bar { display: grid; grid-template-columns: repeat(4, 1fr); }
        .cd-breadcrumb  { display: flex; }
        .cd-hero-desktop { display: block; }
        .cd-hero-mobile  { display: none; }
        @media (max-width: 640px) {
          .stats-bar { grid-template-columns: repeat(2, 1fr); }
          .stats-bar > div { border-left: none !important; border-top: 1px solid #F3F4F6; }
        }
        .client-proj-table { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 130px 80px; }
        @media (max-width: 768px) {
          .cd-breadcrumb   { display: none !important; }
          .cd-hero-desktop { display: none !important; }
          .cd-hero-mobile  { display: block !important; }
          .client-proj-table { grid-template-columns: 2fr 1fr 1fr; }
          .client-proj-table .hide-mobile { display: none !important; }
        }
      `}</style>

      <PageTransition>
      {/* Breadcrumb — hidden on mobile */}
      <div className="cd-breadcrumb" style={{ alignItems: "center", gap: "6px", marginBottom: "20px" }}>
        <Link href="/klientet" className="breadcrumb-link" style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#9CA3AF", fontWeight: "500" }}>
          <ArrowLeft size={13} /> Klientët
        </Link>
        <ChevronRight size={13} color="#D1D5DB" />
        <span style={{ fontSize: "13px", color: "#374151", fontWeight: "600" }}>{client.name}</span>
      </div>

      {/* ── Desktop hero ── */}
      <div className="cd-hero-desktop">
      <div style={{ borderRadius: "16px", marginBottom: "16px", overflow: "hidden", border: "1px solid #EAECF0", background: "white", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
        <div style={{ height: "4px", background: "#111827" }} />

        <div style={{ padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "20px", flexWrap: "wrap" }}>

            {/* Identity */}
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.18)" }}>
                <span style={{ fontSize: "22px", fontWeight: "700", color: "white" }}>{initials}</span>
              </div>
              <div>
                <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 6px" }}>{client.name}</h1>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                  {client.phone && (
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#6B7280" }}>
                      <Phone size={12} /> {client.phone}
                    </span>
                  )}
                  {client.email && (
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#6B7280" }}>
                      <Mail size={12} /> {client.email}
                    </span>
                  )}
                  {client.address && (
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#6B7280" }}>
                      <MapPin size={12} /> {client.address}
                    </span>
                  )}
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>
                    Klient që nga {new Date(client.createdAt).toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
              <button
                onClick={() => setEditOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "10px", background: "#111827", border: "none", fontSize: "13px", fontWeight: "600", color: "white", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#111827"; }}
              >
                <Edit2 size={13} /> Ndrysho
              </button>
              <button
                onClick={() => setDeleteConfirm(true)}
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "9px 18px", borderRadius: "10px", background: "white", border: "1px solid #EAECF0", fontSize: "13px", fontWeight: "600", color: "#DC2626", cursor: "pointer", transition: "background 0.15s, border-color 0.15s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FEF2F2"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#FECACA"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "white"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#EAECF0"; }}
              >
                <Trash2 size={13} /> Fshi
              </button>
            </div>
          </div>

          {/* Notes display */}
          {client.notes && (
            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #F3F4F6", display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <FileText size={14} color="#9CA3AF" style={{ flexShrink: 0, marginTop: "2px" }} />
              <span style={{ fontSize: "13px", color: "#6B7280", lineHeight: "1.6" }}>{client.notes}</span>
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="stats-bar" style={{ borderTop: "1px solid #F3F4F6" }}>
          {[
            { label: "Projekte gjithsej", value: client.projects.length, color: "#111827", sub: "totale" },
            { label: "Projekte aktive",   value: activeProjects.length,  color: "#16A34A", sub: `${client.projects.filter(p => p.status === "pending").length} në pritje` },
            { label: "Vlera e kontratave", value: fmt(totalValue), color: "#111827", sub: "totale" },
            { label: "Shpenzime totale",  value: fmt(totalExpenses), color: totalExpenses > totalValue ? "#DC2626" : "#374151", sub: totalValue > 0 ? `${Math.round((totalExpenses / totalValue) * 100)}% e vlerës` : "—" },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: "16px 24px", borderLeft: i > 0 ? "1px solid #F3F4F6" : "none" }}>
              <div style={{ fontSize: "11px", fontWeight: "600", color: "#9CA3AF", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: "4px" }}>{s.label}</div>
              <div style={{ fontSize: "20px", fontWeight: "700", color: s.color, lineHeight: 1.1 }}>{s.value}</div>
              <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "3px" }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
      </div>{/* end cd-hero-desktop */}

      {/* ── Mobile hero ── */}
      <div className="cd-hero-mobile" style={{ marginBottom: "14px" }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ height: "3px", background: "#111827" }} />
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "white" }}>{initials}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontSize: "17px", fontWeight: "700", color: "#111827", margin: 0, lineHeight: 1.2 }}>{client.name}</h1>
                <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>
                  Klient që nga {new Date(client.createdAt).toLocaleDateString("sq-AL", { month: "long", year: "numeric" })}
                </div>
              </div>
            </div>
            {(client.phone || client.email || client.address) && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px" }}>
                {client.phone && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6B7280", background: "#F9FAFB", padding: "4px 9px", borderRadius: "20px", border: "1px solid #EAECF0" }}>
                    <Phone size={10} color="#9CA3AF" />{client.phone}
                  </span>
                )}
                {client.email && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6B7280", background: "#F9FAFB", padding: "4px 9px", borderRadius: "20px", border: "1px solid #EAECF0" }}>
                    <Mail size={10} color="#9CA3AF" />{client.email}
                  </span>
                )}
                {client.address && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6B7280", background: "#F9FAFB", padding: "4px 9px", borderRadius: "20px", border: "1px solid #EAECF0" }}>
                    <MapPin size={10} color="#9CA3AF" />{client.address}
                  </span>
                )}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { label: "Projekte", value: client.projects.length, color: "#111827" },
                { label: "Aktive", value: activeProjects.length, color: "#16A34A" },
                { label: "Vlera", value: fmt(totalValue), color: "#111827" },
                { label: "Shpenzime", value: fmt(totalExpenses), color: totalExpenses > totalValue ? "#DC2626" : "#374151" },
              ].map((s) => (
                <div key={s.label} style={{ background: "#F9FAFB", borderRadius: "10px", padding: "10px 12px" }}>
                  <div style={{ fontSize: "10px", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "3px" }}>{s.label}</div>
                  <div style={{ fontSize: "15px", fontWeight: "700", color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", borderTop: "1px solid #F3F4F6" }}>
            <button onClick={() => setEditOpen(true)} style={{ flex: 1, padding: "11px 0", background: "none", border: "none", fontSize: "13px", fontWeight: "600", color: "#111827", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "Inter, sans-serif" }}>
              <Edit2 size={13} /> Ndrysho
            </button>
            <div style={{ width: "1px", background: "#F3F4F6" }} />
            <button onClick={() => setDeleteConfirm(true)} style={{ flex: 1, padding: "11px 0", background: "none", border: "none", fontSize: "13px", fontWeight: "600", color: "#DC2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontFamily: "Inter, sans-serif" }}>
              <Trash2 size={13} /> Fshi
            </button>
          </div>
        </div>
      </div>

      {/* Projects table */}
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F3F4F6" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FolderKanban size={17} color="#374151" />
            <span style={{ fontSize: "15px", fontWeight: "700", color: "#111827" }}>Projektet e klientit</span>
            {client.projects.length > 0 && (
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#6B7280", background: "#F3F4F6", padding: "2px 9px", borderRadius: "20px" }}>
                {client.projects.length}
              </span>
            )}
          </div>
          <Link href={`/projektet/i-ri?clientId=${id}`}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "600", color: "white", textDecoration: "none", padding: "7px 14px", border: "1px solid #111827", borderRadius: "8px", background: "#111827", transition: "background 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#1f2937"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#111827"; }}
          >
            <Plus size={13} /> Shto projekt
          </Link>
        </div>

        {client.projects.length === 0 ? (
          <div style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{ width: "52px", height: "52px", background: "#F3F4F6", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
              <FolderKanban size={22} color="#9CA3AF" />
            </div>
            <div style={{ fontSize: "15px", fontWeight: "700", color: "#374151", marginBottom: "6px" }}>Nuk ka projekte</div>
            <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "20px" }}>Ky klient nuk ka projekte të regjistruara ende.</div>
            <Link href={`/projektet/i-ri?clientId=${id}`} className="btn-primary" style={{ display: "inline-flex" }}>
              <Plus size={14} /> Krijo projekt të ri
            </Link>
          </div>
        ) : (
          <>
            <div className="client-proj-table" style={{ padding: "10px 24px", background: "#F9FAFB", borderBottom: "1px solid #EAECF0" }}>
              {["PROJEKTI", "VLERA KONTRATËS", "SHPENZIME", "PUNËTORË", "STATUSI", ""].map((h, i) => (
                <div key={h} className={i >= 3 ? "hide-mobile" : ""} style={{ fontSize: "10.5px", fontWeight: "600", color: "#9CA3AF", letterSpacing: "0.05em" }}>{h}</div>
              ))}
            </div>
            {client.projects.map((p, i) => {
              const expenses = p.totaliShpenzimeve;
              const overBudget = expenses > p.totalPrice && p.totalPrice > 0;
              return (
                <div
                  key={p.id}
                  className="proj-row client-proj-table"
                  style={{ padding: "16px 24px", borderBottom: i < client.projects.length - 1 ? "1px solid #F3F4F6" : "none", background: "white", alignItems: "center" }}
                  onClick={() => { window.location.href = `/projektet/${p.id}`; }}
                >
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>{p.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      {p.location && (
                        <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#9CA3AF" }}>
                          <MapPin size={10} /> {p.location}
                        </span>
                      )}
                      {(p.startDate || p.endDate) && (
                        <span style={{ display: "flex", alignItems: "center", gap: "3px", fontSize: "12px", color: "#9CA3AF" }}>
                          <Calendar size={10} />
                          {p.startDate ? new Date(p.startDate).toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric" }) : "?"}
                          {p.endDate && ` → ${new Date(p.endDate).toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric" })}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>{fmt(p.totalPrice)}</div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: overBudget ? "#DC2626" : "#374151" }}>{fmt(expenses)}</div>
                    {p.totalPrice > 0 && (
                      <div style={{ fontSize: "11px", color: overBudget ? "#DC2626" : "#9CA3AF", marginTop: "2px", display: "flex", alignItems: "center", gap: "3px" }}>
                        {overBudget && <TrendingUp size={10} />}
                        {Math.round((expenses / p.totalPrice) * 100)}% e vlerës
                      </div>
                    )}
                  </div>
                  <div className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#374151" }}>
                    <Users size={13} color="#9CA3AF" /> {p.workers}
                  </div>
                  <div className="hide-mobile"><StatusBadge status={p.status} /></div>
                  <div className="hide-mobile" style={{ textAlign: "right" }}>
                    <span className="open-chip" style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "600", color: "#374151", padding: "4px 10px", background: "#F3F4F6", borderRadius: "20px" }}>
                      Hap <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Edit drawer */}
      {editOpen && (
        <EditDrawer
          form={form}
          saving={saving}
          onClose={() => setEditOpen(false)}
          onSave={handleSave}
          onChange={(field, value) => setForm((prev) => ({ ...prev, [field]: value }))}
        />
      )}

      {/* Delete modal */}
      <Modal isOpen={deleteConfirm} onClose={() => setDeleteConfirm(false)} title="Fshi klientin">
        <p style={{ fontSize: "14px", color: "#374151", marginBottom: "20px", lineHeight: "1.6" }}>
          A jeni të sigurt që dëshironi të fshini klientin <strong>{client.name}</strong>?
          {client.projects.length > 0 && (
            <span style={{ display: "block", marginTop: "10px", padding: "10px 14px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "8px", color: "#92400E", fontSize: "13px" }}>
              ⚠️ Ky klient ka {client.projects.length} projekte të lidhura me llogarinë e tij.
            </span>
          )}
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
          <button onClick={() => setDeleteConfirm(false)} className="btn-secondary">Anulo</button>
          <button
            onClick={handleDelete}
            style={{ display: "flex", alignItems: "center", gap: "6px", padding: "9px 18px", borderRadius: "8px", background: "#DC2626", color: "white", border: "none", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#B91C1C"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#DC2626"; }}
          >
            <Trash2 size={14} /> Fshi klientin
          </button>
        </div>
      </Modal>
      </PageTransition>
    </>
  );
}
