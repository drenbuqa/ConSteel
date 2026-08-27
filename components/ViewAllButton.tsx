"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface Props {
  href: string;
  label: string;
  icon?: React.ReactNode;
}

export default function ViewAllButton({ href, label, icon }: Props) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "7px",
        padding: "6px 12px 6px 10px",
        borderRadius: "8px",
        border: `1px solid ${hovered ? "#D1D5DB" : "#E5E7EB"}`,
        background: hovered ? "#F3F4F6" : "#F9FAFB",
        color: hovered ? "#111827" : "#374151",
        fontSize: "12.5px",
        fontWeight: "500",
        textDecoration: "none",
        whiteSpace: "nowrap",
        transition: "background 0.15s, border-color 0.15s, color 0.15s",
        fontFamily: "Inter, sans-serif",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {icon && (
        <span style={{ display: "flex", alignItems: "center", color: hovered ? "#374151" : "#6B7280", transition: "color 0.15s" }}>
          {icon}
        </span>
      )}
      {label}
      <ChevronRight size={13} style={{ color: "#9CA3AF", marginLeft: "1px" }} />
    </Link>
  );
}
