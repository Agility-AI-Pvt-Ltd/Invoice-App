# Invoice App – Dashboard Data Requirements

This document outlines the data requirements for integrating the frontend dashboard with backend APIs. It details each dashboard component, the type of data it needs, suggested API endpoints, expected data schemas, and backend processing notes. This will ensure a smooth transition from static to dynamic data.

---

## Dashboard Components & Data Requirements

### 1. Stat Cards (`StatCard`)
**Displayed:** 4 cards (Total Sales, New Customers, Refund Requests, Total Orders)

**Data Needed:**
- `title` (string): Card title (e.g., "Total Sales")
- `value` (string/number): Main metric (e.g., ₹ 23,345)
- `change` (number): Percentage change (e.g., 3.46)
- `changeLabel` (string): Context for change (e.g., "Since last month")
- `trend` ("up" | "down"): Direction of change

**API Endpoint Suggestion:**  
`GET /api/dashboard/stats`

**Expected Response:**
```json
[
  {
    "title": "Total Sales",
    "value": 23345,
    "change": 3.46,
    "changeLabel": "Since last month",
    "trend": "up"
  },
  ...
]
```

**Backend Processing:**
- Calculate totals and changes (e.g., compare current period to previous).
- Format currency and numbers on the backend or send as raw numbers for frontend formatting.
- Calculate `trend` based on whether `change` is positive or negative.

---

### 2. Sales Report Chart (`SalesReportCard`)
**Displayed:** Line chart comparing "Total Sales" and "Total Expenses" over months.

**Data Needed:**
- `labels`: Array of months (e.g., ["Jan", "Feb", ...])
- `datasets`: Array of objects:
  - `label`: "Total Sales" or "Total Expenses"
  - `data`: Array of numbers (one per month)
  - `backgroundColor`, `borderColor`: Chart colors

**API Endpoint Suggestion:**  
`GET /api/dashboard/sales-report?period=this-year`

**Expected Response:**
```json
{
  "labels": ["Jan", "Feb", "Mar", ...],
  "datasets": [
    {
      "label": "Total Sales",
      "data": [200, 300, ...],
      "backgroundColor": "#22c55e",
      "borderColor": "#22c55e"
    },
    {
      "label": "Total Expenses",
      "data": [650, 400, ...],
      "backgroundColor": "#f87171",
      "borderColor": "#f87171"
    }
  ]
}
```

**Backend Processing:**
- Aggregate sales and expenses by month.
- Allow filtering by period (year, month, etc.).
- Return data in chart.js-compatible format.

**Formatting:**
- Currency formatting for y-axis.
- Color-coding as per frontend chart config.

---

### 3. Recent Activity Table (`RecentActivityTable`)
**Displayed:** Table of recent activities (transactions, invoices, access changes).

**Data Needed:**
- `description` (string): Activity summary
- `type` ("Transaction" | "Invoice" | "Access Change")
- `user` (string): Who performed the action
- `date` (ISO string): Date/time of activity
- `amount` (number, optional): Amount involved
- `status` ("Paid" | "Pending" | "Active" | "Refunded" | "Revoked")

**API Endpoint Suggestion:**  
`GET /api/dashboard/recent-activity?limit=20`

**Expected Response:**
```json
[
  {
    "description": "Payment of ₹12,500 received from Arvind Pvt Ltd",
    "type": "Transaction",
    "user": "Executive - Simran",
    "date": "2025-07-18T10:45:00Z",
    "amount": 12500,
    "status": "Paid"
  },
  ...
]
```

**Backend Processing:**
- Sort by most recent.
- Optionally allow filtering/searching by type, user, status, date.

**Formatting:**
- Amounts as currency.
- Status with color-coding (as per frontend).

---

### 4. Top Products Chart (`TopProductsCard`)
**Displayed:** Doughnut chart of top products by sales or units, for a selected period.

**Data Needed:**
- `labels`: Product names (e.g., ["Product 1", "Product 2", ...])
- `datasets`: Array with:
  - `data`: Sales/units per product
  - `backgroundColor`: Array of colors for each product

**API Endpoint Suggestion:**  
`GET /api/dashboard/top-products?by=sales&period=30-days`

**Expected Response:**
```json
{
  "labels": ["Product 1", "Product 2", "Product 3", "Others"],
  "datasets": [
    {
      "data": [300, 250, 200, 100],
      "backgroundColor": ["#6366f1", "#34d399", "#60a5fa", "#f87171"]
    }
  ]
}
```

**Backend Processing:**
- Aggregate sales/units by product for the selected period.
- Sort and return top N products, group the rest as "Others".
- Allow filtering by sales/units and period.

---

### 5. Top Customers Chart (`TopCustomersCard`)
**Displayed:** Bar chart of top customers by total value.

**Data Needed:**
- `labels`: Customer names (e.g., ["Cust.1", "Cust.2", ...])
- `datasets`: Array with:
  - `data`: Total value per customer
  - `backgroundColor`: Array of colors for each bar

**API Endpoint Suggestion:**  
`GET /api/dashboard/top-customers?period=30-days`

**Expected Response:**
```json
{
  "labels": ["Customer 1", "Customer 2", ...],
  "datasets": [
    {
      "label": "Top Customers",
      "data": [90000, 80000, ...],
      "backgroundColor": ["#6366f1", "#22c55e", ...]
    }
  ]
}
```

**Backend Processing:**
- Aggregate total sales per customer for the selected period.
- Sort and return top N customers.
- Calculate percentage share for legend (can be done on frontend or backend).

**Formatting:**
- Currency formatting for values.
- Color-coding for each customer.

---

## General Notes

- **Sorting/Aggregation:** All aggregation (totals, top N, trends, etc.) should be done on the backend for performance and consistency.
- **Filtering:** Endpoints should support query params for period, type, etc.
- **Calculated Fields:** 
  - `change` and `trend` for stats
  - Percentages for top customers/products (for legend)
  - Totals and comparisons for charts

---

### Summary Table

| Component         | API Endpoint                        | Data Structure/Schema | Backend Processing                | Formatting/Calculated Fields         |
|-------------------|-------------------------------------|----------------------|-----------------------------------|--------------------------------------|
| Stat Cards        | `/api/dashboard/stats`              | Array of stat cards  | Aggregation, trend calculation    | Currency, percentage, trend arrow    |
| Sales Report      | `/api/dashboard/sales-report`       | Chart.js format      | Monthly aggregation               | Currency, color, period filter       |
| Recent Activity   | `/api/dashboard/recent-activity`    | Array of activities  | Sorting, filtering                | Currency, status color, date format  |
| Top Products      | `/api/dashboard/top-products`       | Chart.js format      | Top N, grouping, period filter    | Color, sales/units, legend           |
| Top Customers     | `/api/dashboard/top-customers`      | Chart.js format      | Top N, period filter              | Color, percentage, legend            |

---

If you need a more detailed schema for any specific endpoint or want to see example backend queries, let us know! 