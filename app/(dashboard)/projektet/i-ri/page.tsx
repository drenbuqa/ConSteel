"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, Building2, Euro, FileText, Users, MapPin,
  AlertCircle, TrendingUp, TrendingDown,
} from "lucide-react";
import DatePicker from "@/components/DatePicker";
import ClientSelect from "@/components/ClientSelect";
import type { ClientOption } from "@/components/ClientSelect";
import { useToast } from "@/components/Toast";

type Client = ClientOption;

const STATUS_OPTIONS = [
  { value: "active",    label: "Në progres",  color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0", dot: "#22C55E" },
  { value: "pending",   label: "Në pritje",   color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B" },
  { value: "completed", label: "Përfunduar",  color: "#6B7280", bg: "#F3F4F6", border: "#E5E7EB", dot: "#9CA3AF" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function FieldLabel({ text, required, hint }: { text: string; required?: boolean; hint?: string }) {
  return (
    <div style={{ marginBottom: "6px" }}>
      <label style={{ display: "block", fontSize: "13px", fontWeight: "600", color: "#374151" }}>
        {text}{required && <span style={{ color: "#EF4444", marginLeft: "3px" }}>*</span>}
      </label>
      {hint && <p style={{ margin: "2px 0 0", fontSize: "11.5px", color: "#9CA3AF" }}>{hint}</p>}
    </div>
  );
}

function FieldError({ msg }: { msg: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "5px" }}>
      <AlertCircle size={12} color="#EF4444" />
      <span style={{ fontSize: "12px", color: "#EF4444" }}>{msg}</span>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "22px" }}>
      <div style={{ width: "36px", height: "36px", borderRadius: "9px", background: "#F3F4F6", border: "1px solid #EAECF0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>{title}</div>
        {subtitle && <div style={{ fontSize: "12px", color: "#9CA3AF" }}>{subtitle}</div>}
      </div>
    </div>
  );
}

function NumInput({ name, value, onChange, placeholder }: { name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }) {
  return (
    <div style={{ position: "relative" }}>
      <Euro size={13} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" }} />
      <input
        name={name} type="number" min="0" value={value} onChange={onChange}
        placeholder={placeholder ?? "0"}
        style={{
          width: "100%", padding: "9px 12px 9px 34px",
          background: "#F9FAFB", border: "1px solid #EAECF0", borderRadius: "8px",
          fontSize: "14px", color: "#111827", fontFamily: "Inter, sans-serif", outline: "none",
          MozAppearance: "textfield",
        } as React.CSSProperties}
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NewProjectPageWrapper() {
  return <Suspense><NewProjectPage /></Suspense>;
}

function NewProjectPage() {
  const router  = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const prefilledClientId = searchParams.get("clientId") ?? "";

  const [clients,  setClients]  = useState<Client[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<Record<string, string>>({});
  const [touched,  setTouched]  = useState<Record<string, boolean>>({});

  const [form, setForm] = useState({
    name: "", location: "", clientId: prefilledClientId, startDate: "", endDate: "",
    status: "active", workers: "",
    totalPrice: "", shpenzimeOperative: "", shpenzimeMateriali: "",
    shpenzimeUshqimBonuse: "", shpenzimeTransportSherbimi: "",
    puneShteseTotal: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/klientet").then((r) => r.json()).then(setClients).catch(console.error);
  }, []);

  const set = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => { const n = { ...er }; delete n[name]; return n; });
  }, []);

  const setField = (name: string, value: string) => {
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((er) => { const n = { ...er }; delete n[name]; return n; });
  };

  const totalShpenzime =
    (parseFloat(form.shpenzimeOperative) || 0) +
    (parseFloat(form.shpenzimeMateriali) || 0) +
    (parseFloat(form.shpenzimeUshqimBonuse) || 0) +
    (parseFloat(form.shpenzimeTransportSherbimi) || 0) +
    (parseFloat(form.puneShteseTotal) || 0);

  const profit = (parseFloat(form.totalPrice) || 0) - totalShpenzime;
  const fmtNum = (n: number) => n.toLocaleString("de-DE") + " €";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Emri i projektit është i detyrueshëm.";
    if (!form.clientId)    e.clientId = "Zgjidhni ose krijoni një klient.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTouched({ name: true, clientId: true });
      toast({ type: "error", message: Object.values(errs)[0] });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/projektet", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const project = await res.json();
        toast({ type: "success", message: "Projekti u krijua me sukses!" });
        router.push(`/projektet/${project.id}`);
      } else {
        const data = await res.json();
        toast({ type: "error", message: data.error || "Gabim gjatë krijimit." });
      }
    } catch {
      toast({ type: "error", message: "Gabim i lidhjes. Provoni përsëri." });
    } finally {
      setLoading(false);
    }
  };

  const EXPENSE_FIELDS = [
    { name: "shpenzimeOperative",         label: "Operative",           hint: "Kosto të përgjithshme operative" },
    { name: "shpenzimeMateriali",          label: "Materiali",            hint: "Blerje materialesh ndërtimi" },
    { name: "shpenzimeUshqimBonuse",       label: "Ushqim & bonuse",      hint: "Katering dhe shpërblime" },
    { name: "shpenzimeTransportSherbimi",  label: "Transport & shërbimi", hint: "Logjistikë dhe shërbime" },
    { name: "puneShteseTotal",             label: "Punë shtesë",          hint: "Totali i punëve shtesë" },
  ] as const;

  return (
    <>
      <style>{`
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; }
        input[type="number"] { -moz-appearance: textfield; }
        input:focus, textarea:focus { outline: none; border-color: #111827 !important; background: white !important; }
        textarea { font-family: Inter, sans-serif; }
        .iri-main { display: grid; grid-template-columns: 3fr 2fr; gap: 18px; align-items: start; }
        .iri-form2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 1024px) { .iri-main { grid-template-columns: 1fr; } }
        @media (max-width: 640px)  { .iri-form2 { grid-template-columns: 1fr; } }
      `}</style>

      {/* main scroll area — paddingBottom clears sticky footer */}
      <div style={{ paddingBottom: "88px", maxWidth: "1400px", margin: "0 auto", padding: "0 24px 88px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", fontSize: "13px" }}>
          {prefilledClientId ? (
            <Link href={`/klientet/${prefilledClientId}`} className="breadcrumb-link"
              style={{ display: "flex", alignItems: "center", gap: "5px", color: "#9CA3AF" }}
            >
              <ArrowLeft size={14} /> Klienti
            </Link>
          ) : (
            <Link href="/projektet" className="breadcrumb-link"
              style={{ display: "flex", alignItems: "center", gap: "5px", color: "#9CA3AF" }}
            >
              <ArrowLeft size={14} /> Projektet
            </Link>
          )}
          <span style={{ color: "#D1D5DB" }}>›</span>
          <span style={{ color: "#374151", fontWeight: "500" }}>Projekt i ri</span>
        </div>

        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0 0 4px" }}>Krijo projekt të ri</h1>
          <p style={{ margin: 0, fontSize: "13px", color: "#9CA3AF" }}>
            Fushat me <span style={{ color: "#EF4444" }}>*</span> janë të detyrueshme.
          </p>
        </div>

        <form id="new-project-form" onSubmit={handleSubmit} noValidate>
          <div className="iri-main">

            {/* ── LEFT ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

              {/* Basic info */}
              <div className="card" style={{ padding: "26px" }}>
                <SectionHeader icon={<Building2 size={16} color="#374151" />} title="Informacione bazë" subtitle="Identiteti dhe statusi i projektit" />

                {/* Project name */}
                <div style={{ marginBottom: "18px" }}>
                  <FieldLabel text="Emri i projektit" required hint="Duhet të jetë unik dhe përshkrues" />
                  <input
                    name="name" value={form.name} onChange={set}
                    onBlur={() => setTouched((t) => ({ ...t, name: true }))}
                    placeholder="p.sh. Ndërtimi i Rezidencës Panorama"
                    style={{
                      width: "100%", padding: "9px 12px",
                      background: errors.name && touched.name ? "#FFF5F5" : "#F9FAFB",
                      border: `1px solid ${errors.name && touched.name ? "#FCA5A5" : "#EAECF0"}`,
                      borderRadius: "8px", fontSize: "14px", fontFamily: "Inter, sans-serif",
                      color: "#111827", outline: "none",
                    }}
                  />
                  {errors.name && touched.name && <FieldError msg={errors.name} />}
                </div>

                <div className="iri-form2">

                  {/* Client */}
                  <div>
                    <FieldLabel text="Klienti" required hint="Klienti i lidhur me projektin" />
                    <ClientSelect
                      clients={clients}
                      value={form.clientId}
                      onChange={(id) => { setField("clientId", id); setTouched((t) => ({ ...t, clientId: true })); }}
                      onClientAdded={(c) => setClients((prev) => [c, ...prev])}
                      error={!!errors.clientId && touched.clientId}
                    />
                    {errors.clientId && touched.clientId && <FieldError msg={errors.clientId} />}
                  </div>

                  {/* Status pills */}
                  <div>
                    <FieldLabel text="Statusi" hint="Gjendja aktuale e projektit" />
                    <div style={{ display: "flex", gap: "6px" }}>
                      {STATUS_OPTIONS.map((s) => {
                        const active = form.status === s.value;
                        return (
                          <button key={s.value} type="button" onClick={() => setField("status", s.value)}
                            style={{
                              flex: 1, padding: "9px 4px", borderRadius: "8px", cursor: "pointer",
                              border: `1.5px solid ${active ? s.border : "#EAECF0"}`,
                              background: active ? s.bg : "#F9FAFB",
                              color: active ? s.color : "#9CA3AF",
                              fontSize: "11.5px", fontWeight: "600", fontFamily: "Inter, sans-serif",
                              transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                            }}
                          >
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: active ? s.dot : "#D1D5DB", flexShrink: 0 }} />
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <FieldLabel text="Lokacioni" hint="Qyteti ose adresa" />
                    <div style={{ position: "relative" }}>
                      <MapPin size={13} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" }} />
                      <input name="location" value={form.location} onChange={set}
                        placeholder="p.sh. Tiranë, Blloku"
                        style={{ width: "100%", padding: "9px 12px 9px 34px", background: "#F9FAFB", border: "1px solid #EAECF0", borderRadius: "8px", fontSize: "14px", fontFamily: "Inter, sans-serif", color: "#111827", outline: "none" }}
                      />
                    </div>
                  </div>

                  {/* Workers */}
                  <div>
                    <FieldLabel text="Numri i punëtorëve" hint="Sa punëtorë janë të angazhuar" />
                    <div style={{ position: "relative" }}>
                      <Users size={13} style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none" }} />
                      <input name="workers" type="number" min="0" value={form.workers} onChange={set}
                        placeholder="0"
                        style={{ width: "100%", padding: "9px 12px 9px 34px", background: "#F9FAFB", border: "1px solid #EAECF0", borderRadius: "8px", fontSize: "14px", fontFamily: "Inter, sans-serif", color: "#111827", outline: "none", MozAppearance: "textfield" } as React.CSSProperties}
                      />
                    </div>
                  </div>

                  {/* Start date */}
                  <div>
                    <FieldLabel text="Data e fillimit" hint="Kur fillon ekzekutimi" />
                    <DatePicker
                      value={form.startDate}
                      onChange={(v) => {
                        setField("startDate", v);
                        // clear end date if it's now before the new start date
                        if (form.endDate && v && form.endDate < v) setField("endDate", "");
                      }}
                      placeholder="Zgjidh datën..."
                    />
                  </div>

                  {/* End date */}
                  <div>
                    <FieldLabel text="Data e mbarimit" hint="Afati i planifikuar" />
                    <DatePicker
                      value={form.endDate}
                      onChange={(v) => setField("endDate", v)}
                      placeholder="Zgjidh datën..."
                      minDate={form.startDate || undefined}
                    />
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="card" style={{ padding: "26px" }}>
                <SectionHeader icon={<FileText size={16} color="#374151" />} title="Shënime" subtitle="Informacione shtesë ose vërejtje" />
                <textarea
                  name="notes" value={form.notes} onChange={set} rows={4}
                  placeholder="Vërejtje specifike, kushte kontrate, materiale të veçanta, etj..."
                  style={{ width: "100%", padding: "10px 12px", background: "#F9FAFB", border: "1px solid #EAECF0", borderRadius: "8px", fontSize: "14px", color: "#111827", resize: "vertical", lineHeight: "1.55", outline: "none" }}
                />
              </div>
            </div>

            {/* ── RIGHT — finance ── */}
            <div style={{ position: "sticky", top: "24px" }}>
              <div className="card" style={{ padding: "26px" }}>
                <SectionHeader icon={<Euro size={16} color="#374151" />} title="Financat" subtitle="Vlerat monetare të projektit" />

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* Contract value */}
                  <div>
                    <FieldLabel text="Vlera e kontratës" required hint="Shuma totale e marrëveshjes" />
                    <NumInput name="totalPrice" value={form.totalPrice} onChange={set} />
                  </div>

                  {/* Divider */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ flex: 1, height: "1px", background: "#F3F4F6" }} />
                    <span style={{ fontSize: "10px", fontWeight: "700", color: "#9CA3AF", letterSpacing: "0.08em" }}>SHPENZIMET</span>
                    <div style={{ flex: 1, height: "1px", background: "#F3F4F6" }} />
                  </div>

                  {EXPENSE_FIELDS.map((f) => (
                    <div key={f.name}>
                      <FieldLabel text={f.label} hint={f.hint} />
                      <NumInput name={f.name} value={(form as Record<string, string>)[f.name]} onChange={set} />
                    </div>
                  ))}

                  {/* Live summary */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "2px" }}>
                    <div style={{ background: "#F9FAFB", border: "1px solid #EAECF0", borderRadius: "10px", padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: "700", letterSpacing: "0.08em" }}>TOTAL SHPENZIME</div>
                        <div style={{ fontSize: "19px", fontWeight: "700", color: "#111827", marginTop: "2px", fontVariantNumeric: "tabular-nums" }}>
                          {fmtNum(totalShpenzime)}
                        </div>
                      </div>
                      <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Euro size={15} color="#6B7280" />
                      </div>
                    </div>

                    <div style={{
                      background: profit >= 0 ? "#F0FDF4" : "#FEF2F2",
                      border: `1px solid ${profit >= 0 ? "#BBF7D0" : "#FECACA"}`,
                      borderRadius: "10px", padding: "13px 16px",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      <div>
                        <div style={{ fontSize: "10px", color: profit >= 0 ? "#16A34A" : "#DC2626", fontWeight: "700", letterSpacing: "0.08em" }}>
                          {profit >= 0 ? "FITIMI I LLOGARITUR" : "HUMBJA E LLOGARITUR"}
                        </div>
                        <div style={{ fontSize: "19px", fontWeight: "700", color: profit >= 0 ? "#16A34A" : "#DC2626", marginTop: "2px", fontVariantNumeric: "tabular-nums" }}>
                          {profit >= 0 ? "+" : ""}{fmtNum(profit)}
                        </div>
                      </div>
                      <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: profit >= 0 ? "#BBF7D0" : "#FECACA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {profit >= 0 ? <TrendingUp size={16} color="#16A34A" /> : <TrendingDown size={16} color="#DC2626" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>

      {/* ── Sticky bottom action bar ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 40,
        background: "rgba(255,255,255,0.95)", backdropFilter: "blur(8px)",
        borderTop: "1px solid #EAECF0",
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px",
      }}>
        <p style={{ margin: 0, fontSize: "12px", color: "#9CA3AF", flex: 1 }}>
          Fushat me <span style={{ color: "#EF4444" }}>*</span> janë të detyrueshme
        </p>
        <Link
          href={prefilledClientId ? `/klientet/${prefilledClientId}` : "/projektet"}
          style={{
            padding: "9px 20px", background: "white", color: "#374151",
            border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px",
            fontWeight: "500", textDecoration: "none", display: "inline-flex",
            alignItems: "center", transition: "background 0.15s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#F9FAFB")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "white")}
        >
          Anulo
        </Link>
        <button
          type="submit"
          form="new-project-form"
          disabled={loading}
          style={{
            padding: "9px 22px", background: loading ? "#6B7280" : "#111827",
            color: "white", border: "none", borderRadius: "8px",
            fontSize: "14px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer",
            display: "inline-flex", alignItems: "center", gap: "7px",
            fontFamily: "Inter, sans-serif", transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; }}
          onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#111827"; }}
        >
          <Save size={14} />
          {loading ? "Duke ruajtur..." : "Krijo projektin"}
        </button>
      </div>
    </>
  );
}
