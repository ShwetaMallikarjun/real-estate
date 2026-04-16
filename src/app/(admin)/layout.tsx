import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role="ADMIN" />
      <main className="flex-1 md:ml-64">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
