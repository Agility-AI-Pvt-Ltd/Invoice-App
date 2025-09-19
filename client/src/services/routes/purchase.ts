// Import shared API configuration
import { BASE_URL } from '../../lib/api-config';

// Base endpoints for Purchase API
export const PURCHASE_API = {
  GET_ALL: `${BASE_URL}/api/purchases`, // Use expense invoices as purchase data
  //Not working
  METRICS: `${BASE_URL}/api/expenses/metrics`, // Use expense metrics for purchase metrics //No api
  IMPORT: `${BASE_URL}/api/expenses/import`, // Import purchases (using expense import)
  EXPORT: `${BASE_URL}/api/expenses/export`, // Export purchases (using expense export)
}; 