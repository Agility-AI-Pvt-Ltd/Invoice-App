document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    // Get invoice ID from URL if editing
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('id');
    const isEditing = !!invoiceId;
    const fromScan = urlParams.get('fromScan') === 'true';

    // Load client list for autocomplete
    loadClientList();

    // Handle client name selection
    document.getElementById('clientName').addEventListener('change', handleClientSelection);

    // Set default date values
    document.getElementById('date').valueAsDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    document.getElementById('dueDate').valueAsDate = dueDate;    // Load user profile
    loadUserProfile();

    // Load invoice if editing or from scan
    if (invoiceId) {
        loadInvoice(invoiceId);
    } else if (fromScan) {
        loadScannedInvoice();
        generateInvoiceNumber();
    } else {
        generateInvoiceNumber();
    }

    // Check if we have scanned data to load
    if (fromScan) {
        const scannedData = JSON.parse(localStorage.getItem('scannedInvoiceData') || '{}');
        if (Object.keys(scannedData).length > 0) {
            populateScannedData(scannedData);
            localStorage.removeItem('scannedInvoiceData');
        }
    }

    // Event Listeners
    document.getElementById('addItemBtn').addEventListener('click', addNewItem);
    document.getElementById('saveAsDraftBtn').addEventListener('click', async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found. Please login again.');
            }

            const formData = getFormData();
            formData.status = 'draft';

            const url = isEditing ? `/api/invoices/${invoiceId}` : '/api/invoices';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(result.error || 'Failed to save invoice');
            }

            alert('Invoice saved as draft!');
            window.location.href = '/dashboard.html';
        } catch (error) {
            console.error('Error saving invoice:', error);
            alert('Error saving invoice: ' + error.message);
        }
    });
    document.getElementById('printPreviewBtn').addEventListener('click', openPrintPreview);
    document.getElementById('invoiceForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found. Please login again.');
            }

            const formData = getFormData();
            formData.status = 'sent';
            console.log('Sending invoice data:', formData);

            const url = isEditing ? `/api/invoices/${invoiceId}` : '/api/invoices';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();
            
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/';
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(result.error || 'Failed to save invoice');
            }

            alert('Invoice saved successfully!');
            window.location.href = '/dashboard.html';
        } catch (error) {
            console.error('Error saving invoice:', error);
            alert('Error saving invoice: ' + error.message);
        }
    });
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    });

    // Setup event delegation for dynamic items
    document.getElementById('itemsTableBody').addEventListener('click', (e) => {
        if (e.target.closest('.remove-item')) {
            e.target.closest('tr').remove();
            calculateTotals();
        }
    });

    // Add event listeners for item inputs
    document.getElementById('itemsTableBody').addEventListener('input', (e) => {
        if (e.target.matches('.item-quantity, .item-price, .item-discount, .item-gst')) {
            calculateItemTotal(e.target.closest('tr'));
        }
    });

    // Handle Bill To/Ship To toggle
    document.querySelectorAll('input[name="billType"]').forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('billToSection').style.display = this.value === 'billTo' ? 'block' : 'none';
            document.getElementById('shipToSection').style.display = this.value === 'shipTo' ? 'block' : 'none';
        });
    });

    // Update the item template
    const itemTemplate = document.getElementById('itemTemplate');
    if (itemTemplate) {
        itemTemplate.innerHTML = `
            <tr>
                <td><input type="text" class="form-control form-control-sm item-description" placeholder="Item Description" required></td>
                <td><input type="text" class="form-control form-control-sm item-hsn" placeholder="HSN Code"></td>
                <td><input type="number" class="form-control form-control-sm item-quantity" placeholder="Qty" min="1" required></td>
                <td><input type="number" class="form-control form-control-sm item-price" placeholder="Price" min="0" step="0.01" required></td>
                <td><input type="number" class="form-control form-control-sm item-gst" placeholder="GST %" min="0" max="100" step="0.01" value="0"></td>
                <td><input type="number" class="form-control form-control-sm item-discount" placeholder="Discount %" min="0" max="100" step="0.01" value="0"></td>
                <td><input type="text" class="form-control form-control-sm item-total" readonly></td>
                <td>
                    <button type="button" class="btn btn-outline-danger btn-sm remove-item">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    // Initialize modals
    const inventoryModal = new bootstrap.Modal(document.getElementById('inventoryModal'));
    const quantityModal = new bootstrap.Modal(document.getElementById('quantityModal'));

    // Add from Inventory button click handler
    document.getElementById('addFromInventoryBtn').addEventListener('click', async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = '/login.html';
                return;
            }

            const response = await fetch('/api/inventory', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch inventory');
            }

            const inventory = await response.json();
            const tbody = document.getElementById('inventoryTableBody');
            tbody.innerHTML = '';

            inventory.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${item.description}</td>
                    <td>₹${item.price.toFixed(2)}</td>
                    <td>${item.gst}%</td>
                    <td>
                        <button class="btn btn-sm btn-primary select-item" 
                                data-id="${item._id}"
                                data-description="${item.description}"
                                data-price="${item.price}"
                                data-gst="${item.gst}"
                                data-hsn="${item.hsnCode || ''}"
                                data-max-qty="${item.quantity}" type="button">
                            Select
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            // Add event listeners to select buttons
            document.querySelectorAll('.select-item').forEach(button => {
                button.addEventListener('click', () => {
                    const data = button.dataset;
                    
                    // Add item to invoice with quantity 0
                    const item = {
                        description: data.description,
                        hsnCode: data.hsn,
                        quantity: 0,
                        price: parseFloat(data.price),
                        gstRate: parseFloat(data.gst),
                        discount: 0
                    };

                    // Create new row from template
                    const template = document.getElementById('itemTemplate');
                    const itemRow = template.content.cloneNode(true);
                    const row = itemRow.querySelector('tr');
                    
                    // Set values
                    row.querySelector('.item-description').value = item.description;
                    row.querySelector('.item-hsn').value = item.hsnCode;
                    row.querySelector('.item-quantity').value = item.quantity;
                    row.querySelector('.item-price').value = item.price;
                    row.querySelector('.item-gst').value = item.gstRate;
                    row.querySelector('.item-discount').value = item.discount;
                    
                    // Add to table and calculate total
                    document.getElementById('itemsTableBody').appendChild(itemRow);
                    calculateItemTotal(row);
                    inventoryModal.hide();
                });
            });

            inventoryModal.show();
        } catch (error) {
            console.error('Error loading inventory:', error);
            alert('Error loading inventory. Please try again.');
        }
    });

    // Handle inventory search
    document.getElementById('inventorySearch').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('#inventoryTableBody tr');
        
        rows.forEach(row => {
            const description = row.cells[0].textContent.toLowerCase();
            row.style.display = description.includes(searchTerm) ? '' : 'none';
        });
    });

    // Handle quantity confirmation
    document.getElementById('confirmQuantityBtn').addEventListener('click', () => {
        const quantityModalElement = document.getElementById('quantityModal');
        const selectedItem = JSON.parse(quantityModalElement.dataset.selectedItem);
        const quantity = parseInt(document.getElementById('itemQuantity').value);
        
        if (quantity > selectedItem.quantity) {
            alert('Quantity cannot exceed available inventory');
            return;
        }

        // Add item to invoice
        const item = {
            description: selectedItem.description,
            hsnCode: selectedItem.hsnCode,
            quantity: quantity,
            price: selectedItem.price,
            gstRate: selectedItem.gstRate,
            discount: 0
        };

        addItemToTable(item);
        quantityModal.hide();
        inventoryModal.hide();
    });
});

async function loadUserProfile() {
    try {
        const response = await fetch('/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const user = await response.json();            document.getElementById('fromDetails').innerHTML = `
                <p class="mb-1"><strong>${user.company}</strong></p>
                <p class="mb-1">${user.name}</p>
                <p class="mb-1">${user.address}</p>
                <p class="mb-1">Email: ${user.email}</p>
                <p class="mb-1">Phone: ${user.phone}</p>
                ${user.website ? `<p class="mb-1">Website: ${user.website}</p>` : ''}
                <p class="mb-1">PAN: ${user.panNumber}</p>
                ${user.isGstRegistered ? `<p class="mb-1">GST: ${user.gstNumber}</p>` : ''}
                ${user.businessLogo ? `<img src="${user.businessLogo}" alt="Business Logo" style="max-width: 200px; margin-top: 10px;">` : ''}
            `;
        }
    } catch (error) {
        alert('Error loading user profile: ' + error.message);
    }
}

async function loadInvoice(id) {
    try {
        const response = await fetch(`/api/invoices/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const invoice = await response.json();
            populateInvoiceForm(invoice);
        }
    } catch (error) {
        alert('Error loading invoice: ' + error.message);
    }
}

function populateInvoiceForm(invoice) {
    document.getElementById('invoiceNumber').value = invoice.invoiceNumber;
    document.getElementById('date').value = invoice.date.split('T')[0];
    document.getElementById('dueDate').value = invoice.dueDate?.split('T')[0] || '';    
    document.getElementById('currency').value = invoice.currency;
    document.getElementById('status').value = invoice.status;
    document.getElementById('termsAndConditions').value = invoice.termsAndConditions || '';
    
    // Populate bill to details
    document.getElementById('clientName').value = invoice.billTo?.name || '';
    document.getElementById('clientEmail').value = invoice.billTo?.email || '';
    document.getElementById('clientAddress').value = invoice.billTo?.address || '';
    document.getElementById('clientGST').value = invoice.billTo?.gst || '';
    document.getElementById('clientPAN').value = invoice.billTo?.pan || '';
    document.getElementById('clientPhone').value = invoice.billTo?.phone || '';

    // Populate ship to details if they exist
    if (invoice.shipTo && Object.keys(invoice.shipTo).some(key => invoice.shipTo[key])) {
        document.getElementById('shipToName').value = invoice.shipTo.name || '';
        document.getElementById('shipToAddress').value = invoice.shipTo.address || '';
        document.getElementById('shipToGST').value = invoice.shipTo.gst || '';
        document.getElementById('shipToPAN').value = invoice.shipTo.pan || '';
        document.getElementById('shipToPhone').value = invoice.shipTo.phone || '';
        document.getElementById('shipToEmail').value = invoice.shipTo.email || '';
    }

    // Clear existing items
    document.getElementById('itemsTableBody').innerHTML = '';
    
    // Add invoice items
    invoice.items.forEach(item => {
        const itemRow = addNewItem();
        itemRow.querySelector('.item-description').value = item.description;
        itemRow.querySelector('.item-hsn').value = item.hsn || '';
        itemRow.querySelector('.item-quantity').value = item.quantity;
        itemRow.querySelector('.item-price').value = item.unitPrice;
        itemRow.querySelector('.item-discount').value = item.discount || 0;
        itemRow.querySelector('.item-gst').value = item.gst || 0;
        calculateItemTotal(itemRow);
    });

    calculateTotals();
}

function addNewItem() {
    const template = document.getElementById('itemTemplate');
    const itemRow = template.content.cloneNode(true);
    document.getElementById('itemsTableBody').appendChild(itemRow);
    return document.getElementById('itemsTableBody').lastElementChild;
}

function calculateItemTotal(row) {
    if (!row) return;
    
    const quantity = parseFloat(row.querySelector('.item-quantity')?.value) || 0;
    const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
    const discount = parseFloat(row.querySelector('.item-discount')?.value) || 0;
    const gst = parseFloat(row.querySelector('.item-gst')?.value) || 0;
    
    const subtotal = quantity * price;
    const discountAmount = (subtotal * discount) / 100;
    const amountAfterDiscount = subtotal - discountAmount;
    const gstAmount = (amountAfterDiscount * gst) / 100;
    const total = amountAfterDiscount + gstAmount;
    
    const totalInput = row.querySelector('.item-total');
    if (totalInput) {
        totalInput.value = total.toFixed(2);
    }
    calculateTotals();
}

function calculateTotals() {
    let subtotal = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;

    const rows = document.querySelectorAll('#itemsTableBody tr');
    if (!rows.length) return;

    rows.forEach(row => {
        const quantity = parseFloat(row.querySelector('.item-quantity')?.value) || 0;
        const price = parseFloat(row.querySelector('.item-price')?.value) || 0;
        const discount = parseFloat(row.querySelector('.item-discount')?.value) || 0;
        const gst = parseFloat(row.querySelector('.item-gst')?.value) || 0;

        const itemSubtotal = quantity * price;
        const discountAmount = (itemSubtotal * discount) / 100;
        const amountAfterDiscount = itemSubtotal - discountAmount;
        const gstAmount = (amountAfterDiscount * gst) / 100;

        subtotal += amountAfterDiscount;

        // Determine if it's same state (you'll need to implement this logic)
        const isSameState = true; // This should be determined based on your business logic
        if (isSameState) {
            totalCGST += gstAmount / 2;
            totalSGST += gstAmount / 2;
        } else {
            totalIGST += gstAmount;
        }
    });

    const total = subtotal + totalCGST + totalSGST + totalIGST;

    const currency = document.getElementById('currency')?.value || 'INR';
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    });

    const elements = {
        subtotal: document.getElementById('subtotal'),
        cgst: document.getElementById('cgst'),
        sgst: document.getElementById('sgst'),
        igst: document.getElementById('igst'),
        total: document.getElementById('total')
    };

    if (elements.subtotal) elements.subtotal.textContent = formatter.format(subtotal);
    if (elements.cgst) elements.cgst.textContent = formatter.format(totalCGST);
    if (elements.sgst) elements.sgst.textContent = formatter.format(totalSGST);
    if (elements.igst) elements.igst.textContent = formatter.format(totalIGST);
    if (elements.total) elements.total.textContent = formatter.format(total);
}

async function generateInvoiceNumber() {
    try {
        const response = await fetch('/api/invoices', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const invoices = await response.json();
            const lastInvoice = invoices[0]; // Assuming sorted by latest
            const num = lastInvoice ? parseInt(lastInvoice.invoiceNumber.split('-')[1]) + 1 : 1;
            document.getElementById('invoiceNumber').value = `INV-${String(num).padStart(3, '0')}`;
        }
    } catch (error) {
        document.getElementById('invoiceNumber').value = 'INV-001';
    }
}

// Update showAlert to handle multiline messages and ensure visibility
function showAlert(message, type) {
    // Create alert container if it doesn't exist
    let alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alertContainer';
        alertContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            max-width: 500px;
        `;
        document.body.appendChild(alertContainer);
    }

    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.style.cssText = `
        margin-bottom: 10px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    
    // Convert newlines to <br> tags for HTML display
    const formattedMessage = message.replace(/\n/g, '<br>');
    
    alertDiv.innerHTML = `
        ${formattedMessage}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Add to container
    alertContainer.appendChild(alertDiv);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => alertDiv.remove(), 150);
    }, 5000);
}

function openPrintPreview() {
    const urlParams = new URLSearchParams(window.location.search);
    const invoiceId = urlParams.get('id');
    if (invoiceId) {
        window.open(`/print-preview.html?id=${invoiceId}`, '_blank');
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

        // Bill To details
        if (scannedData.billTo) {
            document.getElementById('clientName').value = scannedData.billTo.name || '';
            document.getElementById('clientEmail').value = scannedData.billTo.email || '';
            document.getElementById('clientAddress').value = scannedData.billTo.address || '';
            document.getElementById('clientGST').value = scannedData.billTo.gst || '';
            document.getElementById('clientPAN').value = scannedData.billTo.pan || '';
            document.getElementById('clientPhone').value = scannedData.billTo.phone || '';
        }

        // Clear existing items
        document.getElementById('itemsTableBody').innerHTML = '';

        // Add items
        if (scannedData.items && scannedData.items.length > 0) {
            scannedData.items.forEach(item => {
                const itemRow = addNewItem();
                const row = itemRow.querySelector('tr');
                if (row) {
                    row.querySelector('.item-description').value = item.description || '';
                    row.querySelector('.item-hsn').value = item.hsn || '';
                    row.querySelector('.item-quantity').value = item.quantity || 1;
                    row.querySelector('.item-price').value = item.unitPrice || 0;
                    row.querySelector('.item-gst').value = item.gst || 0;
                    row.querySelector('.item-discount').value = item.discount || 0;
                    calculateItemTotal(row);
                }
            });
        } else {
            // Add a default empty item if no items were scanned
            addNewItem();
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

function loadScannedInvoice() {
    const scannedData = JSON.parse(localStorage.getItem('scannedInvoiceData') || '{}');
    if (Object.keys(scannedData).length === 0) {
        return;
    }

    // Fill in the form with scanned data
    if (scannedData.invoiceNumber) {
        document.getElementById('invoiceNumber').value = scannedData.invoiceNumber;
    }
    if (scannedData.date) {
        document.getElementById('date').value = scannedData.date;
    }
    if (scannedData.billTo) {
        document.getElementById('clientName').value = scannedData.billTo.name || '';
        document.getElementById('clientEmail').value = scannedData.billTo.email || '';
        document.getElementById('clientAddress').value = scannedData.billTo.address || '';
    }

    // Add line items if they exist
    if (Array.isArray(scannedData.items)) {
        scannedData.items.forEach(item => {
            const itemRow = addNewItem();
            itemRow.querySelector('.item-description').value = item.description || '';
            itemRow.querySelector('.item-quantity').value = item.quantity || '';
            itemRow.querySelector('.item-price').value = item.unitPrice || '';
            itemRow.querySelector('.item-discount').value = item.discount || 0;
            itemRow.querySelector('.item-gst').value = item.gst || 0;
            calculateItemTotal(itemRow);
        });
    }

    // Set default status to draft
    document.getElementById('status').value = 'draft';
    
    // Calculate totals
    calculateTotals();

    // Clear the scanned data from localStorage
    localStorage.removeItem('scannedInvoiceData');
}

async function loadClientList() {
    try {
        const response = await fetch('/api/invoices/clients', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const clients = await response.json();
            const clientList = document.getElementById('clientList');
            clientList.innerHTML = clients.map(client => 
                `<option value="${client}">`
            ).join('');
        }
    } catch (error) {
        // Silently fail - client list is not critical
    }
}

async function handleClientSelection(event) {
    const clientName = event.target.value;
    if (!clientName) return;

    try {
        const response = await fetch(`/api/invoices/clients/${encodeURIComponent(clientName)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (response.ok) {
            const clientDetails = await response.json();
            // Populate client details
            document.getElementById('clientEmail').value = clientDetails.email || '';
            document.getElementById('clientAddress').value = clientDetails.address || '';
        }
    } catch (error) {
        // Silently fail - client details are not critical
    }
}

function getFormData() {
    // Validate required fields
    const requiredFields = {
        'invoiceNumber': 'Invoice Number',
        'date': 'Date',
        'clientName': 'Client Name',
        'clientAddress': 'Client Address'
    };

    for (const [id, label] of Object.entries(requiredFields)) {
        const value = document.getElementById(id).value.trim();
        if (!value) {
            throw new Error(`${label} is required`);
        }
    }

    // Validate items
    const items = Array.from(document.getElementById('itemsTableBody').children).map(row => {
        const description = row.querySelector('.item-description').value.trim();
        const quantity = parseFloat(row.querySelector('.item-quantity').value);
        const unitPrice = parseFloat(row.querySelector('.item-price').value);
        const amount = parseFloat(row.querySelector('.item-total').value);

        if (!description) {
            throw new Error('Item description is required');
        }
        if (isNaN(quantity) || quantity <= 0) {
            throw new Error('Item quantity must be greater than 0');
        }
        if (isNaN(unitPrice) || unitPrice < 0) {
            throw new Error('Item price must be greater than or equal to 0');
        }
        if (isNaN(amount)) {
            throw new Error('Invalid item total amount');
        }

        return {
            description,
            hsn: row.querySelector('.item-hsn').value.trim(),
            quantity,
            unitPrice,
            gst: parseFloat(row.querySelector('.item-gst').value) || 0,
            discount: parseFloat(row.querySelector('.item-discount').value) || 0,
            amount
        };
    });

    if (items.length === 0) {
        throw new Error('At least one item is required');
    }

    // Format dates
    const date = new Date(document.getElementById('date').value);
    const dueDate = document.getElementById('dueDate').value ? new Date(document.getElementById('dueDate').value) : null;

    // Get numeric values from currency strings
    const getNumericValue = (elementId) => {
        const value = document.getElementById(elementId).textContent;
        return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
    };

    return {
        invoiceNumber: document.getElementById('invoiceNumber').value.trim(),
        date: date.toISOString(),
        dueDate: dueDate ? dueDate.toISOString() : null,
        currency: document.getElementById('currency').value,
        status: document.getElementById('status').value,
        billTo: {
            name: document.getElementById('clientName').value.trim(),
            email: document.getElementById('clientEmail').value.trim(),
            address: document.getElementById('clientAddress').value.trim(),
            gst: document.getElementById('clientGST').value.trim(),
            pan: document.getElementById('clientPAN').value.trim(),
            phone: document.getElementById('clientPhone').value.trim()
        },
        shipTo: {
            name: document.getElementById('shipToName').value.trim(),
            address: document.getElementById('shipToAddress').value.trim(),
            gst: document.getElementById('shipToGST').value.trim(),
            pan: document.getElementById('shipToPAN').value.trim(),
            phone: document.getElementById('shipToPhone').value.trim(),
            email: document.getElementById('shipToEmail').value.trim()
        },
        items,
        termsAndConditions: document.getElementById('termsAndConditions').value.trim(),
        subtotal: getNumericValue('subtotal'),
        cgst: getNumericValue('cgst'),
        sgst: getNumericValue('sgst'),
        igst: getNumericValue('igst'),
        total: getNumericValue('total')
    };
}

