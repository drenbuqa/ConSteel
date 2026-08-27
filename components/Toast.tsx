"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (opts: { type: ToastType; message: string }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ type, message }: { type: ToastType; message: string }) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Toaster toasts={toasts} onRemove={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const COLORS: Record<ToastType, { border: string; icon: string; iconBg: string; iconColor: string }> = {
  success: { border: "#16A34A", icon: "✓", iconBg: "#F0FDF4", iconColor: "#16A34A" },
  error:   { border: "#DC2626", icon: "✗", iconBg: "#FEF2F2", iconColor: "#DC2626" },
  info:    { border: "#2563EB", icon: "ℹ", iconBg: "#EFF6FF", iconColor: "#2563EB" },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const [visible, setVisible] = useState(false);
  const c = COLORS[toast.type];

  useEffect(() => {
    const t = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        background: "white",
        borderRadius: "10px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
        borderLeft: `4px solid ${c.border}`,
        padding: "12px 14px",
        minWidth: "280px",
        maxWidth: "360px",
        transform: visible ? "translateX(0)" : "translateX(120%)",
        opacity: visible ? 1 : 0,
        transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease",
      }}
    >
      <div style={{
        width: "28px", height: "28px", borderRadius: "7px",
        background: c.iconBg, display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: "14px", fontWeight: "700", color: c.iconColor,
      }}>
        {c.icon}
      </div>
      <div style={{ flex: 1, fontSize: "13px", color: "#374151", lineHeight: 1.45, paddingTop: "5px" }}>
        {toast.message}
      </div>
      <button
        onClick={onRemove}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#9CA3AF", padding: "4px", display: "flex", flexShrink: 0,
          fontSize: "16px", lineHeight: 1,
        }}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}

function Toaster({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div style={{
      position: "fixed", top: "20px", right: "20px", zIndex: 100,
      display: "flex", flexDirection: "column", gap: "10px",
    }}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={() => onRemove(t.id)} />
      ))}
    </div>
  );
}
