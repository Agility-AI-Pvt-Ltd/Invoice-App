// Status mapping utilities for invoice forms

// Valid status values that match the backend Prisma schema
export const VALID_STATUSES = {
  'DRAFT': 'DRAFT',      // Draft invoice (not finalized)
  'SAVE': 'SAVE',        // Saved invoice (not finalized)
  'SENT': 'SENT',        // Invoice sent to customer
  'PAID': 'PAID',        // Invoice paid by customer
  'OVERDUE': 'OVERDUE',  // Invoice past due date
  'CANCELLED': 'CANCELLED' // Invoice cancelled
} as const;

// Frontend display labels for status values
export const STATUS_LABELS = {
  'DRAFT': 'Draft',
  'SAVE': 'Saved',
  'SENT': 'Sent',
  'PAID': 'Paid',
  'OVERDUE': 'Overdue',
  'CANCELLED': 'Cancelled'
} as const;

// Map frontend display values to backend status values
export const FRONTEND_TO_BACKEND_STATUS = {
  'Draft': 'DRAFT',
  'Saved': 'SAVE', 
  'Sent': 'SENT',
  'Paid': 'PAID',
  'Overdue': 'OVERDUE',
  'Cancelled': 'CANCELLED',
  'Pending': 'SAVE'  // If frontend shows "Pending", send "SAVE" to backend
} as const;

// Map backend status values to frontend display values
export const BACKEND_TO_FRONTEND_STATUS = {
  'DRAFT': 'Draft',
  'SAVE': 'Saved',
  'SENT': 'Sent',
  'PAID': 'Paid',
  'OVERDUE': 'Overdue',
  'CANCELLED': 'Cancelled'
} as const;

// Utility function to validate status
export const isValidStatus = (status: string): status is keyof typeof VALID_STATUSES => {
  return status in VALID_STATUSES;
};

// Utility function to get display label for status
export const getStatusLabel = (status: string): string => {
  return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || status;
};

// Utility function to map frontend status to backend status
export const mapToBackendStatus = (frontendStatus: string): string => {
  return FRONTEND_TO_BACKEND_STATUS[frontendStatus as keyof typeof FRONTEND_TO_BACKEND_STATUS] || frontendStatus;
};

// Utility function to map backend status to frontend status
export const mapToFrontendStatus = (backendStatus: string): string => {
  return BACKEND_TO_FRONTEND_STATUS[backendStatus as keyof typeof BACKEND_TO_FRONTEND_STATUS] || backendStatus;
};



