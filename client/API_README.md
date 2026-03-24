
# Mock API Documentation

This document outlines the mock API endpoints used in the application.

## Customer API

**Endpoint:** `GET /api/customers`

This endpoint retrieves a paginated list of customers.

**Query Parameters:**

*   `page` (number, optional): The page number to retrieve.
*   `limit` (number, optional): The number of items per page.

**Response Body:**

```json
{
    "data": [
        {
            "id": "cus_001",
            "company": {
                "name": "Amazon",
                "email": "Amazon@123gmail.com",
                "logo": "/avatars/amazon.png"
            },
            "customer": {
                "name": "Customer Name",
                "avatar": "/avatars/user1.png"
            },
            "phone": "956***657",
            "status": "Active",
            "lastInvoice": "29 July 2024",
            "balance": "₹2000"
        }
    ],
    "pagination": {
        "total": 100,
        "perPage": 10,
        "currentPage": 1,
        "totalPages": 100
    }
}
```

## Invoice API

**Endpoint:** `GET /api/invoices/metrics`

This endpoint retrieves metrics for invoices.

**Query Parameters:**

*   `year` (number, optional): The year to retrieve data for.

**Response Body:**

```json
{
  "totalInvoices": 23345,
  "paidInvoices": 18676,
  "pendingInvoices": 4669,
  "totalReceivables": 23345,
  "unpaidInvoices": 4669,
  "overdueAmount": 2334,
  "cashAmount": 23345,
  "incoming": 23345,
  "outgoing": 15000,
  "changePercentage": 3.46
}
```

## Sales API

**Endpoint:** `GET /api/sales`

This endpoint retrieves a list of sales records.

**Response Body:**

```json
[
  {
    "id": "1",
    "invoiceNumber": "INV-2024/001",
    "customerName": "Customer Name",
    "product": "Product 1",
    "quantity": 1000,
    "unitPrice": 2000,
    "totalAmount": 50000,
    "dateOfSale": "29 July 2024",
    "paymentStatus": "Paid"
  }
]
```

## Expense API

**Endpoint:** `GET /api/expenses`

This endpoint retrieves a list of expenses.

**Response Body:**

```json
[
  {
    "id": "expense-1",
    "expenseId": "EX-2024/001",
    "title": "Product 1",
    "vendorName": "Vendor Name",
    "vendorAvatar": "V",
    "paymentMethod": "Cash",
    "amount": 2000,
    "status": "Paid",
    "date": "29 July 2024"
  }
]
```

## Purchase API

**Endpoint:** `GET /api/purchases`

This endpoint retrieves a paginated list of purchase items.

**Query Parameters:**

*   `page` (number, optional): The page number to retrieve.
*   `limit` (number, optional): The number of items per page.
*   `filters` (object, optional): An object containing filter criteria.

**Response Body:**

```json
{
  "data": [
    {
      "id": "1",
      "purchaseId": "PUR-2024/001",
      "supplierName": "Supplier Name",
      "supplierAvatar": "/placeholder.svg?height=32&width=32",
      "product": "Product 1",
      "quantity": 1000,
      "balance": 2000,
      "purchaseDate": "29 July 2024",
      "totalAmount": 5000,
      "paymentStatus": "Paid"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 21,
    "totalPages": 3
  }
}
```

## Tax API

**Endpoint:** `GET /api/tax/summary`

This endpoint retrieves a summary of tax data.

**Response Body:**

```json
[
  {
    "id": "1",
    "taxType": "CGST",
    "taxRate": "18%",
    "taxableAmount": "₹2000",
    "taxCollected": "₹2000",
    "taxPaid": "₹2000",
    "netTaxLiability": "₹5000",
    "period": "29 July 2024",
    "noOfInvoices": 2,
    "expanded": false,
    "children": [],
    "isParent": false
  }
]
```
