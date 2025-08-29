import api from "@/lib/api";

export type Customer = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  state?: string;
  gst?: string;
  pan?: string;
  companyName?: string;
};

export async function fetchCustomerByName(name: string): Promise<Customer | null> {
  if (!name || name.trim().length === 0) return null;
  try {
    const res = await api.get(`/api/customers/search/${encodeURIComponent(name.trim())}`);
    // backend may return { data } or direct object; normalize
    const data = res?.data?.data ?? res?.data ?? null;
    if (!data) return null;
    return data as Customer;
  } catch (err) {
    console.error("fetchCustomerByName error", err);
    return null;
  }
}

export type InventoryLookup = {
  name?: string;
  description?: string;
  unit_price?: number;
  price?: number;
  gst_rate?: number;
  gst?: number;
  hsn_code?: string;
  hsn?: string;
  discount?: number;
};

export async function fetchInventoryByCode(code: string): Promise<InventoryLookup | null> {
  if (!code || code.trim().length === 0) return null;
  try {
    const res = await api.get(`/api/inventory/${encodeURIComponent(code.trim())}`);
    const data = res?.data?.data ?? res?.data ?? null;
    if (!data) return null;
    return data as InventoryLookup;
  } catch (err) {
    console.error("fetchInventoryByCode error", err);
    return null;
  }
}


