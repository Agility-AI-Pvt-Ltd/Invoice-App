// Types for Sales Return based on backend API structure

export interface SalesReturn {
  id: number;
  gstin?: string;
  partyName: string;
  billNo: string;
  date: string; // ISO date string
  state?: string;
  qty: number;
  hsn?: string;
  rate: number;
  taxable: number;
  igst: number;
  cgst: number;
  sgst: number;
  total: number;
  remark?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface SalesReturnCreate {
  gstin?: string;
  partyName: string;
  billNo: string;
  date: string; // ISO date string
  state?: string;
  qty: number;
  hsn?: string;
  rate: number;
  taxable: number;
  igst: number;
  cgst: number;
  sgst: number;
  total: number;
  remark?: string;
}

export interface SalesReturnUpdate {
  gstin?: string;
  partyName?: string;
  billNo?: string;
  date?: string;
  state?: string;
  qty?: number;
  hsn?: string;
  rate?: number;
  taxable?: number;
  igst?: number;
  cgst?: number;
  sgst?: number;
  total?: number;
  remark?: string;
}

export interface SalesReturnFilters {
  search?: string;
  startDate?: string;
  endDate?: string;
  state?: string;
  partyName?: string;
}

