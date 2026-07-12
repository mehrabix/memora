import { redirect } from "next/navigation";
import { auth } from "@/src/lib/auth";
import { DashboardNav } from "@/src/components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1">
      <DashboardNav />
      <div className="min-w-0 flex-1 px-4 pb-20 pt-8 sm:px-8 md:pb-8">
        {children}
      </div>
    </div>
  );
}
