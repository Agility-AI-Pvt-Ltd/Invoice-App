
import { lazy } from "react";

import { lazy, type JSX } from "react";

import React from "react";

export const menuComponentMap: Record<string, React.LazyExoticComponent<() => React.JSX.Element>> = {
    'dashboard': lazy(() => import("@/pages/dashboard")),
    "my-customers": lazy(() => import("@/pages/my-customer")),
    'inventory' : lazy(() => import("@/pages/inventory")),

    'purchases' : lazy(() => import("@/pages/purchase")),
    'expenses' : lazy(() => import("@/pages/expenses-purchases")),
    'invoices': lazy(() => import("@/pages/invoices")),
    "sales": lazy(() => import("@/pages/sales-revenue")),
    

    invoices: lazy(() => import("@/pages/invoices")),
    "sales-revenue": lazy(() => import("@/pages/sales-revenue")),
    "expenses-purchases": lazy(() => import("@/pages/expenses-purchases")),
    "tax-summary": lazy(() => import("@/pages/tax-summary"))

};
