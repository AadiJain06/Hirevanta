import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Unauthenticated access to protected admin routes is blocked by middleware,
  // which redirects to /admin/login. The login page has no session, so render
  // it without the dashboard shell.
  if (!session) {
    return <>{children}</>;
  }

  return <AdminShell session={session}>{children}</AdminShell>;
}
