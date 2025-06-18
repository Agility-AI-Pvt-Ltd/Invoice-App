// Check if user is authenticated
const token = localStorage.getItem('token');
if (!token) {
    window.location.href = '/login.html';
}

// Get invoice ID from URL
const urlParams = new URLSearchParams(window.location.search);
const invoiceId = urlParams.get('id');
const expenseId = urlParams.get('expenseId');

if (!invoiceId && !expenseId) {
    window.location.href = '/dashboard.html';
}

// Fetch user profile
async function fetchUserProfile() {
    try {
        const response = await fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user profile');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

// Fetch invoice data
async function fetchInvoice() {
    try {
        const endpoint = expenseId ? `/api/expense-invoices/${expenseId}` : `/api/invoices/${invoiceId}`;
        const response = await fetch(endpoint, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch invoice');
        }

        const data = await response.json();
        
        // Validate required fields
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid invoice data');
        }

        // Ensure required fields exist
        const requiredFields = ['invoiceNumber', 'date', 'items', 'subtotal', 'total'];
        for (const field of requiredFields) {
            if (!data[field]) {
                console.error(`Missing required field: ${field}`);
                data[field] = field === 'items' ? [] : '';
            }
        }

        return data;
    } catch (error) {
        alert('Error loading invoice. Please try again.');
        window.location.href = '/dashboard.html';
    }
}

// Format date
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount || 0);
}

// Render invoice
async function renderInvoice() {
    try {
        const [invoice, userProfile] = await Promise.all([
            fetchInvoice(),
            fetchUserProfile()
        ]);
        
        // Set company details from user profile
        if (expenseId) {
            // For expense invoices, show bill from name instead of company name
            const billFrom = invoice.billFrom || {};
            document.querySelector('.company-name').textContent = billFrom.name || 'N/A';
        } else {
            // For regular invoices, show company name
            document.querySelector('.company-name').textContent = userProfile?.company || 'Company Name';
        }
        
        if (expenseId) {
            // For expense invoices, show bill from details from the invoice
            const billFrom = invoice.billFrom || {};
            document.querySelector('.from-details').innerHTML = `
                <p>${billFrom.address || 'N/A'}</p>
                <p>GSTIN: ${billFrom.gst || 'N/A'}</p>
                <p>PAN: ${billFrom.pan || 'N/A'}</p>
                <p>Phone: ${billFrom.phone || 'N/A'}</p>
                <p>Email: ${billFrom.email || 'N/A'}</p>
            `;
        } else {
            // For regular invoices, show user's company details
            document.querySelector('.from-details').innerHTML = `
                <p>${userProfile?.address || 'N/A'}</p>
                <p>GSTIN: ${userProfile?.gstNumber || 'N/A'}</p>
                <p>Phone: ${userProfile?.phone || 'N/A'}</p>
                <p>Email: ${userProfile?.email || 'N/A'}</p>
            `;
        }

        // Set invoice details
        document.querySelector('.invoice-number').innerHTML = `
            <p><strong>Invoice #:</strong> ${invoice.invoiceNumber || 'N/A'}</p>
            <p><strong>Date:</strong> ${formatDate(invoice.date)}</p>
            <p><strong>Due Date:</strong> ${formatDate(invoice.dueDate)}</p>
        `;

        // Set bill to details
        if (expenseId) {
            // For expense invoices, use the user's details as bill to
            document.querySelector('.bill-to-details').innerHTML = `
                <p><strong>${userProfile?.name || 'N/A'}</strong></p>
                <p>${userProfile?.company || 'N/A'}</p>
                <p>${userProfile?.address || 'N/A'}</p>
                <p>GSTIN: ${userProfile?.gstNumber || 'N/A'}</p>
                <p>PAN: ${userProfile?.panNumber || 'N/A'}</p>
                <p>Phone: ${userProfile?.phone || 'N/A'}</p>
                <p>Email: ${userProfile?.email || 'N/A'}</p>
            `;
        } else {
            // For regular invoices, use the bill to details from the invoice
            const billTo = invoice.billTo || {};
            document.querySelector('.bill-to-details').innerHTML = `
                <p><strong>${billTo.name || 'N/A'}</strong></p>
                <p>${billTo.address || 'N/A'}</p>
                <p>GSTIN: ${billTo.gst || 'N/A'}</p>
                <p>Phone: ${billTo.phone || 'N/A'}</p>
                <p>Email: ${billTo.email || 'N/A'}</p>
            `;
        }

        // Render items
        const itemsTableBody = document.getElementById('itemsTableBody');
        itemsTableBody.innerHTML = '';

        if (!Array.isArray(invoice.items) || invoice.items.length === 0) {
            itemsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">No items found</td>
                </tr>
            `;
        } else {
            invoice.items.forEach(item => {
                const row = document.createElement('tr');
                const quantity = parseFloat(item.quantity) || 0;
                const price = parseFloat(item.price || item.unitPrice) || 0;
                const discount = parseFloat(item.discount) || 0;
                const gst = parseFloat(item.gst) || 0;
                const amount = parseFloat(item.total || item.amount) || (quantity * price * (1 - discount/100) * (1 + gst/100));

                row.innerHTML = `
                    <td>${item.description || 'N/A'}</td>
                    <td>${item.hsn || 'N/A'}</td>
                    <td class="text-end">${quantity}</td>
                    <td class="text-end">${formatCurrency(price)}</td>
                    <td class="text-end">${gst}%</td>
                    <td class="text-end">${discount}%</td>
                    <td class="text-end">${formatCurrency(amount)}</td>
                `;
                itemsTableBody.appendChild(row);
            });
        }

        // Render totals
        document.querySelector('.totals').innerHTML = `
            <table class="table table-borderless">
                <tr>
                    <td>Subtotal:</td>
                    <td class="text-end">${formatCurrency(invoice.subtotal)}</td>
                </tr>
            </table>
        `;

        // Render GST breakdown
        const taxBreakdown = document.querySelector('.tax-breakdown');
        const cgst = parseFloat(invoice.cgst) || 0;
        const sgst = parseFloat(invoice.sgst) || 0;
        const igst = parseFloat(invoice.igst) || 0;
        const totalTax = cgst + sgst + igst;

        if (totalTax > 0) {
            taxBreakdown.innerHTML = `
                ${igst > 0 ? `
                    <div class="tax-row">
                        <span class="tax-label">IGST:</span>
                        <span>${formatCurrency(igst)}</span>
                    </div>
                ` : `
                    <div class="tax-row">
                        <span class="tax-label">CGST:</span>
                        <span>${formatCurrency(cgst)}</span>
                    </div>
                    <div class="tax-row">
                        <span class="tax-label">SGST:</span>
                        <span>${formatCurrency(sgst)}</span>
                    </div>
                `}
                <div class="tax-row fw-bold mt-2">
                    <span>Grand Total:</span>
                    <span>${formatCurrency(invoice.total)}</span>
                </div>
            `;
        } else {
            taxBreakdown.innerHTML = `
                <div class="tax-row fw-bold">
                    <span>Grand Total:</span>
                    <span>${formatCurrency(invoice.total)}</span>
                </div>
            `;
        }

        // Render terms and conditions
        if (invoice.termsAndConditions) {
            document.getElementById('termsAndConditions').innerHTML = invoice.termsAndConditions;
        }

        // Set business logo if available
        if (expenseId) {
            // For expense invoices, show the bill from company's logo if available
            if (invoice.billFrom?.logo) {
                document.querySelector('.business-logo').innerHTML = `
                    <img src="${invoice.billFrom.logo}" alt="Business Logo">
                `;
            }
        } else {
            // For regular invoices, show the user's company logo
            if (userProfile?.businessLogo) {
                document.querySelector('.business-logo').innerHTML = `
                    <img src="${userProfile.businessLogo}" alt="Business Logo">
                `;
            }
        }
    } catch (error) {
        console.error('Error rendering invoice:', error);
        alert('Error rendering invoice. Please try again.');
        window.location.href = '/dashboard.html';
    }
}

// Initialize
renderInvoice();