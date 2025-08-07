export interface SalesRecord {
    id: string;
    invoiceNumber: string;
    customerName: string;
    product: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    dateOfSale: string;
    paymentStatus: 'Paid' | 'Unpaid';
  }
  
  export const salesData: SalesRecord[] = [
    {
      id: '1',
      invoiceNumber: 'INV-2024/001',
      customerName: 'Customer Name',
      product: 'Product 1',
      quantity: 1000,
      unitPrice: 2000,
      totalAmount: 50000,
      dateOfSale: '29 July 2024',
      paymentStatus: 'Paid'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2024/001',
      customerName: 'Customer Name',
      product: 'Product 1',
      quantity: 12000,
      unitPrice: 2000,
      totalAmount: 50000,
      dateOfSale: '29 July 2024',
      paymentStatus: 'Paid'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2024/001',
      customerName: 'Customer Name',
      product: 'Product 1',
      quantity: 12000,
      unitPrice: 2000,
      totalAmount: 50000,
      dateOfSale: '29 July 2024',
      paymentStatus: 'Unpaid'
    },
    {
      id: '4',
      invoiceNumber: 'INV-2024/001',
      customerName: 'Customer Name',
      product: 'Product 1',
      quantity: 12000,
      unitPrice: 2000,
      totalAmount: 50000,
      dateOfSale: '29 July 2024',
      paymentStatus: 'Paid'
    },
    {
      id: '5',
      invoiceNumber: 'INV-2024/001',
      customerName: 'Customer Name',
      product: 'Product 1',
      quantity: 12000,
      unitPrice: 2000,
      totalAmount: 50000,
      dateOfSale: '29 July 2024',
      paymentStatus: 'Paid'
    },
    {
      id: '6',
      invoiceNumber: 'INV-2024/001',
      customerName: 'Customer Name',
      product: 'Product 1',
      quantity: 12000,
      unitPrice: 2000,
      totalAmount: 50000,
      dateOfSale: '29 July 2024',
      paymentStatus: 'Paid'
    },
    {
      id: '7',
      invoiceNumber: 'INV-2024/001',
      customerName: 'Customer Name',
      product: 'Product 1',
      quantity: 12000,
      unitPrice: 2000,
      totalAmount: 50000,
      dateOfSale: '29 July 2024',
      paymentStatus: 'Unpaid'
    },
    {
      id: '8',
      invoiceNumber: 'INV-2024/001',
      customerName: 'Customer Name',
      product: 'Product 1',
      quantity: 12000,
      unitPrice: 2000,
      totalAmount: 50000,
      dateOfSale: '29 July 2024',
      paymentStatus: 'Paid'
    },
    {
      id: '9',
      invoiceNumber: 'INV-2024/001',
      customerName: 'Customer Name',
      product: 'Product 1',
      quantity: 12000,
      unitPrice: 2000,
      totalAmount: 50000,
      dateOfSale: '29 July 2024',
      paymentStatus: 'Paid'
    }
  ];
  
  export const salesChartData = [
    { month: 'Jan', value: 400 },
    { month: 'Feb', value: 450 },
    { month: 'Mar', value: 720 },
    { month: 'Apr', value: 350 },
    { month: 'May', value: 650 },
    { month: 'Jun', value: 400 },
    { month: 'Jul', value: 550 },
    { month: 'Aug', value: 550 },
    { month: 'Sep', value: 550 },
    { month: 'Oct', value: 750 },
    { month: 'Nov', value: 800 },
    { month: 'Dec', value: 550 }
  ];
  
  export const regionalSalesData = [
    { region: 'New Delhi', value: 92, percentage: '92.5%' },
    { region: 'Mumbai', value: 85, percentage: '85.7%' },
    { region: 'Bangalore', value: 78, percentage: '79.9%' },
    { region: 'Hyderabad', value: 65, percentage: '65.6%' },
    { region: 'Chennai', value: 45, percentage: '45.5%' },
    { region: 'Kolkata', value: 35, percentage: '35.9%' },
    { region: 'Pune', value: 28, percentage: '28.1%' },
    { region: 'Ahmedabad', value: 20, percentage: '20.1%' },
    { region: 'Others', value: 15, percentage: '15.8%' }
  ];
  
  export const getSalesStats = () => ({
    totalSales: 23345,
    currentMonthSales: 23345,
    averageOrderValue: 23345,
    totalSalesChange: 3.46,
    currentMonthChange: -3.46,
    averageOrderChange: 3.46
  });