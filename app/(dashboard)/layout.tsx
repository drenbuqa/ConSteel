import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SessionProvider from "@/components/SessionProvider";
import { ToastProvider } from "@/components/Toast";
import DashboardShell from "@/components/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <SessionProvider session={session}>
      <ToastProvider>
        <DashboardShell>
          {children}
        </DashboardShell>
      </ToastProvider>
    </SessionProvider>
  );
}
