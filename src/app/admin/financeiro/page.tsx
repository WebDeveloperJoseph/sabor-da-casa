import { FinanceiroDashboard } from "@/components/admin/financeiro/FinanceiroDashboard";
import { requireFinanceAuth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const { authenticated } = await requireFinanceAuth();
  if (!authenticated) redirect("/admin/financeiro/login");
  return <FinanceiroDashboard />;
}
