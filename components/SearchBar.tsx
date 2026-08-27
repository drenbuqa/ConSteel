"use client";

import { Search, X } from "lucide-react";
import { useState } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder = "Kërko..." }: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ position: "relative", flex: 1 }}>
      <Search
        size={16}
        style={{
          position: "absolute", left: "14px", top: "50%",
          transform: "translateY(-50%)", color: "#9CA3AF", pointerEvents: "none",
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          height: "44px",
          paddingLeft: "44px",
          paddingRight: value ? "40px" : "14px",
          border: focused ? "1.5px solid #2563EB" : "1.5px solid #E5E7EB",
          borderRadius: "12px",
          fontSize: "14px",
          fontFamily: "Inter, sans-serif",
          color: "#111827",
          background: "white",
          outline: "none",
          boxSizing: "border-box",
          boxShadow: focused ? "0 0 0 3px rgba(37,99,235,0.08)" : "0 1px 2px rgba(0,0,0,0.04)",
          transition: "border-color 0.15s, box-shadow 0.15s",
          WebkitAppearance: "none",
          appearance: "none",
        } as React.CSSProperties}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          style={{
            position: "absolute", right: "10px", top: "50%",
            transform: "translateY(-50%)",
            width: "22px", height: "22px", borderRadius: "50%",
            background: "#E5E7EB", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#6B7280", padding: 0, flexShrink: 0,
          }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}
