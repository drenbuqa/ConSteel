"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Building2 } from "lucide-react";
import Sidebar from "./Sidebar";

// Pages where the sidebar/nav should be hidden (full-screen form pages)
const isFormPath = (p: string) =>
  p === "/projektet/i-ri" || p.endsWith("/redakto");

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname();
  const [open, setOpen] = useState(false);

  // Close mobile menu on navigation
  useEffect(() => { setOpen(false); }, [pathname]);

  const hideNav = isFormPath(pathname);

  return (
    <>
      <style>{`
        /* Desktop: show sidebar, hide mobile bar */
        .shell-sidebar    { display: flex; }
        .shell-mobile-bar { display: none !important; }

        /* Mobile: hide sidebar, show mobile bar */
        @media (max-width: 768px) {
          .shell-sidebar    { display: none !important; }
          .shell-mobile-bar { display: flex !important; }
          .shell-main       { padding: 16px !important; }
        }
      `}</style>

      <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#F2F4F8" }}>

        {/* ── Desktop sidebar ───────────────────────────── */}
        {!hideNav && (
          <div className="shell-sidebar" style={{ flexShrink: 0 }}>
            <Sidebar />
          </div>
        )}

        {/* ── Mobile overlay ────────────────────────────── */}
        {!hideNav && open && (
          <>
            {/* Backdrop */}
            <div
              onClick={() => setOpen(false)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 40, backdropFilter: "blur(2px)" }}
            />
            {/* Drawer */}
            <div style={{ position: "fixed", left: 0, top: 0, bottom: 0, width: "240px", zIndex: 50 }}>
              <Sidebar onClose={() => setOpen(false)} />
            </div>
          </>
        )}

        {/* ── Content area ──────────────────────────────── */}
        <main style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", minWidth: 0 }}>

          {/* Mobile top bar */}
          {!hideNav && (
            <div
              className="shell-mobile-bar"
              style={{
                alignItems: "center", justifyContent: "space-between",
                padding: "12px 16px", background: "white",
                borderBottom: "1px solid #EAECF0", gap: "12px",
                position: "sticky", top: 0, zIndex: 30,
              }}
            >
              <button
                onClick={() => setOpen(true)}
                style={{ background: "#F3F4F6", border: "none", borderRadius: "8px", width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
              >
                <Menu size={18} color="#374151" />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
                <div style={{ width: "28px", height: "28px", background: "#111827", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Building2 size={15} color="white" />
                </div>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#111827" }}>ConSteel</span>
              </div>
            </div>
          )}

          <div className="shell-main" style={{ padding: "28px 32px", flex: 1 }}>
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
