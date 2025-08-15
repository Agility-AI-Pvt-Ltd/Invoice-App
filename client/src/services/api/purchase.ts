import axios from 'axios';
import { PURCHASE_API } from '../routes/purchase';

// Types
export interface PurchaseItem {
  id: string;
  purchaseId: string;
  supplierName: string;
  supplierAvatar: string;
  product: string;
  quantity: number;
  balance: number;
  purchaseDate: string;
  totalAmount: number;
  paymentStatus: string;
}

export interface SummaryCardData {
  title: string;
  value: number;
  percentageChange: number;
  isPositive: boolean;
  unit?: string;
  borderColor?: string;
  extraInfo?: {
    label: string;
    value: number;
    progressBar: {
      current: number;
      total: number;
    };
  };
}

export interface PurchaseMetrics {
  totalPurchase: number;
  currentMonthPurchase: number;
  totalPurchaseOrders: number;
  thisMonthOrders: number;
}

export interface PurchaseFilters {
  status?: string;
  fromDate?: string;
  toDate?: string;
  supplier?: string;
}

/**
 * Get purchase metrics (total, current month, orders)
 */
export const getPurchaseMetrics = async (token: string): Promise<PurchaseMetrics> => {
  try {
    // Since there's no dedicated purchase metrics API, we'll use sales stats as a proxy
    // and calculate purchase-related metrics from expense invoices
    const response = await axios.get(PURCHASE_API.METRICS, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching purchase metrics:', error);
    throw error;
  }
};

/**
 * Get purchase summary cards data
 */
export const getSummaryCardsData = async (token: string): Promise<SummaryCardData[]> => {
  try {
    const metrics = await getPurchaseMetrics(token);

    return [
      {
        title: "Total Purchase",
        value: metrics.totalPurchase,
        percentageChange: 3.46, // This would come from backend comparison
        isPositive: true,
        unit: "₹",
        borderColor: "border-blue-500",
      },
      {
        title: "Current Month Purchase",
        value: metrics.currentMonthPurchase,
        percentageChange: 3.46,
        isPositive: false,
        unit: "₹",
      },
      {
        title: "Total Purchase Orders",
        value: metrics.totalPurchaseOrders,
        percentageChange: 3.46,
        isPositive: true,
        extraInfo: {
          label: "This Month Orders",
          value: metrics.thisMonthOrders,
          progressBar: {
            current: metrics.thisMonthOrders,
            total: metrics.totalPurchaseOrders,
          },
        },
      },
    ];
  } catch (error) {
    console.error('Error fetching summary cards data:', error);
    throw error;
  }
};

/**
 * Get purchase items with pagination and filters
 */
export const getPurchaseItems = async (
  token: string,
  page: number = 1,
  limit: number = 10,
  filters?: PurchaseFilters
): Promise<{ items: PurchaseItem[]; total: number; page: number; totalPages: number }> => {
  try {
    const response = await axios.get(PURCHASE_API.GET_ALL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        page,
        limit,
        ...filters,
      },
    });

    // Ensure data exists and is an array
    if (!response.data || !Array.isArray(response.data.data) || response.data.data.length === 0) {
      return {
        items: [],
        total: 0,
        page: response.data?.pagination?.page || 1,
        totalPages: response.data?.pagination?.totalPages || 0,
      };
    }

    const expenses = response.data.data;
    const pagination = response.data.pagination || {
      page: 1,
      totalPages: 0,
      total: 0,
    };

    // Transform API response to PurchaseItem[]
    const items: PurchaseItem[] = expenses.map((expense: any, index: number) => ({
      id: expense._id || `purchase-${index + 1}`,
      purchaseId: expense.invoiceNumber,
      supplierName: expense.billFrom?.name || 'Supplier Name',
      supplierAvatar: expense.billFrom?.name?.charAt(0) || 'S',
      product: expense.items?.[0]?.description || 'Product',
      quantity: expense.items?.[0]?.quantity || 0,
      balance: expense.total || 0,
      purchaseDate: new Date(expense.date).toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      totalAmount: expense.total || 0,
      paymentStatus: expense.status === 'paid' ? 'Paid' : 'Unpaid',
    }));

    return {
      items,
      total: pagination.total,
      page: pagination.page,
      totalPages: pagination.totalPages,
    };
  } catch (error) {
    console.error('Error fetching purchase items:', error);
    throw error;
  }
};


/**
 * Import purchases from file
 */
export const importPurchases = async (token: string, file: File): Promise<{ imported: number; skipped: number }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(PURCHASE_API.IMPORT, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error importing purchases:', error);
    throw error;
  }
};

/**
 * Export purchases to CSV
 */
export const exportPurchases = async (token: string): Promise<Blob> => {
  try {
    const response = await axios.get(PURCHASE_API.EXPORT, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting purchases:', error);
    throw error;
  }
}; 