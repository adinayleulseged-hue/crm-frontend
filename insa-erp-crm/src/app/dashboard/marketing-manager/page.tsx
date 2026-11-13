"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MarketingManagerRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/crm/invoices");
  }, [router]);
  return null;
}
