"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number;
}

export default function Modal({ isOpen, onClose, title, children, width = 500 }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(2px)",
        }}
      />

      {/* Modal */}
      <div
        style={{
          position: "relative",
          background: "white",
          borderRadius: "12px",
          width: `${width}px`,
          maxWidth: "calc(100vw - 32px)",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 20px",
            borderBottom: "1px solid #EAECF0",
          }}
        >
          <h2 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: 0 }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: "28px",
              height: "28px",
              border: "1px solid #EAECF0",
              borderRadius: "6px",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9CA3AF",
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px" }}>{children}</div>
      </div>
    </div>
  );
}
