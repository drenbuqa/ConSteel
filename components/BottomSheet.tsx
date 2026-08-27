"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";

interface Props {
  title?: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  noPadding?: boolean;
}

export default function BottomSheet({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = "520px",
  noPadding = false,
}: Props) {
  const [visible, setVisible] = useState(false);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 280);
  }, [onClose]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => setVisible(true));
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
    };
  }, [close]);

  return (
    <>
      <style>{`
        .bs-backdrop {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.45);
          backdrop-filter: blur(2px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          transition: opacity 0.25s ease;
        }
        .bs-panel {
          background: white;
          border-radius: 16px;
          width: 100%;
          box-shadow: 0 24px 64px rgba(0,0,0,0.18);
          display: flex; flex-direction: column;
          max-height: 88vh;
          overflow: hidden;
          transition: transform 0.28s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.22s ease;
        }
        .bs-handle { display: none; }
        .bs-body { flex: 1; overflow-y: auto; -webkit-overflow-scrolling: touch; }

        @media (max-width: 768px) {
          .bs-backdrop { align-items: flex-end; padding: 0; }
          .bs-panel {
            border-radius: 20px 20px 0 0 !important;
            max-width: 100% !important;
            max-height: 92dvh !important;
            transform-origin: bottom center;
          }
          .bs-handle { display: flex; justify-content: center; padding: 12px 0 0; }
        }
      `}</style>

      <div
        className="bs-backdrop"
        style={{ opacity: visible ? 1 : 0 }}
        onClick={(e) => { if (e.target === e.currentTarget) close(); }}
      >
        <div
          className="bs-panel"
          style={{
            maxWidth,
            transform: visible ? "translateY(0) scale(1)" : "translateY(40px) scale(0.97)",
            opacity: visible ? 1 : 0,
          }}
        >
          {/* Drag handle — mobile only */}
          <div className="bs-handle">
            <div style={{ width: "36px", height: "4px", borderRadius: "2px", background: "#D1D5DB" }} />
          </div>

          {/* Header */}
          {(title != null) && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px 20px 14px",
              borderBottom: "1px solid #EAECF0",
              flexShrink: 0,
            }}>
              <div>
                {title && <div style={{ fontSize: "16px", fontWeight: "700", color: "#111827" }}>{title}</div>}
                {subtitle && <div style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "2px" }}>{subtitle}</div>}
              </div>
              <button
                onClick={close}
                style={{
                  width: "32px", height: "32px", borderRadius: "9px",
                  background: "#F3F4F6", border: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <X size={15} color="#374151" />
              </button>
            </div>
          )}

          {/* Content */}
          <div className="bs-body" style={noPadding ? {} : { padding: "20px" }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
