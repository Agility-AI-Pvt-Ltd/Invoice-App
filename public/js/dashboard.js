// Load invoices when the page loads
document.addEventListener('DOMContentLoaded', loadInvoices);

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.replace('/');
});

async function loadInvoices() {
    try {
        const token = localStorage.getItem('token');
        const [normalRes, expenseRes] = await Promise.all([
            fetch('/api/invoices', {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
            fetch('/api/expense-invoices', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
        ]);

        if (!normalRes.ok || !expenseRes.ok) {
            throw new Error('Failed to fetch invoices');
        }

        const [invoices, expenseInvoices] = await Promise.all([
            normalRes.json(),
            expenseRes.json()
        ]);

        const invoicesList = document.getElementById('invoicesList');
        invoicesList.innerHTML = '';

        // Render normal invoices
        invoices.forEach(invoice => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${invoice.invoiceNumber}</td>
                <td>${invoice.billTo?.name || 'N/A'}</td>
                <td>${new Date(invoice.date).toLocaleDateString()}</td>
                <td>${invoice.currency} ${invoice.total}</td>
                <td>
                    <span class="badge bg-${getStatusColor(invoice.status)}">
                        ${invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                </td>
                <td>
                    <div class="btn-group">
                        <a href="/invoice.html?id=${invoice._id}" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-edit"></i> 
                        </a>
                        <button onclick="duplicateInvoice('${invoice._id}')" class="btn btn-sm btn-outline-info">
                            <i class="fas fa-copy"></i> 
                        </button>
                        <button onclick="printInvoice('${invoice._id}')" class="btn btn-sm btn-outline-secondary">
                            <i class="fas fa-print"></i> 
                        </button>
                        <button onclick="deleteInvoice('${invoice._id}')" class="btn btn-sm btn-outline-danger">
                            <i class="fas fa-trash"></i> 
                        </button>
                    </div>
                </td>
            `;
            invoicesList.appendChild(row);
        });

        // Render expense invoices (with a label)
        expenseInvoices.forEach(invoice => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${invoice.invoiceNumber} <span class="badge bg-warning text-dark ms-1">Expense</span></td>
                <td>${invoice.billFrom?.name || 'N/A'}</td>
                <td>${new Date(invoice.date).toLocaleDateString()}</td>
                <td>${invoice.currency} ${invoice.total}</td>
                <td>
                    <span class="badge bg-${getStatusColor(invoice.status)}">
                        ${invoice.status ? invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1) : 'Draft'}
                    </span>
                </td>
                <td>
                    <div class="btn-group">
                        <a href="/expense-invoice.html?id=${invoice._id}" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-edit"></i> 
                        </a>
                        <button onclick="duplicateExpenseInvoice('${invoice._id}')" class="btn btn-sm btn-outline-info">
                            <i class="fas fa-copy"></i> 
                        </button>
                        <button onclick="printExpenseInvoice('${invoice._id}')" class="btn btn-sm btn-outline-secondary">
                            <i class="fas fa-print"></i> 
                        </button>
                        <button onclick="deleteExpenseInvoice('${invoice._id}')" class="btn btn-sm btn-outline-danger">
                            <i class="fas fa-trash"></i> 
                        </button>
                    </div>
                </td>
            `;
            invoicesList.appendChild(row);
        });

    } catch (error) {
        console.error('Error loading invoices:', error);
        alert('Error loading invoices: ' + error.message);
    }
}

function getStatusColor(status) {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'success';
        case 'sent':
            return 'primary';
        case 'overdue':
            return 'danger';
        default:
            return 'secondary';
    }
}

async function duplicateInvoice(invoiceId) {
    try {
        const response = await fetch(`/api/invoices/${invoiceId}/duplicate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to duplicate invoice');
        }

        const newInvoice = await response.json();
        alert('Invoice duplicated successfully!');
        window.location.href = `/invoice.html?id=${newInvoice._id}`;
    } catch (error) {
        console.error('Error duplicating invoice:', error);
        alert('Error duplicating invoice: ' + error.message);
    }
}

async function printInvoice(invoiceId) {
    window.open(`/print-preview.html?id=${invoiceId}`, '_blank');
}

async function deleteInvoice(invoiceId) {
    if (!confirm('Are you sure you want to delete this invoice?')) {
        return;
    }

    try {
        const response = await fetch(`/api/invoices/${invoiceId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete invoice');
        }

        alert('Invoice deleted successfully!');
        loadInvoices(); // Reload the invoice list
    } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('Error deleting invoice: ' + error.message);
    }
}

// Add these functions for expense invoice actions:
async function duplicateExpenseInvoice(invoiceId) {
    try {
        const response = await fetch(`/api/expense-invoices/${invoiceId}/duplicate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to duplicate expense invoice');
        }

        const newInvoice = await response.json();
        alert('Expense invoice duplicated successfully!');
        window.location.href = `/expense-invoice.html?id=${newInvoice._id}`;
    } catch (error) {
        console.error('Error duplicating expense invoice:', error);
        alert('Error duplicating expense invoice: ' + error.message);
    }
}

function printExpenseInvoice(invoiceId) {
    window.open(`/print-preview.html?expenseId=${invoiceId}`, '_blank');
}

async function deleteExpenseInvoice(invoiceId) {
    if (!confirm('Are you sure you want to delete this expense invoice?')) {
        return;
    }

    try {
        const response = await fetch(`/api/expense-invoices/${invoiceId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete expense invoice');
        }

        alert('Expense invoice deleted successfully!');
        loadInvoices(); // Reload the invoice list
    } catch (error) {
        console.error('Error deleting expense invoice:', error);
        alert('Error deleting expense invoice: ' + error.message);
    }
}
