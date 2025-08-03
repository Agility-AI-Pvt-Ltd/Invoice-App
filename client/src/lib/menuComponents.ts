import { lazy } from "react";
import React from "react";

export const menuComponentMap: Record<string, React.LazyExoticComponent<() => React.JSX.Element>> = {
    dashboard: lazy(() => import("@/pages/dashboard")),
    "my-customers": lazy(() => import("@/pages/my-customer")),
    invoices: lazy(() => import("@/pages/invoices")),
};
