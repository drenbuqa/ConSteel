"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

interface PageTitleCtx {
  dynamicTitle: string | null;
  setDynamicTitle: (t: string | null) => void;
}

const Ctx = createContext<PageTitleCtx>({
  dynamicTitle: null,
  setDynamicTitle: () => {},
});

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [dynamicTitle, setDynamicTitleState] = useState<string | null>(null);
  const setDynamicTitle = useCallback((t: string | null) => setDynamicTitleState(t), []);
  return <Ctx.Provider value={{ dynamicTitle, setDynamicTitle }}>{children}</Ctx.Provider>;
}

export function usePageTitle() {
  return useContext(Ctx);
}

// Call this in a page component to set the mobile top bar title dynamically.
// Clears on unmount so navigating away resets to the default derived title.
export function useSetPageTitle(title: string | null) {
  const { setDynamicTitle } = useContext(Ctx);
  useEffect(() => {
    setDynamicTitle(title);
    return () => setDynamicTitle(null);
  }, [title, setDynamicTitle]);
}
