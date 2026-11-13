"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OpportunitiesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/crm/sales-deals");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <p className="text-lg font-bold text-slate-200">Redirecting to Sales Deals…</p>
        <p className="text-xs text-slate-400 mt-1">/crm/opportunities → /crm/sales-deals</p>
      </div>
    </div>
  );
}
