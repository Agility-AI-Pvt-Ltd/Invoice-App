import { lazy, type JSX } from "react";
import React from "react";

export const menuComponentMap: Record<string, React.LazyExoticComponent<() => React.JSX.Element>> = {
    dashboard: lazy(() => import("@/pages/dashboard")),
    "my-customers": lazy(() => import("@/pages/my-customer")),
    'inventory' : lazy(() => import("@/pages/inventory")),
    invoices: lazy(() => import("@/pages/invoices")),
    "sales-revenue": lazy(() => import("@/pages/sales-revenue")),
    "expenses-purchases": lazy(() => import("@/pages/expenses-purchases")),
    "tax-summary": lazy(() => import("@/pages/tax-summary"))
};
