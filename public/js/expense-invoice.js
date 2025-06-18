const token = localStorage.getItem('token');

document.addEventListener('DOMContentLoaded', async () => {
    // Check authentication
    if (!token) {
        window.location.href = '/';
        return;
    }

    // Load user profile for bill to details
    try {
        const response = await fetch('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const userData = await response.json();
            document.getElementById('billToDetails').innerHTML = `
                <p><strong>${userData.name}</strong></p>
                <p>${userData.company}</p>
                <p>${userData.address}</p>
                <p>GST: ${userData.gstNumber || 'N/A'}</p>
                <p>PAN: ${userData.panNumber || 'N/A'}</p>
                <p>Phone: ${userData.phone}</p>
                <p>Email: ${userData.email}</p>
            `;
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
    }

    // Generate invoice number
    try {
        const response = await fetch('/api/expense-invoices/last', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const lastInvoice = await response.json();
            const lastNumber = lastInvoice ? parseInt(lastInvoice.invoiceNumber.replace(/[^0-9]/g, '')) : 0;
            const newInvoiceNumber = `EXP-${(lastNumber + 1).toString().padStart(6, '0')}`;
            document.getElementById('invoiceNumber').value = newInvoiceNumber;
        }
    } catch (error) {
        console.error('Error generating invoice number:', error);
    }

    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();

    // Add item button functionality
    document.getElementById('addItemBtn').addEventListener('click', addItem);

    // Form submission
    document.getElementById('expenseInvoiceForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const formData = getFormData();
            const urlParams = new URLSearchParams(window.location.search);
            const invoiceId = urlParams.get('id');
            
            const response = await fetch(invoiceId ? `/api/expense-invoices/${invoiceId}` : '/api/expense-invoices', {
                method: invoiceId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to save invoice');
            }

            const result = await response.json();
            alert('Invoice saved successfully!');
            window.location.href = '/dashboard.html';
        } catch (error) {
            console.error('Error saving invoice:', error);
            alert('Error saving invoice: ' + error.message);
        }
    });

    // Save and Send
    document.getElementById('saveAndSendBtn').addEventListener('click', () => saveInvoice('sent'));

    // Print preview
    document.getElementById('printPreviewBtn').addEventListener('click', openPrintPreview);

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('token');
        window.location.href = '/';
    });

    // Check for edit mode (id in URL)
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('id');
    if (invoiceId) {
        // Edit mode: fetch and populate invoice
        try {
            const response = await fetch(`/api/expense-invoices/${invoiceId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.ok) {
                const invoice = await response.json();
                // Populate form fields
                document.getElementById('invoiceNumber').value = invoice.invoiceNumber || '';
                document.getElementById('date').value = invoice.date ? invoice.date.substr(0, 10) : '';
                document.getElementById('dueDate').value = invoice.dueDate ? invoice.dueDate.substr(0, 10) : '';
                document.getElementById('currency').value = invoice.currency || 'INR';
                document.getElementById('status').value = invoice.status || 'draft';

                // Bill From
                document.getElementById('fromName').value = invoice.billFrom?.name || '';
                document.getElementById('fromAddress').value = invoice.billFrom?.address || '';
                document.getElementById('fromGST').value = invoice.billFrom?.gst || '';
                document.getElementById('fromPAN').value = invoice.billFrom?.pan || '';
                document.getElementById('fromPhone').value = invoice.billFrom?.phone || '';
                document.getElementById('fromEmail').value = invoice.billFrom?.email || '';

                // Items
                const itemsTableBody = document.getElementById('itemsTableBody');
                itemsTableBody.innerHTML = '';
                invoice.items.forEach(item => {
                    addItem();
                    const lastRow = itemsTableBody.lastElementChild;
                    lastRow.querySelector('.item-description').value = item.description || '';
                    lastRow.querySelector('.item-hsn').value = item.hsn || '';
                    lastRow.querySelector('.item-quantity').value = item.quantity || 0;
                    lastRow.querySelector('.item-price').value = item.price || 0;
                    lastRow.querySelector('.item-gst').value = item.gst || 0;
                    lastRow.querySelector('.item-discount').value = item.discount || 0;
                    lastRow.querySelector('.item-total').value = item.total || 0;
                });

                // Totals
                document.getElementById('subtotal').textContent = invoice.subtotal ? invoice.subtotal.toFixed(2) : '0.00';
                document.getElementById('cgst').textContent = invoice.cgst ? invoice.cgst.toFixed(2) : '0.00';
                document.getElementById('sgst').textContent = invoice.sgst ? invoice.sgst.toFixed(2) : '0.00';
                document.getElementById('total').textContent = invoice.total ? invoice.total.toFixed(2) : '0.00';

                // Terms
                document.getElementById('termsAndConditions').value = invoice.termsAndConditions || '';
            }
        } catch (error) {
            console.error('Error loading expense invoice for edit:', error);
        }
    }

    // Check if we have scanned data to load
    const params = new URLSearchParams(window.location.search);
    if (params.get('fromScan') === 'true') {
        const scannedData = JSON.parse(localStorage.getItem('scannedInvoiceData') || '{}');
        if (Object.keys(scannedData).length > 0) {
            populateScannedData(scannedData);
            localStorage.removeItem('scannedInvoiceData');
        }
    }
});

function addItem() {
    const template = document.getElementById('itemTemplate');
    const itemsTableBody = document.getElementById('itemsTableBody');
    // Get the <tr> element from the template
    const clone = template.content.firstElementChild.cloneNode(true);

    // Add event listeners for calculations
    const inputs = clone.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            calculateItemTotal(clone);
        });
    });

    // Add remove button functionality
    const removeBtn = clone.querySelector('.remove-item');
    removeBtn.addEventListener('click', () => {
        clone.remove();
        calculateTotals();
    });

    itemsTableBody.appendChild(clone);
}

function calculateItemTotal(row) {
    if (!row) return;
    
    const quantity = parseFloat(row.querySelector('.item-quantity')?.value) || 0;
    const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
    const discount = parseFloat(row.querySelector('.item-discount')?.value) || 0;
    const gst = parseFloat(row.querySelector('.item-gst')?.value) || 0;
    
    // Calculate base amount
    const baseAmount = quantity * price;
    
    // Calculate discount amount
    const discountAmount = (baseAmount * discount) / 100;
    const amountAfterDiscount = baseAmount - discountAmount;
    
    // Calculate GST amount
    const gstAmount = (amountAfterDiscount * gst) / 100;
    
    // Calculate final total
    const total = amountAfterDiscount + gstAmount;
    
    // Update the total field
    const totalInput = row.querySelector('.item-total');
    if (totalInput) {
        totalInput.value = total.toFixed(2);
    }
    
    // Recalculate all totals
    calculateTotals();
}

function calculateTotals() {
    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    // Get all item rows
    const rows = document.querySelectorAll('#itemsTableBody tr');
    if (!rows.length) return;

    // Calculate totals for each item
    rows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.item-quantity')?.value) || 0;
        const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
        const discount = parseFloat(row.querySelector('.item-discount')?.value) || 0;
        const gst = parseFloat(row.querySelector('.item-gst')?.value) || 0;

        // Calculate base amount
        const baseAmount = quantity * price;
        
        // Calculate discount amount
        const discountAmount = (baseAmount * discount) / 100;
        const amountAfterDiscount = baseAmount - discountAmount;
        
        // Add to subtotal (amount before GST)
        subtotal += amountAfterDiscount;

        // Calculate GST amount
        const gstAmount = (amountAfterDiscount * gst) / 100;
        
        // Split GST into CGST and SGST (50% each)
        const cgstAmount = gstAmount / 2;
        const sgstAmount = gstAmount / 2;
        
        totalCGST += cgstAmount;
        totalSGST += sgstAmount;
    });

    // Calculate final total
    const total = subtotal + totalCGST + totalSGST;

    // Format numbers
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    // Update all total fields
    document.getElementById('subtotal').textContent = formatter.format(subtotal);
    document.getElementById('cgst').textContent = formatter.format(totalCGST);
    document.getElementById('sgst').textContent = formatter.format(totalSGST);
    document.getElementById('total').textContent = formatter.format(total);
}

function getFormData() {
    const items = Array.from(document.querySelectorAll('#itemsTableBody tr')).map(row => ({
        description: row.querySelector('.item-description')?.value || '',
        hsn: row.querySelector('.item-hsn')?.value || '',
        quantity: parseFloat(row.querySelector('.item-quantity')?.value) || 0,
        price: parseFloat(row.querySelector('.item-price')?.value) || 0,
        gst: parseFloat(row.querySelector('.item-gst')?.value) || 0,
        discount: parseFloat(row.querySelector('.item-discount')?.value) || 0,
        total: parseFloat(row.querySelector('.item-total')?.value) || 0
    }));

    return {
        invoiceNumber: document.getElementById('invoiceNumber').value,
        date: document.getElementById('date').value,
        dueDate: document.getElementById('dueDate').value,
        currency: document.getElementById('currency').value,
        status: document.getElementById('status').value,
        billFrom: {
            name: document.getElementById('fromName').value,
            address: document.getElementById('fromAddress').value,
            gst: document.getElementById('fromGST').value,
            pan: document.getElementById('fromPAN').value,
            phone: document.getElementById('fromPhone').value,
            email: document.getElementById('fromEmail').value
        },
        items: items,
        subtotal: parseFloat(document.getElementById('subtotal').textContent.replace(/[^0-9.-]+/g, '')) || 0,
        cgst: parseFloat(document.getElementById('cgst').textContent.replace(/[^0-9.-]+/g, '')) || 0,
        sgst: parseFloat(document.getElementById('sgst').textContent.replace(/[^0-9.-]+/g, '')) || 0,
        total: parseFloat(document.getElementById('total').textContent.replace(/[^0-9.-]+/g, '')) || 0,
        termsAndConditions: document.getElementById('termsAndConditions').value
    };
}

async function saveInvoice(status) {
    try {
        const formData = getFormData();
        formData.status = 'sent'; // Always set status to 'sent'

        const urlParams = new URLSearchParams(window.location.search);
        const invoiceId = urlParams.get('id');

        const response = await fetch(invoiceId ? `/api/expense-invoices/${invoiceId}` : '/api/expense-invoices', {
            method: invoiceId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error('Failed to save invoice');
        }

        const result = await response.json();
        alert('Invoice saved successfully!');
        window.location.href = '/dashboard.html';
    } catch (error) {
        console.error('Error saving invoice:', error);
        alert('Error saving invoice: ' + error.message);
    }
}

function openPrintPreview() {
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('id');
    if (invoiceId) {
        window.open(`/print-preview.html?expenseId=${invoiceId}`, '_blank');
    } else {
        alert('Please save the invoice first before printing.');
    }
}

function populateScannedData(scannedData) {
    try {
        // Basic invoice details
        document.getElementById('invoiceNumber').value = scannedData.invoiceNumber || '';
        document.getElementById('date').value = scannedData.date || new Date().toISOString().split('T')[0];
        document.getElementById('dueDate').value = scannedData.dueDate || '';
        document.getElementById('currency').value = scannedData.currency || 'INR';
        document.getElementById('status').value = scannedData.status || 'draft';
        document.getElementById('termsAndConditions').value = scannedData.termsAndConditions || '';

        // Bill From details
        if (scannedData.billFrom) {
            document.getElementById('fromName').value = scannedData.billFrom.name || '';
            document.getElementById('fromEmail').value = scannedData.billFrom.email || '';
            document.getElementById('fromAddress').value = scannedData.billFrom.address || '';
            document.getElementById('fromGST').value = scannedData.billFrom.gst || '';
            document.getElementById('fromPAN').value = scannedData.billFrom.pan || '';
            document.getElementById('fromPhone').value = scannedData.billFrom.phone || '';
        }

        // Clear existing items
        document.getElementById('itemsTableBody').innerHTML = '';

        // Add items
        if (scannedData.items && scannedData.items.length > 0) {
            scannedData.items.forEach(item => {
                const itemRow = addItem();
                if (itemRow) {
                    itemRow.querySelector('.item-description').value = item.description || '';
                    itemRow.querySelector('.item-hsn').value = item.hsn || '';
                    itemRow.querySelector('.item-quantity').value = item.quantity || 1;
                    itemRow.querySelector('.item-price').value = item.price || 0;
                    itemRow.querySelector('.item-gst').value = item.gst || 0;
                    itemRow.querySelector('.item-discount').value = item.discount || 0;
                    calculateItemTotal(itemRow);
                }
            });
        } else {
            // Add a default empty item if no items were scanned
            addItem();
        }

        // Update totals
        document.getElementById('subtotal').textContent = formatCurrency(scannedData.subtotal || 0);
        document.getElementById('cgst').textContent = formatCurrency(scannedData.cgst || 0);
        document.getElementById('sgst').textContent = formatCurrency(scannedData.sgst || 0);
        document.getElementById('igst').textContent = formatCurrency(scannedData.igst || 0);
        document.getElementById('total').textContent = formatCurrency(scannedData.total || 0);

        // Recalculate totals to ensure everything is in sync
        calculateTotals();
    } catch (error) {
        console.error('Error populating scanned data:', error);
        alert('Error populating invoice data. Please check the console for details.');
    }
}

function formatCurrency(amount) {
    const currency = document.getElementById('currency').value;
    const formatter = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2
    });
    return formatter.format(amount);
} 