"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OpportunitiesCreateRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/crm/sales-deals/create");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <p className="text-lg font-bold text-slate-200">Redirecting to Create Sales Deal…</p>
      </div>
    </div>
  );
}
