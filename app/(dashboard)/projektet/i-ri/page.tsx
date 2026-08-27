"use client";

import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Save, Building2, Euro, FileText, Users, MapPin,
  AlertCircle, TrendingUp, TrendingDown, Check, ChevronRight,
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

const EXPENSE_FIELDS = [
  { name: "shpenzimeOperative",        label: "Operative",           hint: "Kosto të përgjithshme operative" },
  { name: "shpenzimeMateriali",         label: "Materiali",           hint: "Blerje materialesh ndërtimi" },
  { name: "shpenzimeUshqimBonuse",      label: "Ushqim & bonuse",     hint: "Katering dhe shpërblime" },
  { name: "shpenzimeTransportSherbimi", label: "Transport & shërbimi",hint: "Logjistikë dhe shërbime" },
  { name: "puneShteseTotal",            label: "Punë shtesë",         hint: "Totali i punëve shtesë" },
] as const;

const STEPS = [
  { id: 1, label: "Bazë",     icon: Building2, subtitle: "Emri, klienti dhe statusi" },
  { id: 2, label: "Detaje",   icon: MapPin,    subtitle: "Lokacioni, datat dhe shënime" },
  { id: 3, label: "Financat", icon: Euro,      subtitle: "Vlerat dhe shpenzimet" },
];

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return mobile;
}

// ─── Shared field components ──────────────────────────────────────────────────
function FieldError({ msg }: { msg: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "6px" }}>
      <AlertCircle size={12} color="#EF4444" />
      <span style={{ fontSize: "12px", color: "#EF4444" }}>{msg}</span>
    </div>
  );
}

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

function MobileLabel({ text, required, hint }: { text: string; required?: boolean; hint?: string }) {
  return (
    <div style={{ marginBottom: "8px" }}>
      <label style={{ display: "block", fontSize: "11px", fontWeight: "700", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {text}{required && <span style={{ color: "#EF4444", marginLeft: "2px" }}>*</span>}
      </label>
      {hint && <p style={{ margin: "3px 0 0", fontSize: "12px", color: "#9CA3AF" }}>{hint}</p>}
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

function NumInput({ name, value, onChange, hasError, mobile }: {
  name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  hasError?: boolean; mobile?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <Euro size={13} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: focused ? "#2563EB" : "#9CA3AF", pointerEvents: "none", transition: "color 0.15s" }} />
      <input
        name={name} type="number" inputMode="decimal" min="0" value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholder="0"
        style={{
          width: "100%",
          padding: mobile ? "13px 12px 13px 36px" : "9px 12px 9px 34px",
          background: hasError ? "#FFF5F5" : focused ? "white" : "#F9FAFB",
          border: `${mobile ? "1.5px" : "1px"} solid ${hasError ? "#FCA5A5" : focused ? "#2563EB" : "#EAECF0"}`,
          borderRadius: mobile ? "12px" : "8px",
          fontSize: mobile ? "15px" : "14px",
          color: "#111827", fontFamily: "Inter, sans-serif", outline: "none",
          MozAppearance: "textfield",
          WebkitAppearance: "none",
          boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.08)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
          boxSizing: "border-box",
        } as React.CSSProperties}
      />
    </div>
  );
}

function MobileInput({ name, value, onChange, placeholder, type = "text", icon, hasError }: {
  name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string;
  icon?: React.ReactNode; hasError?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      {icon && (
        <div style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: focused ? "#2563EB" : "#9CA3AF", transition: "color 0.15s", pointerEvents: "none" }}>
          {icon}
        </div>
      )}
      <input
        name={name} type={type} inputMode={type === "number" ? "decimal" : undefined}
        value={value} onChange={onChange} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          padding: icon ? "13px 14px 13px 44px" : "13px 14px",
          background: hasError ? "#FFF5F5" : focused ? "white" : "#F9FAFB",
          border: `1.5px solid ${hasError ? "#FCA5A5" : focused ? "#2563EB" : "#EAECF0"}`,
          borderRadius: "12px", fontSize: "15px",
          color: "#111827", fontFamily: "Inter, sans-serif", outline: "none",
          WebkitAppearance: "none", appearance: "none",
          boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.08)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s, background 0.15s",
          boxSizing: "border-box",
        } as React.CSSProperties}
      />
    </div>
  );
}

// ─── Mobile step progress bar ─────────────────────────────────────────────────
function StepProgress({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: "flex", gap: "6px", marginBottom: "28px" }}>
      {Array.from({ length: total }).map((_, i) => {
        const done = i + 1 < step;
        const active = i + 1 === step;
        return (
          <div key={i} style={{
            flex: active ? 2 : 1,
            height: "4px", borderRadius: "2px",
            background: done ? "#111827" : active ? "#111827" : "#E5E7EB",
            transition: "flex 0.35s ease, background 0.2s",
          }} />
        );
      })}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NewProjectPageWrapper() {
  return <Suspense><NewProjectPage /></Suspense>;
}

function NewProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const prefilledClientId = searchParams.get("clientId") ?? "";

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Mobile step state
  const [step, setStep] = useState(1);
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");
  const [animating, setAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

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

  // Validate step 1 (required fields)
  const validateStep1 = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Emri i projektit është i detyrueshëm.";
    if (!form.clientId) e.clientId = "Zgjidhni ose krijoni një klient.";
    return e;
  };

  const validateAll = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Emri i projektit është i detyrueshëm.";
    if (!form.clientId) e.clientId = "Zgjidhni ose krijoni një klient.";
    return e;
  };

  // Animated step navigation
  const goToStep = (next: number) => {
    if (animating) return;
    setSlideDir(next > step ? "left" : "right");
    setAnimating(true);
    setTimeout(() => {
      setStep(next);
      setAnimating(false);
      contentRef.current?.scrollTo({ top: 0, behavior: "instant" });
    }, 200);
  };

  const handleNext = () => {
    if (step === 1) {
      const errs = validateStep1();
      if (Object.keys(errs).length > 0) {
        setErrors(errs);
        setTouched({ name: true, clientId: true });
        return;
      }
    }
    if (step < 3) goToStep(step + 1);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const errs = validateAll();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setTouched({ name: true, clientId: true });
      if (isMobile && step !== 1) goToStep(1);
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

  // ── Mobile rendering ────────────────────────────────────────────────────────
  if (isMobile) {
    const currentStepDef = STEPS[step - 1];
    const StepIcon = currentStepDef.icon;

    return (
      <>
        <style>{`
          input[type="number"]::-webkit-inner-spin-button,
          input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; }
          textarea { font-family: Inter, sans-serif; resize: vertical; }
          .iri-step-enter-left  { animation: stepInLeft  0.22s ease both; }
          .iri-step-enter-right { animation: stepInRight 0.22s ease both; }
          .iri-step-exit-left   { animation: stepOutLeft  0.18s ease both; }
          .iri-step-exit-right  { animation: stepOutRight 0.18s ease both; }
          @keyframes stepInLeft   { from { opacity:0; transform:translateX(32px); }  to { opacity:1; transform:translateX(0); } }
          @keyframes stepInRight  { from { opacity:0; transform:translateX(-32px); } to { opacity:1; transform:translateX(0); } }
          @keyframes stepOutLeft  { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(-24px); } }
          @keyframes stepOutRight { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(24px); } }
          .mfocus:focus { outline: none; border-color: #2563EB !important; box-shadow: 0 0 0 3px rgba(37,99,235,0.08) !important; background: white !important; }
        `}</style>

        {/* Full-screen mobile layout */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: "calc(100dvh - 64px)", margin: "-16px -14px", background: "#F2F4F8" }}>

          {/* ── Top header ── */}
          <div style={{ background: "white", borderBottom: "1px solid #EAECF0", padding: "16px 20px 20px", flexShrink: 0 }}>
            {/* Back + step count */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              {step > 1 ? (
                <button onClick={() => goToStep(step - 1)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "600", color: "#374151", fontFamily: "Inter, sans-serif", padding: "0" }}>
                  <ArrowLeft size={17} />
                  Kthehu
                </button>
              ) : (
                <Link href={prefilledClientId ? `/klientet/${prefilledClientId}` : "/projektet"}
                  style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "600", color: "#374151", textDecoration: "none" }}>
                  <ArrowLeft size={17} />
                  Anulo
                </Link>
              )}
              <span style={{ fontSize: "12px", fontWeight: "600", color: "#9CA3AF" }}>
                Hapi {step} nga {STEPS.length}
              </span>
            </div>

            {/* Progress bar */}
            <StepProgress step={step} total={STEPS.length} />

            {/* Step title */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <StepIcon size={18} color="#374151" />
              </div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: "800", color: "#111827", letterSpacing: "-0.3px" }}>{currentStepDef.label}</div>
                <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "1px" }}>{currentStepDef.subtitle}</div>
              </div>
            </div>
          </div>

          {/* ── Scrollable content ── */}
          <div ref={contentRef} style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch", padding: "20px" } as React.CSSProperties}>
            <div
              key={step}
              className={animating
                ? (slideDir === "left" ? "iri-step-exit-left" : "iri-step-exit-right")
                : (slideDir === "left" ? "iri-step-enter-left" : "iri-step-enter-right")
              }
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >

              {/* ── Step 1: Base ── */}
              {step === 1 && (
                <>
                  {/* Project name */}
                  <div>
                    <MobileLabel text="Emri i projektit" required hint="Duhet të jetë unik dhe përshkrues" />
                    <MobileInput
                      name="name" value={form.name} onChange={set}
                      placeholder="p.sh. Ndërtimi i Rezidencës Panorama"
                      hasError={!!errors.name && !!touched.name}
                    />
                    {errors.name && touched.name && <FieldError msg={errors.name} />}
                  </div>

                  {/* Client */}
                  <div>
                    <MobileLabel text="Klienti" required hint="Klienti i lidhur me projektin" />
                    <ClientSelect
                      clients={clients}
                      value={form.clientId}
                      onChange={(id) => { setField("clientId", id); setTouched((t) => ({ ...t, clientId: true })); }}
                      onClientAdded={(c) => setClients((prev) => [c, ...prev])}
                      error={!!errors.clientId && !!touched.clientId}
                    />
                    {errors.clientId && touched.clientId && <FieldError msg={errors.clientId} />}
                  </div>

                  {/* Status */}
                  <div>
                    <MobileLabel text="Statusi" hint="Gjendja aktuale e projektit" />
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {STATUS_OPTIONS.map((s) => {
                        const active = form.status === s.value;
                        return (
                          <button key={s.value} type="button" onClick={() => setField("status", s.value)}
                            style={{
                              width: "100%", padding: "13px 16px",
                              borderRadius: "12px", cursor: "pointer",
                              border: `1.5px solid ${active ? s.border : "#EAECF0"}`,
                              background: active ? s.bg : "white",
                              display: "flex", alignItems: "center", justifyContent: "space-between",
                              transition: "all 0.15s", fontFamily: "Inter, sans-serif",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: active ? s.dot : "#D1D5DB", flexShrink: 0, transition: "background 0.15s" }} />
                              <span style={{ fontSize: "14px", fontWeight: "600", color: active ? s.color : "#6B7280", transition: "color 0.15s" }}>{s.label}</span>
                            </div>
                            {active && <Check size={15} color={s.color} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* ── Step 2: Details ── */}
              {step === 2 && (
                <>
                  <div>
                    <MobileLabel text="Lokacioni" hint="Qyteti ose adresa e projektit" />
                    <MobileInput
                      name="location" value={form.location} onChange={set}
                      placeholder="p.sh. Tiranë, Blloku"
                      icon={<MapPin size={16} />}
                    />
                  </div>

                  <div>
                    <MobileLabel text="Numri i punëtorëve" hint="Sa punëtorë janë të angazhuar" />
                    <MobileInput
                      name="workers" value={form.workers} onChange={set}
                      placeholder="p.sh. 12"
                      type="number"
                      icon={<Users size={16} />}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div>
                      <MobileLabel text="Data e fillimit" />
                      <DatePicker value={form.startDate} onChange={(v) => {
                        setField("startDate", v);
                        if (form.endDate && v && form.endDate < v) setField("endDate", "");
                      }} placeholder="Zgjidh..." />
                    </div>
                    <div>
                      <MobileLabel text="Data e mbarimit" />
                      <DatePicker value={form.endDate} onChange={(v) => setField("endDate", v)} placeholder="Zgjidh..." minDate={form.startDate || undefined} />
                    </div>
                  </div>

                  <div>
                    <MobileLabel text="Shënime" hint="Vërejtje, kushte kontrate, materiale të veçanta" />
                    <textarea
                      name="notes" value={form.notes} onChange={set} rows={4}
                      placeholder="Shkruani çdo informacion shtesë rreth projektit..."
                      style={{
                        width: "100%", padding: "13px 14px",
                        background: "#F9FAFB", border: "1.5px solid #EAECF0",
                        borderRadius: "12px", fontSize: "15px", color: "#111827",
                        lineHeight: "1.6", outline: "none", boxSizing: "border-box",
                        WebkitAppearance: "none",
                      } as React.CSSProperties}
                      onFocus={(e) => { e.target.style.borderColor = "#2563EB"; e.target.style.background = "white"; e.target.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.08)"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#EAECF0"; e.target.style.background = "#F9FAFB"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                </>
              )}

              {/* ── Step 3: Finance ── */}
              {step === 3 && (
                <>
                  <div>
                    <MobileLabel text="Vlera e kontratës" hint="Shuma totale e marrëveshjes" />
                    <NumInput name="totalPrice" value={form.totalPrice} onChange={set} mobile />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "4px 0" }}>
                    <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
                    <span style={{ fontSize: "10px", fontWeight: "800", color: "#9CA3AF", letterSpacing: "0.1em", textTransform: "uppercase" }}>SHPENZIMET</span>
                    <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
                  </div>

                  {EXPENSE_FIELDS.map((f) => (
                    <div key={f.name}>
                      <MobileLabel text={f.label} hint={f.hint} />
                      <NumInput name={f.name} value={(form as Record<string, string>)[f.name]} onChange={set} mobile />
                    </div>
                  ))}

                  {/* Live summary */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "4px" }}>
                    <div style={{ background: "white", border: "1.5px solid #EAECF0", borderRadius: "14px", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: "800", letterSpacing: "0.08em", textTransform: "uppercase" }}>TOTAL SHPENZIME</div>
                        <div style={{ fontSize: "22px", fontWeight: "800", color: "#111827", marginTop: "4px", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.5px" }}>
                          {fmtNum(totalShpenzime)}
                        </div>
                      </div>
                      <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Euro size={16} color="#6B7280" />
                      </div>
                    </div>

                    <div style={{
                      background: profit >= 0 ? "#F0FDF4" : "#FEF2F2",
                      border: `1.5px solid ${profit >= 0 ? "#BBF7D0" : "#FECACA"}`,
                      borderRadius: "14px", padding: "16px",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}>
                      <div>
                        <div style={{ fontSize: "10px", color: profit >= 0 ? "#16A34A" : "#DC2626", fontWeight: "800", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          {profit >= 0 ? "FITIMI I LLOGARITUR" : "HUMBJA E LLOGARITUR"}
                        </div>
                        <div style={{ fontSize: "22px", fontWeight: "800", color: profit >= 0 ? "#16A34A" : "#DC2626", marginTop: "4px", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.5px" }}>
                          {profit >= 0 ? "+" : ""}{fmtNum(profit)}
                        </div>
                      </div>
                      <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: profit >= 0 ? "#DCFCE7" : "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {profit >= 0 ? <TrendingUp size={17} color="#16A34A" /> : <TrendingDown size={17} color="#DC2626" />}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── Sticky bottom action ── */}
          <div style={{
            background: "white", borderTop: "1px solid #EAECF0",
            padding: "16px 20px",
            paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
            flexShrink: 0,
          }}>
            {step < 3 ? (
              <button onClick={handleNext} disabled={animating}
                style={{
                  width: "100%", padding: "15px",
                  background: "#111827", border: "none", borderRadius: "14px",
                  fontSize: "15px", fontWeight: "700", color: "white",
                  cursor: "pointer", fontFamily: "Inter, sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "background 0.15s",
                }}>
                Vazhdo
                <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={() => handleSubmit()} disabled={loading}
                style={{
                  width: "100%", padding: "15px",
                  background: loading ? "#6B7280" : "#111827", border: "none", borderRadius: "14px",
                  fontSize: "15px", fontWeight: "700", color: "white",
                  cursor: loading ? "not-allowed" : "pointer", fontFamily: "Inter, sans-serif",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  transition: "background 0.15s",
                }}>
                <Save size={16} />
                {loading ? "Duke krijuar..." : "Krijo projektin"}
              </button>
            )}

            {/* Step dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginTop: "14px" }}>
              {STEPS.map((s) => (
                <div key={s.id} style={{
                  width: step === s.id ? "20px" : "6px",
                  height: "6px", borderRadius: "3px",
                  background: s.id <= step ? "#111827" : "#E5E7EB",
                  transition: "width 0.3s ease, background 0.2s",
                }} />
              ))}
            </div>
          </div>

        </div>
      </>
    );
  }

  // ── Desktop rendering (unchanged 2-column layout) ───────────────────────────
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

      <div style={{ maxWidth: "1400px", margin: "0 auto", paddingBottom: "88px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px", fontSize: "13px" }}>
          {prefilledClientId ? (
            <Link href={`/klientet/${prefilledClientId}`} className="breadcrumb-link"
              style={{ display: "flex", alignItems: "center", gap: "5px", color: "#9CA3AF" }}>
              <ArrowLeft size={14} /> Klienti
            </Link>
          ) : (
            <Link href="/projektet" className="breadcrumb-link"
              style={{ display: "flex", alignItems: "center", gap: "5px", color: "#9CA3AF" }}>
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

              <div className="card" style={{ padding: "26px" }}>
                <SectionHeader icon={<Building2 size={16} color="#374151" />} title="Informacione bazë" subtitle="Identiteti dhe statusi i projektit" />

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
                            }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: active ? s.dot : "#D1D5DB", flexShrink: 0 }} />
                            {s.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

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

                  <div>
                    <FieldLabel text="Data e fillimit" hint="Kur fillon ekzekutimi" />
                    <DatePicker value={form.startDate} onChange={(v) => {
                      setField("startDate", v);
                      if (form.endDate && v && form.endDate < v) setField("endDate", "");
                    }} placeholder="Zgjidh datën..." />
                  </div>

                  <div>
                    <FieldLabel text="Data e mbarimit" hint="Afati i planifikuar" />
                    <DatePicker value={form.endDate} onChange={(v) => setField("endDate", v)} placeholder="Zgjidh datën..." minDate={form.startDate || undefined} />
                  </div>
                </div>
              </div>

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
                  <div>
                    <FieldLabel text="Vlera e kontratës" required hint="Shuma totale e marrëveshjes" />
                    <NumInput name="totalPrice" value={form.totalPrice} onChange={set} />
                  </div>

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

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "2px" }}>
                    <div style={{ background: "#F9FAFB", border: "1px solid #EAECF0", borderRadius: "10px", padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "10px", color: "#9CA3AF", fontWeight: "700", letterSpacing: "0.08em" }}>TOTAL SHPENZIME</div>
                        <div style={{ fontSize: "19px", fontWeight: "700", color: "#111827", marginTop: "2px", fontVariantNumeric: "tabular-nums" }}>{fmtNum(totalShpenzime)}</div>
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
        padding: "12px 20px",
        display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px",
      }}>
        <p style={{ margin: 0, fontSize: "12px", color: "#9CA3AF", flex: 1 }}>
          Fushat me <span style={{ color: "#EF4444" }}>*</span> janë të detyrueshme
        </p>
        <Link
          href={prefilledClientId ? `/klientet/${prefilledClientId}` : "/projektet"}
          style={{ padding: "9px 20px", background: "white", color: "#374151", border: "1px solid #E5E7EB", borderRadius: "8px", fontSize: "14px", fontWeight: "500", textDecoration: "none", display: "inline-flex", alignItems: "center", transition: "background 0.15s" }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#F9FAFB")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "white")}
        >
          Anulo
        </Link>
        <button
          type="submit" form="new-project-form" disabled={loading}
          style={{ padding: "9px 22px", background: loading ? "#6B7280" : "#111827", color: "white", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", display: "inline-flex", alignItems: "center", gap: "7px", fontFamily: "Inter, sans-serif", transition: "background 0.15s" }}
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
