
import { lazy } from "react";
import React from "react";

export const menuComponentMap: Record<string, React.LazyExoticComponent<() => React.JSX.Element>> = {
    'dashboard': lazy(() => import("@/pages/dashboard")),
    "my-customers": lazy(() => import("@/pages/my-customer")),
    'items' : lazy(() => import("@/pages/inventory")),
    'invoices' : lazy(() => import("@/pages/Receipts")),
    'reports' : lazy(() => import("@/pages/Reports")),
    // 'purchases' : lazy(() => import("@/pages/purchase")),
    'expenses' : lazy(() => import("@/pages/expenses")),
    'sales': lazy(() => import("@/pages/invoices")),
    // "sales": lazy(() => import("@/pages/sales-revenue")),
    "sales-revenue": lazy(() => import("@/pages/sales-revenue")),
    "tax-summary": lazy(() => import("@/pages/tax-summary")),
    "profile":lazy(()=> import("@/pages/settings")),
    "team":lazy(()=> import("@/pages/team-employees"))
};
