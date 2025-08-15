import axios from 'axios';
import { TAX_API } from '../routes/tax';

// Types
export interface TaxMetrics {
  taxCollected: number;
  taxPaid: number;
  netTaxLiability: number;
  taxableSales: number;
}

export interface TaxTimeseriesData {
  date: string;
  collected: number;
  paid: number;
}

export interface TaxSummaryRow {
  taxType?: string;
  taxRate?: number;
  period?: string;
  taxableAmount: number;
  taxCollected: number;
  taxPaid: number;
  netTaxLiability: number;
  noOfInvoices: number;
}

export interface TaxSummaryResponse {
  rows: TaxSummaryRow[];
  pagination: any;
}

export interface TaxFilters {
  from?: string;
  to?: string;
  groupBy?: string;
}

/**
 * Get tax metrics (collected, paid, liability, taxable sales)
 */
export const getTaxMetrics = async (
  token: string,
  date?: string,
  from?: string,
  to?: string
): Promise<TaxMetrics> => {
  try {
    const params: any = {};
    if (date) params.date = date;
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await axios.get(TAX_API.METRICS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tax metrics:', error);
    throw error;
  }
};

/**
 * Get tax collected timeseries data
 */
export const getTaxCollectedTimeseries = async (
  token: string,
  from?: string,
  to?: string,
  interval: string = 'day'
): Promise<{ series: TaxTimeseriesData[] }> => {
  try {
    const params: any = { interval };
    if (from) params.from = from;
    if (to) params.to = to;

    const response = await axios.get(TAX_API.COLLECTED_TIMESERIES, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tax timeseries:', error);
    throw error;
  }
};

/**
 * Get tax summary with grouping options
 */
export const getTaxSummary = async (
  token: string,
  from?: string,
  to?: string,
  groupBy?: string
): Promise<TaxSummaryResponse> => {
  try {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    if (groupBy) params.groupBy = groupBy;

    const response = await axios.get(TAX_API.SUMMARY, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching tax summary:', error);
    throw error;
  }
};

/**
 * Export tax summary to CSV
 */
export const exportTaxSummary = async (
  token: string,
  from?: string,
  to?: string,
  groupBy?: string
): Promise<Blob> => {
  try {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;
    if (groupBy) params.groupBy = groupBy;

    const response = await axios.get(TAX_API.SUMMARY_EXPORT, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting tax summary:', error);
    throw error;
  }
}; 