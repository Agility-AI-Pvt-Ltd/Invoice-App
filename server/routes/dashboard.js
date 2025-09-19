import express from 'express';
import Invoice from '../models/Invoice.js';
import ExpenseInvoice from '../models/ExpenseInvoice.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Dashboard Stats endpoint
router.get('/stats', auth, async (req, res) => {
  try {
    const { period = 'this-month' } = req.query;
    const userId = req.user._id;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'this-month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last-month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'this-year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case 'last-year':
        startDate = new Date(now.getFullYear() - 1, 0, 1);
        endDate = new Date(now.getFullYear() - 1, 11, 31);
        break;
      case '30-days':
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        endDate = now;
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    // Get invoices for the period
    const invoices = await Invoice.find({
      userId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Get expenses for the period
    const expenses = await ExpenseInvoice.find({
      userId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Calculate stats
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.total || 0), 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');

    const stats = [
      {
        id: 'total-revenue',
        title: 'Total Revenue',
        value: totalRevenue,
        change: 12.5, // You can calculate this based on previous period
        trend: 'up'
      },
      {
        id: 'total-expenses',
        title: 'Total Expenses',
        value: totalExpenses,
        change: -8.2,
        trend: 'down'
      },
      {
        id: 'paid-invoices',
        title: 'Paid Invoices',
        value: paidInvoices.length,
        change: 15.3,
        trend: 'up'
      },
      {
        id: 'pending-invoices',
        title: 'Pending Invoices',
        value: pendingInvoices.length,
        change: -5.7,
        trend: 'down'
      }
    ];

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
});

// Sales Report endpoint
router.get('/sales-report', auth, async (req, res) => {
  try {
    const { period = 'this-year' } = req.query;
    const userId = req.user._id;

    // Get sales data for chart
    const invoices = await Invoice.find({ userId });
    
    // Group by months for the chart
    const monthlyData = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    months.forEach(month => {
      monthlyData[month] = 0;
    });

    invoices.forEach(invoice => {
      const month = months[new Date(invoice.createdAt).getMonth()];
      monthlyData[month] += invoice.total || 0;
    });

    const salesReport = {
      labels: months,
      datasets: [{
        label: 'Sales',
        data: Object.values(monthlyData),
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        fill: true
      }]
    };

    res.json({
      success: true,
      data: salesReport
    });
  } catch (error) {
    console.error('Sales report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales report',
      error: error.message
    });
  }
});

// Recent Activity endpoint
router.get('/recent-activity', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user._id;

    // Get recent invoices and expenses
    const recentInvoices = await Invoice.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 2);

    const recentExpenses = await ExpenseInvoice.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 2);

    // Combine and format activities
    const activities = [
      ...recentInvoices.map(invoice => ({
        id: invoice._id,
        type: 'invoice',
        title: `Invoice #${invoice.invoiceNumber}`,
        description: `Invoice for ${invoice.clientName}`,
        amount: invoice.total,
        date: invoice.createdAt,
        status: invoice.status
      })),
      ...recentExpenses.map(expense => ({
        id: expense._id,
        type: 'expense',
        title: `Expense #${expense.expenseNumber}`,
        description: expense.description || 'Expense entry',
        amount: expense.total,
        date: expense.createdAt,
        status: expense.status
      }))
    ];

    // Sort by date and limit
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    const limitedActivities = activities.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: limitedActivities
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activity',
      error: error.message
    });
  }
});

// Top Products endpoint
router.get('/top-products', auth, async (req, res) => {
  try {
    const { sortBy = 'sales', period = '30-days' } = req.query;
    const userId = req.user._id;

    // Get invoices and extract product data
    const invoices = await Invoice.find({ userId });
    const productStats = {};

    invoices.forEach(invoice => {
      if (invoice.items && Array.isArray(invoice.items)) {
        invoice.items.forEach(item => {
          const productName = item.name || item.description || 'Unknown Product';
          if (!productStats[productName]) {
            productStats[productName] = {
              name: productName,
              totalSales: 0,
              quantity: 0,
              revenue: 0
            };
          }
          productStats[productName].totalSales += 1;
          productStats[productName].quantity += item.quantity || 0;
          productStats[productName].revenue += (item.quantity || 0) * (item.price || 0);
        });
      }
    });

    // Convert to array and sort
    let topProducts = Object.values(productStats);
    
    if (sortBy === 'sales') {
      topProducts.sort((a, b) => b.totalSales - a.totalSales);
    } else if (sortBy === 'revenue') {
      topProducts.sort((a, b) => b.revenue - a.revenue);
    }

    // Limit to top 10
    topProducts = topProducts.slice(0, 10);

    res.json({
      success: true,
      data: topProducts
    });
  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top products',
      error: error.message
    });
  }
});

// Top Customers endpoint
router.get('/top-customers', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get invoices and group by customer
    const invoices = await Invoice.find({ userId });
    const customerStats = {};

    invoices.forEach(invoice => {
      const customerName = invoice.clientName || 'Unknown Customer';
      if (!customerStats[customerName]) {
        customerStats[customerName] = {
          name: customerName,
          email: invoice.clientEmail || '',
          totalInvoices: 0,
          totalRevenue: 0,
          lastInvoiceDate: invoice.createdAt
        };
      }
      customerStats[customerName].totalInvoices += 1;
      customerStats[customerName].totalRevenue += invoice.total || 0;
      
      // Update last invoice date if this one is more recent
      if (new Date(invoice.createdAt) > new Date(customerStats[customerName].lastInvoiceDate)) {
        customerStats[customerName].lastInvoiceDate = invoice.createdAt;
      }
    });

    // Convert to array and sort by revenue
    let topCustomers = Object.values(customerStats);
    topCustomers.sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    // Limit to top 10
    topCustomers = topCustomers.slice(0, 10);

    res.json({
      success: true,
      data: topCustomers
    });
  } catch (error) {
    console.error('Top customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top customers',
      error: error.message
    });
  }
});

// Revenue Chart endpoint
router.get('/revenue-chart', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Get invoices for the current year
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    const invoices = await Invoice.find({
      userId,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Group by months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = new Array(12).fill(0);

    invoices.forEach(invoice => {
      const month = new Date(invoice.createdAt).getMonth();
      monthlyRevenue[month] += invoice.total || 0;
    });

    const chartData = {
      labels: months,
      datasets: [{
        label: 'Revenue',
        data: monthlyRevenue,
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        fill: true
      }]
    };

    res.json({
      success: true,
      data: chartData
    });
  } catch (error) {
    console.error('Revenue chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue chart',
      error: error.message
    });
  }
});

// Cash Flow endpoint
router.get('/cash-flow', auth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get invoices and expenses
    const invoices = await Invoice.find({ userId });
    const expenses = await ExpenseInvoice.find({ userId });

    const totalIncome = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.total || 0), 0);
    const netCashFlow = totalIncome - totalExpenses;

    const cashFlowData = {
      totalIncome,
      totalExpenses,
      netCashFlow,
      cashFlowTrend: netCashFlow > 0 ? 'positive' : 'negative'
    };

    res.json({
      success: true,
      data: cashFlowData
    });
  } catch (error) {
    console.error('Cash flow error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching cash flow',
      error: error.message
    });
  }
});

export default router;

