// Import shared API configuration
import { BASE_URL } from '../../lib/api-config';

// Base endpoints for Expense API
export const EXPENSE_API = {
  GET_ALL: `${BASE_URL}/api/expenses`, // Get all expense invoices
  METRICS: `${BASE_URL}/api/expenses/metrics`, // Get expense metrics (not implemented in backend)
  LAST: `${BASE_URL}/api/expense-invoices/last`, // Get last expense invoice
  DUPLICATE: `${BASE_URL}/api/expense-invoices`, // Duplicate expense invoice
  DELETE: `${BASE_URL}/api/expense-invoices`, // Delete expense invoice
  IMPORT: `${BASE_URL}/api/expenses/import`, // Import expenses
  EXPORT: `${BASE_URL}/api/expenses/export`, // Export expenses
}; 