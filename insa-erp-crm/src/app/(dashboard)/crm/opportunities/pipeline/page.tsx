"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OpportunitiesPipelineRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/crm/sales-deals/pipeline");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <p className="text-lg font-bold text-slate-200">Redirecting to Sales Deals Pipeline…</p>
        <p className="text-xs text-slate-400 mt-1">/crm/opportunities/pipeline → /crm/sales-deals/pipeline</p>
      </div>
    </div>
  );
}
