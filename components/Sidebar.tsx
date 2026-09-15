"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, FolderKanban, Users, Receipt,
  BarChart3, LogOut, TrendingUp, ShieldCheck, X, Search, Activity,
} from "lucide-react";
import GlobalSearch from "./GlobalSearch";
import { useState } from "react";

const navItems = [
  {
    section: "KRYESORE",
    items: [
      { href: "/",           label: "Kryefaqja",  icon: LayoutDashboard },
      { href: "/projektet",  label: "Projektet",  icon: FolderKanban },
      { href: "/klientet",   label: "Klientët",   icon: Users },
    ],
  },
  {
    section: "FINANCAT",
    items: [
      { href: "/shpenzimet", label: "Shpenzimet", icon: Receipt },
      { href: "/barazimi",   label: "Pagesat",    icon: TrendingUp },
      { href: "/raportet",   label: "Raportet",   icon: BarChart3 },
      { href: "/aktiviteti", label: "Aktiviteti", icon: Activity },
    ],
  },
];

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside style={{
      width: "220px",
      height: "100vh",
      background: "#FFFFFF",
      borderRight: "1px solid #EAECF0",
      display: "flex",
      flexDirection: "column",
      padding: "20px 12px",
      flexShrink: 0,
      overflow: "hidden",
    }}>
      {/* Logo + optional mobile close */}
      <div style={{ marginBottom: "28px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ConSteel" style={{ height: "40px", width: "auto", maxWidth: "160px", objectFit: "contain", objectPosition: "left center" }} />
        </Link>
        {onClose && (
          <button
            onClick={onClose}
            style={{ position: "absolute", right: 0, background: "#F3F4F6", border: "none", borderRadius: "7px", width: "28px", height: "28px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <X size={15} color="#6B7280" />
          </button>
        )}
      </div>

      {/* Global search trigger */}
      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
      <div style={{ marginBottom: "16px" }}>
        <button
          onClick={() => setSearchOpen(true)}
          style={{
            width: "100%", display: "flex", alignItems: "center", gap: "8px",
            padding: "8px 12px", background: "#F9FAFB", border: "1.5px solid #EAECF0",
            borderRadius: "9px", cursor: "pointer", fontFamily: "Inter, sans-serif",
            transition: "border-color 0.15s, background 0.15s",
          }}
          onMouseEnter={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "#D1D5DB"; b.style.background = "#F3F4F6"; }}
          onMouseLeave={(e) => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor = "#EAECF0"; b.style.background = "#F9FAFB"; }}
        >
          <Search size={14} color="#9CA3AF" />
          <span style={{ fontSize: "13px", color: "#9CA3AF", flex: 1, textAlign: "left" }}>Kërko...</span>
          <kbd style={{ fontSize: "10px", color: "#9CA3AF", background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: "4px", padding: "1px 5px", fontFamily: "Inter, sans-serif" }}>⌘K</kbd>
        </button>
      </div>

      {/* Navigation — flex: 1 so it fills available space */}
      <nav style={{ flex: 1, overflowY: "auto" }}>
        {navItems.map((section) => (
          <div key={section.section} style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", fontWeight: "600", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", padding: "0 8px", marginBottom: "6px" }}>
              {section.section}
            </div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex", alignItems: "center", gap: "9px",
                    padding: "8px 10px", borderRadius: "8px", marginBottom: "2px",
                    fontSize: "14px", fontWeight: active ? "600" : "400",
                    color: active ? "white" : "#374151",
                    background: active ? "#111827" : "transparent",
                    textDecoration: "none", transition: "background 0.15s, color 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "#F3F4F6"; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Bottom: User + Logout — pinned, never scrolls away */}
      <div style={{ borderTop: "1px solid #EAECF0", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", padding: "4px 8px" }}>
          <div style={{ width: "34px", height: "34px", background: "#111827", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ShieldCheck size={17} color="white" />
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#111827", whiteSpace: "nowrap" }}>Admin</div>
            <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Administratori</div>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 10px", borderRadius: "8px", fontSize: "13px", fontWeight: "500", color: "#6B7280", background: "transparent", border: "none", cursor: "pointer", width: "100%", textAlign: "left", transition: "background 0.15s, color 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "#FEF2F2"; e.currentTarget.style.color = "#DC2626"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6B7280"; }}
        >
          <LogOut size={15} />
          Dilni nga sistemi
        </button>
      </div>
    </aside>
  );
}
