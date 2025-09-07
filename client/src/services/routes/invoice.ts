// Import shared API configuration
import { BASE_URL } from '../../lib/api-config';

// Base endpoints for Invoice API
export const INVOICE_API = {
  GET_ALL: `${BASE_URL}/api/invoices`, // Get all invoices
  GET_BY_ID: `${BASE_URL}/api/invoices`, // Get invoice by ID
  CREATE: `${BASE_URL}/api/invoices`, // Create new invoice
  UPDATE: `${BASE_URL}/api/invoices`, // Update invoice
  DELETE: `${BASE_URL}/api/invoices`, // Delete invoice
  DUPLICATE: `${BASE_URL}/api/invoices`, // Duplicate invoice
  DOWNLOAD: `${BASE_URL}/api/invoices`, // Download invoice as PDF
  EXPORT: `${BASE_URL}/api/invoices/export`, // Export invoices to CSV
  CLIENTS: `${BASE_URL}/api/invoices/clients`, // Get invoice clients
  CLIENT_DETAILS: `${BASE_URL}/api/invoices/clients`, // Get client details by name
  SCAN: `${BASE_URL}/api/scan-invoice`, // Scan invoice from image
}; 