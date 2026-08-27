"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, FolderKanban, Users, Receipt, BarChart3, Building2, Search } from "lucide-react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import GlobalSearch from "./GlobalSearch";
import { PageTitleProvider, usePageTitle } from "@/contexts/PageTitle";

const isFormPath = (p: string) =>
  p === "/projektet/i-ri" || p.endsWith("/redakto");

const BOTTOM_TABS = [
  { href: "/",           label: "Kryefaqja",  icon: LayoutDashboard },
  { href: "/projektet",  label: "Projektet",  icon: FolderKanban },
  { href: "/klientet",   label: "Klientët",   icon: Users },
  { href: "/shpenzimet", label: "Shpenzimet", icon: Receipt },
  { href: "/raportet",   label: "Raportet",   icon: BarChart3 },
];

const PAGE_TITLES: Record<string, string> = {
  "/":           "Kryefaqja",
  "/projektet":  "Projektet",
  "/klientet":   "Klientët",
  "/shpenzimet": "Shpenzimet",
  "/raportet":   "Raportet",
  "/barazimi":   "Barazimi",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/projektet/")) return "Projekt";
  if (pathname.startsWith("/klientet/"))  return "Klient";
  return "ConSteel";
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = isFormPath(pathname);
  const [searchOpen, setSearchOpen] = useState(false);
  const { dynamicTitle } = usePageTitle();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const pageTitle = dynamicTitle ?? getPageTitle(pathname);

  return (
    <>
      <style>{`
        .shell-sidebar    { display: flex; }
        .shell-bottom-nav { display: none !important; }
        .shell-mobile-top { display: none !important; }

        @media (max-width: 768px) {
          .shell-sidebar    { display: none !important; }
          .shell-bottom-nav { display: flex !important; }
          .shell-mobile-top { display: flex !important; }
          .shell-main       { padding: 16px 14px 90px !important; }
        }
      `}</style>

      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#F2F4F8" }}>

        {/* ── Desktop sidebar ── */}
        {!hideNav && (
          <div className="shell-sidebar" style={{ flexShrink: 0 }}>
            <Sidebar />
          </div>
        )}

        {/* ── Content ── */}
        <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* ── Mobile top bar ── */}
          {!hideNav && (
            <div className="shell-mobile-top" style={{
              alignItems: "center",
              padding: "0 16px",
              height: "52px",
              background: "white",
              borderBottom: "1px solid #EAECF0",
              position: "sticky", top: 0, zIndex: 30, flexShrink: 0,
            }}>
              {/* Brand */}
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                <div style={{ width: "26px", height: "26px", background: "#111827", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Building2 size={14} color="white" />
                </div>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#9CA3AF" }}>ConSteel</span>
              </div>

              {/* Centered page title */}
              <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", pointerEvents: "none", maxWidth: "45%", overflow: "hidden" }}>
                <span style={{ fontSize: "15px", fontWeight: "700", color: "#111827", whiteSpace: "nowrap", display: "block", textOverflow: "ellipsis", overflow: "hidden" }}>
                  {pageTitle}
                </span>
              </div>

              {/* Search trigger */}
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setSearchOpen(true)}
                  style={{
                    width: "36px", height: "36px", borderRadius: "10px",
                    background: "#F3F4F6", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#E5E7EB"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F3F4F6"; }}
                >
                  <Search size={16} color="#374151" />
                </button>
              </div>
            </div>
          )}

          <div className="shell-main" style={{ padding: "28px 32px", flex: 1 }}>
            {children}
          </div>
        </main>

        {/* ── Mobile bottom tab bar ── */}
        {!hideNav && (
          <nav className="shell-bottom-nav" style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
            background: "white", borderTop: "1px solid #EAECF0",
            alignItems: "stretch", height: "64px",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}>
            {BOTTOM_TABS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href} style={{
                  flex: 1, display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: "3px",
                  textDecoration: "none", color: active ? "#111827" : "#9CA3AF",
                  transition: "color 0.15s", paddingTop: "2px",
                }}>
                  <div style={{
                    width: "32px", height: "28px", borderRadius: "8px",
                    background: active ? "#F3F4F6" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "background 0.15s",
                  }}>
                    <Icon size={18} />
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: active ? "700" : "500", letterSpacing: "0.01em" }}>
                    {label}
                  </span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </>
  );
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <PageTitleProvider>
      <ShellInner>{children}</ShellInner>
    </PageTitleProvider>
  );
}
