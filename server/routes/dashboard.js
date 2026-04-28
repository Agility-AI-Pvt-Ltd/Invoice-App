import express from 'express';
import Invoice from '../models/Invoice.js';
import ExpenseInvoice from '../models/ExpenseInvoice.js';
import auth from '../middleware/auth.js';
import { db } from '../config/firebase.js';

const router = express.Router();

// Dashboard Stats endpoint
router.get('/stats', auth, async (req, res) => {
  try {
    const { period = 'this-month' } = req.query;
    const userId = req.user.id || req.user._id;
    
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

    // Manual Firestore queries for range
    const invoiceSnap = await db.collection('invoices')
      .where('user', '==', userId)
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();
    
    const invoices = invoiceSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const expenseSnap = await db.collection('expense_invoices')
      .where('user', '==', userId)
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();
    
    const expenses = expenseSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.total || 0), 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending' || inv.status === 'draft');
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');

    const stats = [
      { id: 'total-revenue', title: 'Total Revenue', value: totalRevenue, change: 0, trend: 'up' },
      { id: 'total-expenses', title: 'Total Expenses', value: totalExpenses, change: 0, trend: 'down' },
      { id: 'paid-invoices', title: 'Paid Invoices', value: paidInvoices.length, change: 0, trend: 'up' },
      { id: 'pending-invoices', title: 'Pending Invoices', value: pendingInvoices.length, change: 0, trend: 'down' }
    ];

    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard stats' });
  }
});

// Recent Activity endpoint
router.get('/recent-activity', auth, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user.id || req.user._id;
    const safeLimit = Math.min(50, Math.max(1, parseInt(limit) || 10));

    // Fetch recent invoices and expenses
    const invoices = await Invoice.findWithSort({ user: userId }, 'createdAt', 'desc');
    const expenses = await ExpenseInvoice.findWithSort({ user: userId }, 'createdAt', 'desc');

    const activities = [
      ...invoices.slice(0, safeLimit).map(invoice => ({
        id: invoice.id,
        type: 'invoice',
        title: `Invoice #${invoice.invoiceNumber}`,
        description: `Invoice for ${invoice.billTo?.name || 'Unknown'}`,
        amount: invoice.total,
        date: invoice.createdAt,
        status: invoice.status
      })),
      ...expenses.slice(0, safeLimit).map(expense => ({
        id: expense.id,
        type: 'expense',
        title: `Expense #${expense.expenseNumber || 'EXP'}`,
        description: expense.description || 'Expense entry',
        amount: expense.total,
        date: expense.createdAt,
        status: expense.status
      }))
    ];

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, data: activities.slice(0, safeLimit) });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ success: false, message: 'Error fetching recent activity' });
  }
});

// Sales Report endpoint
router.get('/sales-report', auth, async (req, res) => {
    try {
      const userId = req.user.id || req.user._id;
      const invoices = await Invoice.find({ user: userId });
      
      const monthlyData = {};
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      months.forEach(month => { monthlyData[month] = 0; });
  
      invoices.forEach(invoice => {
        const date = invoice.createdAt?.toDate ? invoice.createdAt.toDate() : new Date(invoice.createdAt);
        const month = months[date.getMonth()];
        monthlyData[month] += invoice.total || 0;
      });
  
      res.json({
        success: true,
        data: {
          labels: months,
          datasets: [{
            label: 'Sales',
            data: Object.values(monthlyData),
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2,
            fill: true
          }]
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching sales report' });
    }
});

export default router;
