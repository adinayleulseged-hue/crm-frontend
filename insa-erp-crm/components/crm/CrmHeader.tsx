"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Target,
  TrendingUp,
  FileText,
  DollarSign,
  UserCheck,
  AlertCircle,
} from "lucide-react";

interface CrmHeaderProps {
  activeRole?: string;
  onRoleChange?: (role: string) => void;
  kpiOverrides?: {
    totalLeads?: string;
    activeLeads?: string;
    pipeline?: string;
    openOpps?: string;
    winRate?: string;
    salesOrders?: string;
    pendingOrders?: string;
    revenue?: string;
    customers?: string;
    activeCustomers?: string;
    overdueInvoices?: string;
    unpaidInvoices?: string;
  };
}

export default function CrmHeader({
  activeRole = "SALES REP",
  onRoleChange,
  kpiOverrides,
}: CrmHeaderProps) {
  const [currentRole, setCurrentRole] = useState(activeRole);

  const roles = [
    { id: "SALES MANAGER", label: "SALES MANAGER", path: "/dashboard/sales-manager" },
    { id: "SALES REP", label: "SALES REP", path: "/dashboard/sales-rep" },
    { id: "FINANCE OFFICER", label: "FINANCE", path: "/dashboard/finance-officer" },
    { id: "AUDITOR", label: "AUDITOR", path: "/dashboard/auditor" },
    { id: "CUSTOMER", label: "CUSTOMER", path: "/dashboard/customer" },
  ];

  const handleRoleSelect = (role: typeof roles[0]) => {
    setCurrentRole(role.id);
    if (onRoleChange) {
      onRoleChange(role.id);
    }
  };

  const kpis = [
    {
      id: "leads",
      icon: Users,
      iconColor: "text-rose-500 bg-rose-50",
      value: kpiOverrides?.totalLeads ?? "8",
      label: "Total Leads",
      subtext: kpiOverrides?.activeLeads ? `${kpiOverrides.activeLeads} active` : "8 active",
      href: "/crm/leads",
    },
    {
      id: "pipeline",
      icon: Target,
      iconColor: "text-purple-600 bg-purple-50",
      value: kpiOverrides?.pipeline ?? "ETB 7.3M",
      label: "Pipeline",
      subtext: kpiOverrides?.openOpps ? `${kpiOverrides.openOpps} open deals` : "7 open deals",
      href: "/crm/sales-deals/pipeline",
    },
    {
      id: "winrate",
      icon: TrendingUp,
      iconColor: "text-emerald-600 bg-emerald-50",
      value: kpiOverrides?.winRate ?? "13%",
      label: "Win Rate",
      subtext: "Lead → Closed Won",
      href: "/crm/reports",
    },
    {
      id: "orders",
      icon: FileText,
      iconColor: "text-slate-600 bg-slate-100",
      value: kpiOverrides?.salesOrders ?? "6",
      label: "Sales Orders",
      subtext: kpiOverrides?.pendingOrders ? `${kpiOverrides.pendingOrders} pending approval` : "1 pending approval",
      href: "/crm/orders",
    },
    {
      id: "revenue",
      icon: DollarSign,
      iconColor: "text-blue-600 bg-blue-50",
      value: kpiOverrides?.revenue ?? "ETB 7.5M",
      label: "Revenue",
      subtext: "Total orders value",
      href: "/crm/orders",
    },
    {
      id: "customers",
      icon: UserCheck,
      iconColor: "text-sky-600 bg-sky-50",
      value: kpiOverrides?.customers ?? "8",
      label: "Customers",
      subtext: kpiOverrides?.activeCustomers ? `${kpiOverrides.activeCustomers} active` : "5 active",
      href: "/crm/customers",
    },
    {
      id: "invoices",
      icon: AlertCircle,
      iconColor: "text-red-600 bg-red-50",
      value: kpiOverrides?.overdueInvoices ?? "1",
      label: "Overdue Invoices",
      subtext: kpiOverrides?.unpaidInvoices ? `${kpiOverrides.unpaidInvoices} unpaid` : "2 unpaid",
      href: "/crm/invoices",
    },
  ];

  return (
    <div className="space-y-4 mb-6">
      {/* Title & Subtitle + Role selector */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#0f172a] sm:text-2xl">
            Sales & Customer Relationship Management
          </h1>
          <p className="mt-1 text-xs text-slate-500 flex flex-wrap gap-1.5 items-center">
            <span>Leads</span>
            <span>·</span>
            <span>Sales Deals</span>
            <span>·</span>
            <span>Orders</span>
            <span>·</span>
            <span>Invoices</span>
            <span>·</span>
            <span>Payments</span>
            <span>·</span>
            <span>Campaigns</span>
            <span>·</span>
            <span>Segments</span>
            <span>·</span>
            <span>Analytics</span>
            <span>·</span>
            <span>Audit</span>
          </p>
        </div>

        {/* Role Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {roles.map((role) => {
            const isSelected = currentRole.toUpperCase().includes(role.id) || currentRole.toUpperCase() === role.id;
            return (
              <Link
                key={role.id}
                href={role.path}
                className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wider transition uppercase no-underline ${
                  isSelected
                    ? "bg-red-50 text-[#c8102e] border border-red-300 shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {role.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* 7 KPI Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
        {kpis.map((kpi) => {
          const IconComp = kpi.icon;
          return (
            <Link
              key={kpi.id}
              href={kpi.href}
              className="group flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${kpi.iconColor}`}>
                  <IconComp className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-2.5">
                <div className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-[#c8102e] transition">
                  {kpi.value}
                </div>
                <div className="text-[11px] font-semibold text-slate-600">
                  {kpi.label}
                </div>
                <div className="text-[10px] text-slate-400">
                  {kpi.subtext}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Module Integrations Banner */}
      <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 shrink-0">
            Module Integrations
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50/80 px-3 py-1 text-[11px] text-blue-900 border border-blue-100">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <span className="font-semibold text-blue-700">MMS (Inventory)</span>
              <span className="text-slate-500">— Stock check & reservation on order</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-50/80 px-3 py-1 text-[11px] text-purple-900 border border-purple-100">
              <span className="h-2 w-2 rounded-full bg-purple-600" />
              <span className="font-semibold text-purple-700">FMS (Finance)</span>
              <span className="text-slate-500">— Credit limit check & invoice generation</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50/80 px-3 py-1 text-[11px] text-emerald-900 border border-emerald-100">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span className="font-semibold text-emerald-700">HRM</span>
              <span className="text-slate-500">— Sales rep assignment & territory</span>
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-[11px] text-slate-700 border border-slate-200">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span className="font-semibold text-slate-700">Audit Service</span>
              <span className="text-slate-500">— All actions logged for compliance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
