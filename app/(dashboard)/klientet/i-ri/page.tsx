"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewClientRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace("/klientet?new=1"); }, [router]);
  return null;
}
