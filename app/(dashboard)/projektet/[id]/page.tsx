"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import { SkeletonProjectDetail, useDelayedLoading } from "@/components/Skeleton";
import Link from "next/link";
import BottomSheet from "@/components/BottomSheet";
import {
  ArrowLeft, Edit2, X, Plus, Trash2,
  MapPin, Users, Euro, Building2,
  FileText, Image, TrendingUp, TrendingDown,
  ReceiptText, Briefcase, FolderOpen, Check, Calendar, ChevronDown,
} from "lucide-react";
import DatePicker from "@/components/DatePicker";
import ClientSelect from "@/components/ClientSelect";
import PageTransition from "@/components/PageTransition";
import { useSetPageTitle } from "@/contexts/PageTitle";
const CLOUDINARY_CLOUD = "drljgepgy";
const CLOUDINARY_PRESET = "ConSteel_uploads";

interface Report { id: string; title: string; content: string; date: string; }
interface Client { id: string; name: string; }
interface ProjectFile { id: string; url: string; name: string; size: number | null; type: string; ext: string | null; createdAt: string; }
interface Project {
  id: string; name: string; location: string | null; clientId: string; client: Client;
  status: string; workers: number; startDate: string | null; endDate: string | null;
  totalPrice: number; shpenzimeOperative: number; shpenzimeMateriali: number;
  shpenzimeUshqimBonuse: number; shpenzimeTransportSherbimi: number;
  puneShteseTotal: number; totaliShpenzimeve: number; notes: string | null;
  reports: Report[];
  files: ProjectFile[];
}

function fmt(n: number) {
  return new Intl.NumberFormat("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n) + " €";
}
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("sq-AL", { day: "2-digit", month: "long", year: "numeric" });
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active") return <span className="badge-active">Në progres</span>;
  if (status === "pending") return <span className="badge-pending">Në pritje</span>;
  return <span className="badge-done">Përfunduar</span>;
}

/* ── Styled input components ── */
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 13px", border: "1.5px solid #E5E7EB",
  borderRadius: "9px", fontSize: "14px", color: "#111827", background: "white",
  outline: "none", fontFamily: "Inter, sans-serif", boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function FInput({ label, name, value, onChange, type = "text", placeholder }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string; placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6B7280", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </label>
      <input
        name={name} type={type} value={value} onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...inputStyle, borderColor: focused ? "#111827" : "#E5E7EB", boxShadow: focused ? "0 0 0 3px rgba(17,24,39,0.06)" : "none" }}
      />
    </div>
  );
}

function FSelect({ label, name, value, onChange, options }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6B7280", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <select
          name={name} value={value} onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            ...inputStyle, appearance: "none", WebkitAppearance: "none", MozAppearance: "none",
            paddingRight: "36px", cursor: "pointer",
            borderColor: focused ? "#111827" : "#E5E7EB",
            boxShadow: focused ? "0 0 0 3px rgba(17,24,39,0.06)" : "none",
          } as React.CSSProperties}
        >
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={15} color="#9CA3AF" style={{ position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
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
      <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6B7280", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </label>
      <textarea
        name={name} value={value} onChange={onChange} rows={rows} placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...inputStyle, resize: "vertical", borderColor: focused ? "#111827" : "#E5E7EB", boxShadow: focused ? "0 0 0 3px rgba(17,24,39,0.06)" : "none" } as React.CSSProperties}
      />
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px", paddingBottom: "10px", borderBottom: "1px solid #F3F4F6" }}>
      <div style={{ width: "28px", height: "28px", borderRadius: "7px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon}
      </div>
      <span style={{ fontSize: "13px", fontWeight: "700", color: "#111827" }}>{title}</span>
    </div>
  );
}

/* ── Edit Drawer ── */
function EditDrawer({ form, clients, setClients, saving, onClose, onSave, setF, setField }: {
  form: Record<string, string>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
  setF: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  setField: (name: string, value: string) => void;
}) {
  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const liveTotal =
    (parseFloat(form.shpenzimeOperative) || 0) +
    (parseFloat(form.shpenzimeMateriali) || 0) +
    (parseFloat(form.shpenzimeUshqimBonuse) || 0) +
    (parseFloat(form.shpenzimeTransportSherbimi) || 0) +
    (parseFloat(form.puneShteseTotal) || 0);

  const liveProfit = (parseFloat(form.totalPrice) || 0) - liveTotal;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 40, backdropFilter: "blur(2px)" }}
      />
      {/* Drawer panel */}
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0, width: "min(560px, 100vw)",
        background: "white", zIndex: 50, display: "flex", flexDirection: "column",
        boxShadow: "-8px 0 40px rgba(0,0,0,0.12)",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #F3F4F6", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "#111827" }}>Ndrysho projektin</div>
            <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>Të gjitha ndryshimet ruhen me butonin e poshtëm</div>
          </div>
          <button onClick={onClose} style={{ width: "32px", height: "32px", background: "#F3F4F6", border: "none", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#E5E7EB"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6"; }}
          >
            <X size={16} color="#6B7280" />
          </button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {/* Section 1: Basic info */}
          <div style={{ marginBottom: "28px" }}>
            <SectionHeader icon={<Building2 size={14} color="#6B7280" />} title="Informacione bazë" />
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <FInput label="Emri i projektit" name="name" value={form.name} onChange={setF} placeholder="p.sh. Ndërtimi i pallatin A3" />

              {/* Client */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6B7280", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Klienti</label>
                <ClientSelect
                  clients={clients}
                  value={form.clientId}
                  onChange={(id) => setField("clientId", id)}
                  onClientAdded={(c) => setClients((prev) => [c, ...prev])}
                />
              </div>

              <FInput label="Lokacioni" name="location" value={form.location} onChange={setF} placeholder="p.sh. Tiranë" />

              {/* Status pills */}
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6B7280", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Statusi</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {[
                    { value: "active",    label: "Në progres", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", dot: "#22C55E" },
                    { value: "pending",   label: "Në pritje",  color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B" },
                    { value: "completed", label: "Përfunduar", color: "#6B7280", bg: "#F3F4F6", border: "#E5E7EB", dot: "#9CA3AF" },
                  ].map((s) => {
                    const active = form.status === s.value;
                    return (
                      <button key={s.value} type="button" onClick={() => setField("status", s.value)}
                        style={{
                          flex: 1, padding: "9px 6px", borderRadius: "9px", cursor: "pointer",
                          border: `1.5px solid ${active ? s.border : "#E5E7EB"}`,
                          background: active ? s.bg : "white",
                          color: active ? s.color : "#9CA3AF",
                          fontSize: "12px", fontWeight: "600", fontFamily: "Inter, sans-serif",
                          transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                        }}
                        onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "#F9FAFB"; }}
                        onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = "white"; }}
                      >
                        <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: active ? s.dot : "#D1D5DB", flexShrink: 0 }} />
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <FInput label="Numri i punëtorëve" name="workers" type="number" value={form.workers} onChange={setF} placeholder="0" />
              <div className="pd-2form">
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6B7280", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Data e fillimit</label>
                  <DatePicker
                    value={form.startDate}
                    onChange={(v) => {
                      setField("startDate", v);
                      if (v && form.endDate && form.endDate < v) setField("endDate", "");
                    }}
                    placeholder="Zgjidh datën..."
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6B7280", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Data e mbarimit</label>
                  <DatePicker
                    value={form.endDate}
                    onChange={(v) => setField("endDate", v)}
                    placeholder="Zgjidh datën..."
                    minDate={form.startDate || undefined}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Financat */}
          <div style={{ marginBottom: "28px" }}>
            <SectionHeader icon={<Euro size={14} color="#6B7280" />} title="Financat" />
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <FInput label="Vlera e kontratës (€)" name="totalPrice" type="number" value={form.totalPrice} onChange={setF} placeholder="0" />
              <div className="pd-2form">
                <FInput label="Shpenzime operative (€)" name="shpenzimeOperative" type="number" value={form.shpenzimeOperative} onChange={setF} placeholder="0" />
                <FInput label="Shpenzime materiali (€)" name="shpenzimeMateriali" type="number" value={form.shpenzimeMateriali} onChange={setF} placeholder="0" />
                <FInput label="Ushqim & bonuse (€)" name="shpenzimeUshqimBonuse" type="number" value={form.shpenzimeUshqimBonuse} onChange={setF} placeholder="0" />
                <FInput label="Transport & shërbimi (€)" name="shpenzimeTransportSherbimi" type="number" value={form.shpenzimeTransportSherbimi} onChange={setF} placeholder="0" />
              </div>
              <FInput label="Punë shtesë (€)" name="puneShteseTotal" type="number" value={form.puneShteseTotal} onChange={setF} placeholder="0" />

              {/* Live preview */}
              <div style={{ background: "#F9FAFB", borderRadius: "10px", padding: "14px 16px", border: "1px solid #EAECF0" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#9CA3AF", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "10px" }}>Pasqyra live</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#6B7280", marginBottom: "5px" }}>
                  <span>Total shpenzime</span>
                  <span style={{ fontWeight: "600", color: "#374151" }}>{fmt(liveTotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#6B7280" }}>{liveProfit >= 0 ? "Fitimi" : "Humbja"}</span>
                  <span style={{ fontWeight: "700", color: liveProfit >= 0 ? "#16A34A" : "#DC2626" }}>
                    {liveProfit >= 0 ? "+" : ""}{fmt(Math.abs(liveProfit))}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Shënime */}
          <div>
            <SectionHeader icon={<FileText size={14} color="#6B7280" />} title="Shënime" />
            <FTextarea
              label="Shënime shtesë"
              name="notes"
              value={form.notes}
              onChange={setF}
              placeholder="Çfarëdo informacioni shtesë rreth projektit..."
              rows={5}
            />
          </div>
        </div>

        {/* Footer actions */}
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

function DeleteConfirmModal({ label, onConfirm, onCancel }: { label: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <BottomSheet title={label} onClose={onCancel} maxWidth="380px">
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px", background: "#FEF2F2", borderRadius: "10px" }}>
          <Trash2 size={18} color="#DC2626" />
          <span style={{ fontSize: "13px", color: "#991B1B", lineHeight: 1.5 }}>Ky veprim nuk mund të kthehet mbrapsht.</span>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "11px", background: "#F3F4F6", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "600", color: "#374151", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>Anulo</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "11px", background: "#DC2626", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: "700", color: "white", cursor: "pointer", fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <Trash2 size={14} /> Fshi
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

function FotoTab({ projectId, files, onAdd, onRemove }: { projectId: string; files: ProjectFile[]; onAdd: (f: ProjectFile) => void; onRemove: (id: string) => void }) {
  const images = files.filter((f) => f.type === "image" || !f.type);
  const [uploading, setUploading] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<ProjectFile | null>(null);
  const [error, setError] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of selected) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", CLOUDINARY_PRESET);
        const cRes = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/auto/upload`, { method: "POST", body: fd });
        const cData = await cRes.json();
        if (!cRes.ok) throw new Error(cData.error?.message ?? "Cloudinary error");
        const res = await fetch(`/api/projektet/${projectId}/files`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: cData.secure_url, name: file.name, size: file.size, type: "image" }),
        });
        if (!res.ok) throw new Error("DB save failed");
        const saved = await res.json();
        onAdd(saved);
      }
    } catch { setError("Ngarkimi dështoi. Provoni përsëri."); }
    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    const id = confirmId;
    setConfirmId(null);
    await fetch(`/api/projektet/${projectId}/files/${id}`, { method: "DELETE" });
    onRemove(id);
  };

  return (
    <>
      <style>{`.foto-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; } @media (max-width: 768px) { .foto-grid { grid-template-columns: repeat(2, 1fr); } } .foto-item:hover .foto-overlay { opacity: 1; }`}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
          <Image size={14} color="#9CA3AF" />
          Foto të projektit
          {images.length > 0 && <span style={{ fontSize: "12px", fontWeight: "600", background: "#F3F4F6", color: "#6B7280", padding: "2px 8px", borderRadius: "20px" }}>{images.length}</span>}
        </div>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: uploading ? "#6B7280" : "#111827", color: "white", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: uploading ? "not-allowed" : "pointer", transition: "background 0.15s" }}>
          <input type="file" accept="image/*,image/heic,image/webp" multiple onChange={handleUpload} disabled={uploading} style={{ display: "none" }} />
          {uploading ? <><span style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} /> Duke ngarkuar...</> : <><Plus size={14} /> Ngarko foto</>}
        </label>
      </div>

      {error && <div style={{ marginBottom: "14px", padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", fontSize: "13px", color: "#DC2626" }}>{error}</div>}

      {images.length === 0 ? (
        <div className="card" style={{ padding: "64px 24px", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", background: "#F3F4F6", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <Image size={24} color="#9CA3AF" />
          </div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Nuk ka foto ende</div>
          <div style={{ fontSize: "13px", color: "#9CA3AF", maxWidth: "280px", margin: "0 auto", lineHeight: 1.6 }}>Ngarko foto nga kantieri — progres punimesh, dokumentim, etj.</div>
        </div>
      ) : (
        <div className="foto-grid">
          {images.map((f) => (
            <div key={f.id} className="foto-item" style={{ position: "relative", borderRadius: "10px", overflow: "hidden", border: "1px solid #E5E7EB", background: "#F3F4F6", aspectRatio: "16/10", cursor: "pointer" }} onClick={() => setLightbox(f)}>
              <img src={f.url} alt={f.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
              <div className="foto-overlay" style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)", opacity: 0, transition: "opacity 0.2s", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "10px 12px" }}>
                <div style={{ fontSize: "11.5px", color: "white", fontWeight: "500", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmId(f.id); }}
                style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.55)", border: "none", borderRadius: "6px", width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", transition: "background 0.15s" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#DC2626")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(0,0,0,0.55)")}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }} onClick={() => setLightbox(null)}>
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.12)", border: "none", borderRadius: "8px", width: "36px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}>
            <X size={18} />
          </button>
          <img src={lightbox.url} alt={lightbox.name} style={{ maxWidth: "100%", maxHeight: "90vh", borderRadius: "8px", objectFit: "contain", boxShadow: "0 32px 80px rgba(0,0,0,0.6)" }} onClick={(e) => e.stopPropagation()} />
          <div style={{ position: "absolute", bottom: "20px", left: "50%", transform: "translateX(-50%)", fontSize: "13px", color: "rgba(255,255,255,0.6)", background: "rgba(0,0,0,0.5)", padding: "6px 14px", borderRadius: "20px", whiteSpace: "nowrap" }}>{lightbox.name}</div>
        </div>
      )}

      {confirmId && <DeleteConfirmModal label="Fshi foton?" onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}
    </>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function docIcon(ext: string | null | undefined) {
  const e = (ext ?? "").toLowerCase();
  if (e === "pdf") return { bg: "#FEF2F2", color: "#DC2626", label: "PDF" };
  if (["doc", "docx"].includes(e)) return { bg: "#EFF6FF", color: "#2563EB", label: "DOC" };
  if (["xls", "xlsx"].includes(e)) return { bg: "#F0FDF4", color: "#16A34A", label: "XLS" };
  if (["dwg", "dxf"].includes(e)) return { bg: "#FFF7ED", color: "#EA580C", label: "DWG" };
  return { bg: "#F3F4F6", color: "#6B7280", label: e.toUpperCase() || "FILE" };
}

function DokumenteTab({ projectId, files: allFiles, onAdd, onRemove, onRename }: { projectId: string; files: ProjectFile[]; onAdd: (f: ProjectFile) => void; onRemove: (id: string) => void; onRename: (id: string, name: string) => void }) {
  const files = allFiles.filter((f) => f.type === "document");
  const [uploading, setUploading] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    setUploading(true);
    setError("");
    try {
      for (const file of selected) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        const res = await fetch(`/api/projektet/${projectId}/files`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: file.name, size: file.size, type: "document", data: base64, ext: file.name.split(".").pop()?.toLowerCase() ?? "" }),
        });
        if (!res.ok) throw new Error("Ruajtja dështoi");
        const saved = await res.json();
        onAdd(saved);
      }
    } catch { setError("Ngarkimi dështoi. Provoni përsëri."); }
    setUploading(false);
    e.target.value = "";
  };

  const handleDelete = async () => {
    if (!confirmId) return;
    const id = confirmId;
    setConfirmId(null);
    await fetch(`/api/projektet/${projectId}/files/${id}`, { method: "DELETE" });
    onRemove(id);
  };

  const startEdit = (f: ProjectFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(f.id);
    setEditingName(f.name);
  };

  const commitRename = async (fileId: string) => {
    const trimmed = editingName.trim();
    setEditingId(null);
    if (!trimmed) return;
    const res = await fetch(`/api/projektet/${projectId}/files/${fileId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    if (res.ok) onRename(fileId, trimmed);
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827", display: "flex", alignItems: "center", gap: "8px" }}>
          <FileText size={14} color="#9CA3AF" />
          Dokumente
          {files.length > 0 && <span style={{ fontSize: "12px", fontWeight: "600", background: "#F3F4F6", color: "#6B7280", padding: "2px 8px", borderRadius: "20px" }}>{files.length}</span>}
        </div>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "7px 14px", background: uploading ? "#6B7280" : "#111827", color: "white", borderRadius: "8px", fontSize: "13px", fontWeight: "600", cursor: uploading ? "not-allowed" : "pointer", transition: "background 0.15s" }}>
          <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.txt,.csv,.ppt,.pptx" multiple onChange={handleUpload} disabled={uploading} style={{ display: "none" }} />
          {uploading ? <><span style={{ width: "13px", height: "13px", border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} /> Duke ngarkuar...</> : <><Plus size={14} /> Ngarko dokument</>}
        </label>
      </div>

      {error && <div style={{ marginBottom: "14px", padding: "10px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", fontSize: "13px", color: "#DC2626" }}>{error}</div>}

      {files.length === 0 ? (
        <div className="card" style={{ padding: "64px 24px", textAlign: "center" }}>
          <div style={{ width: "56px", height: "56px", background: "#F3F4F6", borderRadius: "14px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
            <FileText size={24} color="#9CA3AF" />
          </div>
          <div style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "6px" }}>Nuk ka dokumente ende</div>
          <div style={{ fontSize: "13px", color: "#9CA3AF", maxWidth: "300px", margin: "0 auto", lineHeight: 1.6 }}>Ngarko PDF, Word, Excel, DWG dhe skedarë të tjerë të projektit.</div>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          {files.map((f, i) => {
            const icon = docIcon(f.ext);
            return (
              <div key={f.id} className="doc-row" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "13px 16px", borderBottom: i < files.length - 1 ? "1px solid #F3F4F6" : "none", cursor: "pointer", transition: "background 0.15s" }}
                onClick={() => { window.location.href = `/api/projektet/${projectId}/files/${f.id}/download`; }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; const n = (e.currentTarget as HTMLElement).querySelector<HTMLElement>(".doc-name"); if (n) n.style.textDecoration = "underline"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = ""; const n = (e.currentTarget as HTMLElement).querySelector<HTMLElement>(".doc-name"); if (n) n.style.textDecoration = "none"; }}
              >
                <div style={{ width: "38px", height: "38px", background: icon.bg, borderRadius: "9px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "10px", fontWeight: "800", color: icon.color, letterSpacing: "0.3px" }}>{icon.label}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {editingId === f.id ? (
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => commitRename(f.id)}
                      onKeyDown={(e) => { if (e.key === "Enter") commitRename(f.id); if (e.key === "Escape") setEditingId(null); }}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: "100%", fontSize: "13.5px", fontWeight: "600", color: "#111827", border: "1px solid #111827", borderRadius: "6px", padding: "3px 8px", outline: "none", fontFamily: "Inter, sans-serif", background: "white" }}
                    />
                  ) : (
                    <div className="doc-name" style={{ fontSize: "13.5px", fontWeight: "600", color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {f.name}
                    </div>
                  )}
                  <div style={{ fontSize: "11.5px", color: "#9CA3AF", marginTop: "2px" }}>
                    {f.size ? formatBytes(f.size) : ""}{f.size ? " · " : ""}{new Date(f.createdAt).toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); startEdit(f, e); }}
                    title="Riemërto"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", background: "white", border: "1px solid #E5E7EB", borderRadius: "7px", cursor: "pointer", color: "#6B7280", transition: "background 0.15s, border-color 0.15s", flexShrink: 0 }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#F3F4F6"; e.currentTarget.style.borderColor = "#D1D5DB"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#E5E7EB"; }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmId(f.id); }}
                    title="Fshi"
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", background: "white", border: "1px solid #FECACA", borderRadius: "7px", cursor: "pointer", color: "#DC2626", transition: "background 0.15s", flexShrink: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FEF2F2")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {confirmId && <DeleteConfirmModal label="Fshi dokumentin?" onConfirm={handleDelete} onCancel={() => setConfirmId(null)} />}
    </>
  );
}

function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return <BottomSheet title={title} onClose={onClose}>{children}</BottomSheet>;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [tab, setTab] = useState<"permbledhje" | "shpenzimet" | "raportet" | "foto" | "dokumente">("permbledhje");
  const [allFiles, setAllFiles] = useState<ProjectFile[]>([]);
  const [loading, setLoading] = useState(true);
  const showSkeleton = useDelayedLoading(loading);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const [form, setForm] = useState({
    name: "", location: "", clientId: "", startDate: "", endDate: "", status: "active", workers: "",
    totalPrice: "", shpenzimeOperative: "", shpenzimeMateriali: "",
    shpenzimeUshqimBonuse: "", shpenzimeTransportSherbimi: "", puneShteseTotal: "", notes: "",
  });

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportForm, setReportForm] = useState({ title: "", content: "", date: "" });
  const [reportSaving, setReportSaving] = useState(false);

  useSetPageTitle(project?.name ?? null);

  const fetchProject = useCallback(async () => {
    const res = await fetch(`/api/projektet/${id}`);
    if (res.ok) {
      const data = await res.json();
      setProject(data);
      setAllFiles(data.files ?? []);
      setForm({
        name: data.name, location: data.location || "", clientId: data.clientId,
        startDate: data.startDate ? data.startDate.split("T")[0] : "",
        endDate: data.endDate ? data.endDate.split("T")[0] : "",
        status: data.status, workers: String(data.workers || 0),
        totalPrice: String(data.totalPrice), shpenzimeOperative: String(data.shpenzimeOperative),
        shpenzimeMateriali: String(data.shpenzimeMateriali),
        shpenzimeUshqimBonuse: String(data.shpenzimeUshqimBonuse),
        shpenzimeTransportSherbimi: String(data.shpenzimeTransportSherbimi),
        puneShteseTotal: String(data.puneShteseTotal),
        notes: data.notes || "",
      });
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchProject();
    fetch("/api/klientet").then((r) => r.json()).then(setClients).catch(console.error);
  }, [fetchProject]);

  const setF = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const setField = (name: string, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/projektet/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        await fetchProject();
        setEditOpen(false);
        toast({ type: "success", message: "Projekti u ruajt me sukses." });
      } else {
        toast({ type: "error", message: "Gabim gjatë ruajtjes." });
      }
    } catch {
      toast({ type: "error", message: "Gabim gjatë ruajtjes." });
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    await fetch(`/api/projektet/${id}`, { method: "DELETE" });
    router.push("/projektet");
  };

  const handleAddReport = async () => {
    if (!reportForm.title.trim()) return;
    setReportSaving(true);
    await fetch(`/api/projektet/${id}/raportet`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportForm),
    });
    setReportSaving(false); setShowReportModal(false);
    setReportForm({ title: "", content: "", date: "" });
    fetchProject();
    toast({ type: "success", message: "Raporti u shtua me sukses." });
  };

  const handleDeleteReport = async (reportId: string) => {
    await fetch(`/api/projektet/${id}/raportet/${reportId}`, { method: "DELETE" });
    fetchProject();
    toast({ type: "success", message: "Raporti u fshi." });
  };

  if (loading) return showSkeleton ? <SkeletonProjectDetail /> : null;
  if (!project) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 24px", textAlign: "center" }}>
      <div style={{ width: "64px", height: "64px", background: "#FEF2F2", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
        <FolderOpen size={28} color="#EF4444" />
      </div>
      <div style={{ fontSize: "18px", fontWeight: "700", color: "#111827", marginBottom: "8px" }}>Projekti nuk u gjet</div>
      <div style={{ fontSize: "14px", color: "#9CA3AF", marginBottom: "28px", maxWidth: "340px", lineHeight: 1.6 }}>
        Ky projekt nuk ekziston ose është fshirë. Kthehuni tek lista e projekteve.
      </div>
      <a href="/projektet" style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "10px 22px", background: "#111827", color: "white", borderRadius: "10px", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
        ← Kthehu tek projektet
      </a>
    </div>
  );

  const totalExp = project.totaliShpenzimeve;
  const profit = project.totalPrice - totalExp;
  const expCategories = [
    { label: "Operative", value: project.shpenzimeOperative, color: "#374151" },
    { label: "Materiali", value: project.shpenzimeMateriali, color: "#374151" },
    { label: "Ushqim & bonuse", value: project.shpenzimeUshqimBonuse, color: "#374151" },
    { label: "Transport & shërbimi", value: project.shpenzimeTransportSherbimi, color: "#374151" },
    { label: "Punë shtesë", value: project.puneShteseTotal, color: "#374151" },
  ];
  const maxExpValue = Math.max(...expCategories.map((c) => c.value), 1);

  const tabs = [
    { key: "permbledhje", label: "Përmbledhje", icon: <Building2 size={14} /> },
    { key: "shpenzimet", label: "Shpenzimet", icon: <Euro size={14} /> },
    { key: "raportet", label: "Raportet", icon: <FileText size={14} /> },
    { key: "foto", label: "Foto", icon: <Image size={14} /> },
    { key: "dokumente", label: "Dokumente", icon: <FileText size={14} /> },
  ] as const;

  return (
    <div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
        input[type="number"] { -moz-appearance: textfield; }
        .pd-3grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .pd-2grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .pd-2form { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .pd-breadcrumb { display: flex; }
        .pd-hero-desktop { display: block; }
        .pd-hero-mobile  { display: none; }
        @media (max-width: 768px) {
          .pd-breadcrumb  { display: none !important; }
          .pd-hero-desktop { display: none !important; }
          .pd-hero-mobile  { display: block !important; }
          .pd-3grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
          .pd-3grid > *:last-child:nth-child(odd) { grid-column: 1 / -1; }
          .pd-2grid { grid-template-columns: 1fr; gap: 10px; }
          .pd-2form { grid-template-columns: 1fr; }
          .pd-kpi-inner { padding: 12px 14px !important; }
          .pd-kpi-label { font-size: 10px !important; margin-bottom: 8px !important; }
          .pd-kpi-value { font-size: 18px !important; }
          .pd-kpi-sub   { font-size: 11px !important; margin-top: 5px !important; }
          .pd-tab-btn   { padding: 8px 10px !important; font-size: 12px !important; }
          .pd-tab-icon  { display: none !important; }
        }
        @media (max-width: 400px) {
          .pd-3grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <PageTransition>
      {/* Breadcrumb — hidden on mobile (top bar shows project name) */}
      <div className="pd-breadcrumb" style={{ alignItems: "center", gap: "8px", marginBottom: "20px", fontSize: "13px", color: "#9CA3AF" }}>
        <Link href="/projektet" className="breadcrumb-link" style={{ display: "flex", alignItems: "center", gap: "4px", color: "#9CA3AF" }}>
          <ArrowLeft size={14} /> Projektet
        </Link>
        <span>·</span>
        <span style={{ color: "#374151", fontWeight: "500" }}>{project.name}</span>
      </div>

      {/* ── Desktop header card ── */}
      <div className="pd-hero-desktop">
      <div className="card" style={{ padding: "22px 24px", marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
          <div style={{ width: "52px", height: "52px", borderRadius: "12px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid #EAECF0" }}>
            <Building2 size={24} color="#6B7280" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px", flexWrap: "wrap" }}>
              <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#111827", margin: 0 }}>{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#6B7280" }}>
                <Briefcase size={13} color="#9CA3AF" /><span>{project.client.name}</span>
              </div>
              {project.location && (
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#6B7280" }}>
                  <MapPin size={13} color="#9CA3AF" /><span>{project.location}</span>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#6B7280" }}>
                <Users size={13} color="#9CA3AF" /><span>{project.workers} punëtorë</span>
              </div>
              {project.startDate && (
                <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "13px", color: "#6B7280" }}>
                  <Calendar size={13} color="#9CA3AF" />
                  <span>{fmtDate(project.startDate)}{project.endDate ? ` → ${fmtDate(project.endDate)}` : ""}</span>
                </div>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
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
      </div>
      </div>{/* end pd-hero-desktop */}

      {/* ── Mobile hero ── */}
      <div className="pd-hero-mobile" style={{ marginBottom: "14px" }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 16px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
              <h1 style={{ fontSize: "17px", fontWeight: "700", color: "#111827", margin: 0, lineHeight: 1.3, flex: 1, paddingRight: "10px" }}>{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6B7280", background: "#F9FAFB", padding: "4px 9px", borderRadius: "20px", border: "1px solid #EAECF0" }}>
                <Briefcase size={10} color="#9CA3AF" />{project.client.name}
              </span>
              {project.location && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6B7280", background: "#F9FAFB", padding: "4px 9px", borderRadius: "20px", border: "1px solid #EAECF0" }}>
                  <MapPin size={10} color="#9CA3AF" />{project.location}
                </span>
              )}
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6B7280", background: "#F9FAFB", padding: "4px 9px", borderRadius: "20px", border: "1px solid #EAECF0" }}>
                <Users size={10} color="#9CA3AF" />{project.workers} punëtorë
              </span>
              {project.startDate && (
                <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6B7280", background: "#F9FAFB", padding: "4px 9px", borderRadius: "20px", border: "1px solid #EAECF0" }}>
                  <Calendar size={10} color="#9CA3AF" />{fmtDate(project.startDate)}
                </span>
              )}
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

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "20px", borderBottom: "2px solid #EAECF0", overflowX: "auto", WebkitOverflowScrolling: "touch" as never, scrollbarWidth: "none" as never }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className="pd-tab-btn" style={{
            padding: "10px 16px", fontSize: "13px",
            fontWeight: tab === t.key ? "600" : "500",
            color: tab === t.key ? "#111827" : "#6B7280",
            background: "transparent", border: "none",
            borderBottom: tab === t.key ? "2px solid #111827" : "2px solid transparent",
            marginBottom: "-2px", cursor: "pointer", transition: "color 0.15s",
            display: "flex", alignItems: "center", gap: "6px",
            whiteSpace: "nowrap", flexShrink: 0,
          }}>
            <span className="pd-tab-icon">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ── TAB: Përmbledhje ── */}
      {tab === "permbledhje" && (
        <div>
          <div className="pd-3grid" style={{ marginBottom: "16px" }}>
            <div style={{ background: "white", border: "1px solid #EAECF0", borderRadius: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: "#111827", borderRadius: "14px 14px 0 0" }} />
              <div className="pd-kpi-inner" style={{ padding: "20px 22px" }}>
                <div className="pd-kpi-label" style={{ fontSize: "11px", fontWeight: "700", color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ReceiptText size={12} color="#9CA3AF" /> Vlera e kontratës
                </div>
                <div className="pd-kpi-value" style={{ fontSize: "26px", fontWeight: "800", color: "#111827", letterSpacing: "-0.5px", lineHeight: 1 }}>{fmt(project.totalPrice)}</div>
                <div className="pd-kpi-sub" style={{ marginTop: "10px", fontSize: "12px", color: "#9CA3AF" }}>Shuma totale e rënë dakord me klientin</div>
              </div>
            </div>
            <div style={{ background: "white", border: "1px solid #EAECF0", borderRadius: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: totalExp > project.totalPrice ? "#DC2626" : "#6B7280", borderRadius: "14px 14px 0 0" }} />
              <div className="pd-kpi-inner" style={{ padding: "20px 22px" }}>
                <div className="pd-kpi-label" style={{ fontSize: "11px", fontWeight: "700", color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <TrendingDown size={12} color="#9CA3AF" /> Shpenzime totale
                </div>
                <div className="pd-kpi-value" style={{ fontSize: "26px", fontWeight: "800", color: "#111827", letterSpacing: "-0.5px", lineHeight: 1 }}>{fmt(totalExp)}</div>
                <div className="pd-kpi-sub" style={{ marginTop: "10px", fontSize: "12px", color: totalExp > project.totalPrice ? "#DC2626" : "#9CA3AF" }}>
                  {project.totalPrice > 0
                    ? totalExp > project.totalPrice
                      ? `${fmt(totalExp - project.totalPrice)} mbi buxhet`
                      : `${fmt(project.totalPrice - totalExp)} mbetur`
                    : "Kostot deri tani"}
                </div>
              </div>
            </div>
            <div style={{ background: "white", border: "1px solid #EAECF0", borderRadius: "14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: profit >= 0 ? "#16A34A" : "#DC2626", borderRadius: "14px 14px 0 0" }} />
              <div className="pd-kpi-inner" style={{ padding: "20px 22px" }}>
                <div className="pd-kpi-label" style={{ fontSize: "11px", fontWeight: "700", color: "#9CA3AF", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                  {profit >= 0 ? <TrendingUp size={12} color="#9CA3AF" /> : <TrendingDown size={12} color="#9CA3AF" />}
                  {profit >= 0 ? "Fitimi" : "Humbja"}
                </div>
                <div className="pd-kpi-value" style={{ fontSize: "26px", fontWeight: "800", color: profit >= 0 ? "#16A34A" : "#DC2626", letterSpacing: "-0.5px", lineHeight: 1 }}>
                  {profit >= 0 ? "+" : ""}{fmt(Math.abs(profit))}
                </div>
                <div className="pd-kpi-sub" style={{ marginTop: "10px", fontSize: "12px", color: "#9CA3AF" }}>
                  {profit >= 0 ? "Diferenca pozitive" : "Shpenzimet tejkalojnë"}
                </div>
              </div>
            </div>
          </div>

          <div className="pd-2grid">
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Building2 size={14} color="#9CA3AF" /> Informacione bazë
              </div>
              {[
                { label: "Klienti", value: project.client.name },
                { label: "Lokacioni", value: project.location || "—" },
                { label: "Statusi", value: <StatusBadge status={project.status} /> },
                { label: "Punëtorë", value: `${project.workers} persona` },
                { label: "Data fillimit", value: project.startDate ? fmtDate(project.startDate) : "—" },
                { label: "Data mbarimit", value: project.endDate ? fmtDate(project.endDate) : "—" },
              ].map((row, idx, arr) => (
                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: idx < arr.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                  <span style={{ fontSize: "13px", color: "#9CA3AF" }}>{row.label}</span>
                  <span style={{ fontSize: "13px", color: "#111827", fontWeight: "500" }}>{row.value}</span>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                <FileText size={14} color="#9CA3AF" /> Shënime
              </div>
              {project.notes ? (
                <p style={{ fontSize: "13px", color: "#374151", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{project.notes}</p>
              ) : (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <p style={{ fontSize: "13px", color: "#D1D5DB", margin: "0 0 10px", fontStyle: "italic" }}>Nuk ka shënime.</p>
                  <button onClick={() => setEditOpen(true)} style={{ fontSize: "12px", color: "#9CA3AF", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", fontFamily: "Inter, sans-serif" }}>
                    Shto shënime
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Shpenzimet ── */}
      {tab === "shpenzimet" && (
        <div className="pd-2grid">
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Euro size={14} color="#9CA3AF" /> Shpenzimet sipas kategorisë
            </div>
            {expCategories.map((cat) => (
              <div key={cat.label} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                  <span style={{ fontSize: "12px", color: "#374151", fontWeight: "500" }}>{cat.label}</span>
                  <span style={{ fontSize: "12px", fontWeight: "700", color: "#111827" }}>{fmt(cat.value)}</span>
                </div>
                <div style={{ height: "7px", background: "#F3F4F6", borderRadius: "99px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${totalExp > 0 ? Math.min(100, (cat.value / maxExpValue) * 100) : 0}%`, background: cat.color, borderRadius: "99px", transition: "width 0.5s ease" }} />
                </div>
                {totalExp > 0 && (
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "3px" }}>
                    {Math.round((cat.value / totalExp) * 100)}% e totalit
                  </div>
                )}
              </div>
            ))}
            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #F3F4F6", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "#374151" }}>Total shpenzime</span>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>{fmt(totalExp)}</span>
            </div>
          </div>
          <div className="card" style={{ padding: "20px" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", marginBottom: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
              <ReceiptText size={14} color="#9CA3AF" /> Përmbledhje financiare
            </div>
            {[
              { label: "Vlera e kontratës", value: fmt(project.totalPrice), bold: true },
              { label: "Shpenzime operative", value: fmt(project.shpenzimeOperative), bold: false },
              { label: "Shpenzime materiali", value: fmt(project.shpenzimeMateriali), bold: false },
              { label: "Ushqim & bonuse", value: fmt(project.shpenzimeUshqimBonuse), bold: false },
              { label: "Transport & shërbimi", value: fmt(project.shpenzimeTransportSherbimi), bold: false },
              { label: "Punë shtesë", value: fmt(project.puneShteseTotal), bold: false },
              { label: "Total shpenzime", value: fmt(totalExp), bold: true },
            ].map((row, idx, arr) => (
              <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: idx < arr.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                <span style={{ fontSize: "13px", color: idx === 0 || idx === arr.length - 1 ? "#374151" : "#9CA3AF" }}>{row.label}</span>
                <span style={{ fontSize: "13px", fontWeight: row.bold ? "700" : "500", color: "#111827" }}>{row.value}</span>
              </div>
            ))}
            <div style={{ marginTop: "14px", padding: "14px 16px", borderRadius: "10px", background: profit >= 0 ? "#F0FDF4" : "#FEF2F2", border: `1px solid ${profit >= 0 ? "#BBF7D0" : "#FECACA"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: profit >= 0 ? "#16A34A" : "#DC2626" }}>{profit >= 0 ? "Fitimi" : "Humbja"}</span>
              <span style={{ fontSize: "16px", fontWeight: "700", color: profit >= 0 ? "#16A34A" : "#DC2626" }}>{profit >= 0 ? "+" : ""}{fmt(Math.abs(profit))}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Raportet ── */}
      {tab === "raportet" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827" }}>
              Raportet e projektit
              {project.reports.length > 0 && (
                <span style={{ fontSize: "12px", fontWeight: "600", background: "#F3F4F6", color: "#6B7280", padding: "2px 8px", borderRadius: "20px", marginLeft: "8px" }}>
                  {project.reports.length}
                </span>
              )}
            </div>
            <button onClick={() => setShowReportModal(true)} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", padding: "7px 14px" }}>
              <Plus size={14} /> Shto raport
            </button>
          </div>
          {project.reports.length === 0 ? (
            <div className="card" style={{ padding: "64px 24px", textAlign: "center" }}>
              <div style={{ width: "52px", height: "52px", background: "#F3F4F6", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <FileText size={22} color="#9CA3AF" />
              </div>
              <div style={{ fontSize: "15px", fontWeight: "700", color: "#111827", marginBottom: "6px" }}>Nuk ka raporte ende</div>
              <div style={{ fontSize: "13px", color: "#9CA3AF", marginBottom: "20px", maxWidth: "280px", margin: "0 auto 20px", lineHeight: 1.6 }}>Dokumentoni progresin e projektit duke shtuar raportin e parë.</div>
              <button onClick={() => setShowReportModal(true)} style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "9px 20px", background: "#111827", color: "white", border: "none", borderRadius: "9px", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "Inter, sans-serif" }}>
                <Plus size={14} /> Shto raportin e parë
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {project.reports.map((r) => (
                <div key={r.id} className="card" style={{ padding: "18px 20px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "9px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <FileText size={17} color="#6B7280" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: "600", color: "#111827", marginBottom: "4px" }}>{r.title}</div>
                    {r.content && (
                      <div style={{ fontSize: "13px", color: "#6B7280", lineHeight: 1.55, marginBottom: "8px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {r.content}
                      </div>
                    )}
                    <div style={{ fontSize: "12px", color: "#9CA3AF", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Calendar size={11} /> {fmtDate(r.date)}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteReport(r.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#D1D5DB", padding: "4px", display: "flex", flexShrink: 0 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#D1D5DB")}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Foto ── */}
      {tab === "foto" && project && (
        <FotoTab
          projectId={project.id}
          files={allFiles}
          onAdd={(f) => setAllFiles((prev) => [f, ...prev])}
          onRemove={(id) => setAllFiles((prev) => prev.filter((f) => f.id !== id))}
        />
      )}

      {/* ── TAB: Dokumente ── */}
      {tab === "dokumente" && project && (
        <DokumenteTab
          projectId={project.id}
          files={allFiles}
          onAdd={(f) => setAllFiles((prev) => [f, ...prev])}
          onRemove={(id) => setAllFiles((prev) => prev.filter((f) => f.id !== id))}
          onRename={(id, name) => setAllFiles((prev) => prev.map((f) => f.id === id ? { ...f, name } : f))}
        />
      )}

      {/* Edit drawer */}
      {editOpen && (
        <EditDrawer
          form={form}
          clients={clients}
          setClients={setClients}
          saving={saving}
          onClose={() => setEditOpen(false)}
          onSave={handleSave}
          setF={setF}
          setField={setField}
        />
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(false)} title="Konfirmo fshirjen">
          <div style={{ textAlign: "center", paddingBottom: "4px" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <Trash2 size={24} color="#DC2626" />
            </div>
            <div style={{ fontSize: "17px", fontWeight: "700", color: "#111827", marginBottom: "10px" }}>Fshi projektin?</div>
            <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.6, margin: "0 0 24px" }}>
              Ky veprim nuk mund të zhbëhet. Të gjitha raportet dhe të dhënat e projektit do të fshihen përgjithmonë.
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <button onClick={() => setDeleteConfirm(false)} className="btn-secondary" style={{ minWidth: "110px" }}>Anulo</button>
            <button onClick={handleDelete} className="btn-danger" style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: "140px", justifyContent: "center" }}>
              <Trash2 size={14} /> Fshi projektin
            </button>
          </div>
        </Modal>
      )}

      {/* Report modal */}
      {showReportModal && (
        <Modal onClose={() => setShowReportModal(false)} title="Shto raport të ri">
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6B7280", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Titulli</label>
              <input value={reportForm.title} onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })} style={{ ...inputStyle, boxSizing: "border-box" }} placeholder="p.sh. Raport javor - Java 5" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6B7280", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Permbajtja</label>
              <textarea value={reportForm.content} onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })} rows={4} style={{ ...inputStyle, resize: "vertical", boxSizing: "border-box" } as React.CSSProperties} placeholder="Përshkrimi i raportit..." />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "600", color: "#6B7280", marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Data</label>
              <DatePicker
                value={reportForm.date}
                onChange={(v) => setReportForm({ ...reportForm, date: v })}
                placeholder="Zgjidh datën e raportit..."
                dropUp
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
            <button onClick={() => setShowReportModal(false)} className="btn-secondary">Anulo</button>
            <button onClick={handleAddReport} disabled={reportSaving} className="btn-primary">
              {reportSaving ? "Duke ruajtur..." : "Shto raportin"}
            </button>
          </div>
        </Modal>
      )}
      </PageTransition>
    </div>
  );
}
