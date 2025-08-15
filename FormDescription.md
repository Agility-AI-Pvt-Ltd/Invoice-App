# Invoice App - Form API Endpoints Documentation

This document outlines all the required API endpoints for the various forms in the Invoice App, including request bodies, responses, and data structures.

## Table of Contents

1. [Customer Form](#customer-form)
2. [Expense Form](#expense-form)
3. [Invoice Form](#invoice-form)
4. [Product Form](#product-form)
5. [Sales Form](#sales-form)

---

## Customer Form

### Base URL: `/api/customers`

#### 1. Create Customer

- **Endpoint:** `POST /api/customers`
- **Description:** Create a new customer with all steps data
- **Request Body:**

```json
{
  "step1": {
    "customerType": "individual|business|organization",
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "companyName": "string",
    "website": "string"
  },
  "step2": {
    "billingAddress": {
      "address1": "string",
      "address2": "string",
      "city": "string",
      "state": "string",
      "pincode": "string",
      "country": "string"
    },
    "shippingAddress": {
      "address1": "string",
      "address2": "string",
      "city": "string",
      "state": "string",
      "pincode": "string",
      "country": "string"
    },
    "sameAsBilling": "boolean"
  },
  "step3": {
    "panNumber": "string",
    "documents": ["file1.pdf", "file2.jpg"],
    "isGstRegistered": "boolean",
    "gstNumber": "string",
    "placeOfSupply": "string",
    "currency": "INR|USD|EUR",
    "paymentTerms": "Net 15|Net 30|Net 45"
  },
  "step4": {
    "businessLogo": "file",
    "notes": "string",
    "tags": ["tag1", "tag2", "tag3"]
  }
}
```

- **Response:**

```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "customerId": "string",
    "customerNumber": "CUST001",
    "createdAt": "2024-01-01T00:00:00Z",
    "status": "active"
  }
}
```

#### 2. Get Customer

- **Endpoint:** `GET /api/customers/:customerId`
- **Response:**

```json
{
  "success": true,
  "data": {
    "customerId": "string",
    "customerNumber": "CUST001",
    "step1": {
      /* step1 data */
    },
    "step2": {
      /* step2 data */
    },
    "step3": {
      /* step3 data */
    },
    "step4": {
      /* step4 data */
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 3. Update Customer

- **Endpoint:** `PUT /api/customers/:customerId`
- **Request Body:** Same as Create Customer
- **Response:**

```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    "customerId": "string",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 4. List Customers

- **Endpoint:** `GET /api/customers`
- **Query Parameters:**
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
  - `search`: string (search by name, email, company)
  - `customerType`: string (filter by type)
  - `status`: string (active|inactive)
- **Response:**

```json
{
  "success": true,
  "data": {
    "customers": [
      /* array of customers */
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

#### 5. Delete Customer

- **Endpoint:** `DELETE /api/customers/:customerId`
- **Response:**

```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

---

## Expense Form

### Base URL: `/api/expenses`

#### 1. Create Expense

- **Endpoint:** `POST /api/expenses`
- **Description:** Create a new expense with all steps data
- **Request Body:**

```json
{
  "step1": {
    "expenseNumber": "string",
    "invoiceNumber": "string",
    "expenseDate": "2024-01-01",
    "dueDate": "2024-01-15",
    "paymentMethod": "online|pos|cash",
    "currency": "string",
    "status": "paid|unpaid|pending",
    "notes": "string"
  },
  "step2": {
    "vendorName": "string",
    "businessName": "string",
    "billingAddress": "string",
    "shippingAddress": "string",
    "email": "string",
    "country": "string",
    "state": "string",
    "gstin": "string",
    "panNumber": "string"
  },
  "step3": {
    "items": [
      {
        "name": "string",
        "hsn": "string",
        "qty": "number",
        "price": "number",
        "gst": "number",
        "discount": "number"
      }
    ]
  },
  "step4": {
    "terms": "string",
    "subtotal": "number",
    "discount": "number",
    "cgst": "number",
    "sgst": "number",
    "igst": "number",
    "shipping": "number",
    "total": "number"
  }
}
```

- **Response:**

```json
{
  "success": true,
  "message": "Expense created successfully",
  "data": {
    "expenseId": "string",
    "expenseNumber": "EXP001",
    "createdAt": "2024-01-01T00:00:00Z",
    "status": "pending"
  }
}
```

#### 2. Get Expense

- **Endpoint:** `GET /api/expenses/:expenseId`
- **Response:**

```json
{
  "success": true,
  "data": {
    "expenseId": "string",
    "expenseNumber": "EXP001",
    "step1": {
      /* step1 data */
    },
    "step2": {
      /* step2 data */
    },
    "step3": {
      /* step3 data */
    },
    "step4": {
      /* step4 data */
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 3. Update Expense

- **Endpoint:** `PUT /api/expenses/:expenseId`
- **Request Body:** Same as Create Expense
- **Response:**

```json
{
  "success": true,
  "message": "Expense updated successfully",
  "data": {
    "expenseId": "string",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 4. List Expenses

- **Endpoint:** `GET /api/expenses`
- **Query Parameters:**
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
  - `search`: string (search by expense number, vendor)
  - `status`: string (paid|unpaid|pending)
  - `dateFrom`: string (YYYY-MM-DD)
  - `dateTo`: string (YYYY-MM-DD)
- **Response:**

```json
{
  "success": true,
  "data": {
    "expenses": [
      /* array of expenses */
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

#### 5. Delete Expense

- **Endpoint:** `DELETE /api/expenses/:expenseId`
- **Response:**

```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

---

## Invoice Form

### Base URL: `/api/invoices`

#### 1. Create Invoice

- **Endpoint:** `POST /api/invoices`
- **Description:** Create a new invoice with all steps data
- **Request Body:**

```json
{
  "step1": {
    "invoiceNumber": "string",
    "paymentTerms": "net15|net30|net60",
    "invoiceDate": "2024-01-01",
    "dueDate": "2024-01-15",
    "status": "paid|unpaid|pending",
    "currency": "string"
  },
  "step2": {
    "seller": {
      "businessName": "string",
      "businessAddress": "string",
      "state": "string",
      "email": "string",
      "phone": "string",
      "gstin": "string"
    },
    "customer": {
      "customerName": "string",
      "companyName": "string",
      "billingAddress": "string",
      "email": "string",
      "phone": "string",
      "gstNumber": "string",
      "panNumber": "string"
    }
  },
  "step3": {
    "items": [
      {
        "name": "string",
        "hsn": "string",
        "qty": "number",
        "price": "number",
        "gst": "number",
        "discount": "number"
      }
    ]
  },
  "step4": {
    "terms": "string",
    "subtotal": "number",
    "discount": "number",
    "cgst": "number",
    "sgst": "number",
    "igst": "number",
    "shipping": "number",
    "total": "number"
  }
}
```

- **Response:**

```json
{
  "success": true,
  "message": "Invoice created successfully",
  "data": {
    "invoiceId": "string",
    "invoiceNumber": "INV001",
    "createdAt": "2024-01-01T00:00:00Z",
    "status": "pending"
  }
}
```

#### 2. Get Invoice

- **Endpoint:** `GET /api/invoices/:invoiceId`
- **Response:**

```json
{
  "success": true,
  "data": {
    "invoiceId": "string",
    "invoiceNumber": "INV001",
    "step1": {
      /* step1 data */
    },
    "step2": {
      /* step2 data */
    },
    "step3": {
      /* step3 data */
    },
    "step4": {
      /* step4 data */
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 3. Update Invoice

- **Endpoint:** `PUT /api/invoices/:invoiceId`
- **Request Body:** Same as Create Invoice
- **Response:**

```json
{
  "success": true,
  "message": "Invoice updated successfully",
  "data": {
    "invoiceId": "string",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 4. List Invoices

- **Endpoint:** `GET /api/invoices`
- **Query Parameters:**
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
  - `search`: string (search by invoice number, customer)
  - `status`: string (paid|unpaid|pending)
  - `dateFrom`: string (YYYY-MM-DD)
  - `dateTo`: string (YYYY-MM-DD)
- **Response:**

```json
{
  "success": true,
  "data": {
    "invoices": [
      /* array of invoices */
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

#### 5. Delete Invoice

- **Endpoint:** `DELETE /api/invoices/:invoiceId`
- **Response:**

```json
{
  "success": true,
  "message": "Invoice deleted successfully"
}
```

---

## Product Form

### Base URL: `/api/products`

#### 1. Create Product

- **Endpoint:** `POST /api/products`
- **Description:** Create a new product
- **Request Body:**

```json
{
  "productDetails": {
    "productName": "string",
    "productSku": "string",
    "category": "string",
    "subCategory": "string",
    "brandName": "string",
    "description": "string"
  },
  "pricingAndTax": {
    "purchasePrice": "number",
    "sellingPrice": "number",
    "discount": "number",
    "taxRate": "number"
  },
  "stockAndQuantity": {
    "paymentStatus": "string",
    "amountReceived": "number",
    "paymentMethod": "string",
    "dueAmount": "number"
  },
  "supplierVendor": {
    "vendorName": "string",
    "vendorProductCode": "string"
  },
  "imagesAndAttachments": {
    "productImage": "file",
    "remark": "string"
  }
}
```

- **Response:**

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "productId": "string",
    "productSku": "PROD001",
    "createdAt": "2024-01-01T00:00:00Z",
    "status": "active"
  }
}
```

#### 2. Get Product

- **Endpoint:** `GET /api/products/:productId`
- **Response:**

```json
{
  "success": true,
  "data": {
    "productId": "string",
    "productSku": "PROD001",
    "productDetails": {
      /* product details */
    },
    "pricingAndTax": {
      /* pricing data */
    },
    "stockAndQuantity": {
      /* stock data */
    },
    "supplierVendor": {
      /* vendor data */
    },
    "imagesAndAttachments": {
      /* attachments data */
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 3. Update Product

- **Endpoint:** `PUT /api/products/:productId`
- **Request Body:** Same as Create Product
- **Response:**

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "productId": "string",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 4. List Products

- **Endpoint:** `GET /api/products`
- **Query Parameters:**
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
  - `search`: string (search by name, SKU, category)
  - `category`: string (filter by category)
  - `brand`: string (filter by brand)
  - `status`: string (active|inactive)
- **Response:**

```json
{
  "success": true,
  "data": {
    "products": [
      /* array of products */
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

#### 5. Delete Product

- **Endpoint:** `DELETE /api/products/:productId`
- **Response:**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

---

## Sales Form

### Base URL: `/api/sales`

#### 1. Create Sale

- **Endpoint:** `POST /api/sales`
- **Description:** Create a new sale with all steps data
- **Request Body:**

```json
{
  "step1": {
    "invoiceNumber": "string",
    "paymentTerms": "net15|net30|net60",
    "salesDate": "2024-01-01",
    "salesDueDate": "2024-01-15",
    "salesperson": "string",
    "salesChannel": "string",
    "status": "paid|unpaid|pending",
    "currency": "string"
  },
  "step2": {
    "customerName": "string",
    "billingAddress": "string",
    "email": "string",
    "phone": "string",
    "gstin": "string",
    "customerType": "retail|wholesale|other",
    "shippingAddress": "string",
    "country": "string",
    "state": "string",
    "pan": "string"
  },
  "step3": {
    "items": [
      {
        "name": "string",
        "hsn": "string",
        "qty": "number",
        "price": "number",
        "gst": "number",
        "discount": "number"
      }
    ]
  },
  "step4": {
    "terms": "string",
    "subtotal": "number",
    "discount": "number",
    "cgst": "number",
    "sgst": "number",
    "igst": "number",
    "shipping": "number",
    "total": "number"
  }
}
```

- **Response:**

```json
{
  "success": true,
  "message": "Sale created successfully",
  "data": {
    "saleId": "string",
    "invoiceNumber": "SALE001",
    "createdAt": "2024-01-01T00:00:00Z",
    "status": "pending"
  }
}
```

#### 2. Get Sale

- **Endpoint:** `GET /api/sales/:saleId`
- **Response:**

```json
{
  "success": true,
  "data": {
    "saleId": "string",
    "invoiceNumber": "SALE001",
    "step1": {
      /* step1 data */
    },
    "step2": {
      /* step2 data */
    },
    "step3": {
      /* step3 data */
    },
    "step4": {
      /* step4 data */
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 3. Update Sale

- **Endpoint:** `PUT /api/sales/:saleId`
- **Request Body:** Same as Create Sale
- **Response:**

```json
{
  "success": true,
  "message": "Sale updated successfully",
  "data": {
    "saleId": "string",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

#### 4. List Sales

- **Endpoint:** `GET /api/sales`
- **Query Parameters:**
  - `page`: number (default: 1)
  - `limit`: number (default: 10)
  - `search`: string (search by invoice number, customer)
  - `status`: string (paid|unpaid|pending)
  - `salesperson`: string (filter by salesperson)
  - `dateFrom`: string (YYYY-MM-DD)
  - `dateTo`: string (YYYY-MM-DD)
- **Response:**

```json
{
  "success": true,
  "data": {
    "sales": [
      /* array of sales */
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

#### 5. Delete Sale

- **Endpoint:** `DELETE /api/sales/:saleId`
- **Response:**

```json
{
  "success": true,
  "message": "Sale deleted successfully"
}
```

---

## Common Response Formats

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    /* response data */
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "details": {
    /* additional error details */
  }
}
```

### Pagination Response

```json
{
  "success": true,
  "data": {
    "items": [
      /* array of items */
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## Authentication

All API endpoints require authentication. Include the following header:

```
Authorization: Bearer <access_token>
```

---

## File Upload

For file uploads (documents, images, logos), use `multipart/form-data` content type and include files in the request body.

---

## Rate Limiting

- **Standard endpoints:** 100 requests per minute
- **File upload endpoints:** 20 requests per minute
- **Bulk operations:** 10 requests per minute

---

## Error Codes

- `400` - Bad Request (Invalid input data)
- `401` - Unauthorized (Missing or invalid token)
- `403` - Forbidden (Insufficient permissions)
- `404` - Not Found (Resource doesn't exist)
- `409` - Conflict (Resource already exists)
- `422` - Validation Error (Invalid data format)
- `429` - Too Many Requests (Rate limit exceeded)
- `500` - Internal Server Error

---

## Notes

1. All dates should be in ISO 8601 format (YYYY-MM-DD)
2. All monetary values should be numbers (not strings)
3. File uploads have a maximum size limit of 10MB per file
4. HSN codes should follow the standard Indian GST classification
5. GST calculations are handled automatically by the backend
6. All IDs are UUID strings
7. Status fields are predefined enums as specified in each form
