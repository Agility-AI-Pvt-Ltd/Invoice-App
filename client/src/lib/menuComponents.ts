import { lazy, type JSX } from "react";

export const menuComponentMap: Record<string, React.LazyExoticComponent<() => JSX.Element>> = {
    dashboard: lazy(() => import("@/pages/dashboard")),
    "my-customers": lazy(() => import("@/pages/my-customer")),
    'inventory' : lazy(() => import("@/pages/inventory")),
};
