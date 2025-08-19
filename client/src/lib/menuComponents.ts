
import { lazy } from "react";
import React from "react";

export const menuComponentMap: Record<string, React.LazyExoticComponent<() => React.JSX.Element>> = {
    'dashboard': lazy(() => import("@/pages/dashboard")),
    "my-customers": lazy(() => import("@/pages/my-customer")),
    'inventory' : lazy(() => import("@/pages/inventory")),
    // 'purchases' : lazy(() => import("@/pages/purchase")),
    'expenses' : lazy(() => import("@/pages/expenses")),
    'invoices': lazy(() => import("@/pages/invoices")),
    "sales": lazy(() => import("@/pages/sales-revenue")),
    "sales-revenue": lazy(() => import("@/pages/sales-revenue")),
    "tax-summary": lazy(() => import("@/pages/tax-summary")),
    "settings":lazy(()=> import("@/pages/settings")),
    "team":lazy(()=> import("@/pages/team-employees"))
};
