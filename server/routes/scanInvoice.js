const express = require('express');
const router = express.Router();
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const auth = require('../middleware/auth');
const Invoice = require('../models/Invoice');
const ExpenseInvoice = require('../models/ExpenseInvoice');

// Configure multer for file upload
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 3 * 1024 * 1024 // 3MB limit
    }
});

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Income invoice prompt template
const incomeInvoicePrompt = `You are an expert invoice analyzer. Analyze this invoice image and extract all the information in a structured format. Look for:

1. Basic Invoice Details:
- Invoice Number
- Date of Issue
- Due Date
- Total Amount
- Currency

2. Client/Bill To Information:
- Company/Client Name
- Complete Address
- Email Address
- Phone Number
- GST Number (if available)
- PAN Number (if available)

3. Items/Services:
For each item/service, extract:
- Description
- HSN/SAC Code (if available)
- Quantity
- Unit Price
- GST Rate (if applicable)
- Discount (if any)
- Total Amount for the item

4. Tax Details:
- Subtotal
- CGST Amount and Rate
- SGST Amount and Rate
- IGST Amount and Rate
- Total Tax Amount

5. Additional Information:
- Terms and Conditions
- Payment Terms
- Notes or Special Instructions

Please provide the information in a clear, structured format. If any information is not available, mark it as "Not Found". For numerical values, extract the exact numbers without currency symbols. For dates, use YYYY-MM-DD format.`;

// Expense invoice prompt template
const expenseInvoicePrompt = `You are an expert invoice analyzer. Analyze this expense invoice image and extract all the information in a structured format. Look for:

1. Basic Invoice Details:
- Invoice Number
- Date of Issue
- Due Date
- Total Amount
- Currency

2. Vendor/Bill From Information:
- Company/Vendor Name
- Complete Address
- Email Address
- Phone Number
- GST Number (if available)
- PAN Number (if available)

3. Items/Services:
For each item/service, extract:
- Description
- HSN/SAC Code (if available)
- Quantity
- Unit Price
- GST Rate (if applicable)
- Discount (if any)
- Total Amount for the item

4. Tax Details:
- Subtotal
- CGST Amount and Rate
- SGST Amount and Rate
- IGST Amount and Rate
- Total Tax Amount

5. Additional Information:
- Terms and Conditions
- Payment Terms
- Notes or Special Instructions

Please provide the information in a clear, structured format. If any information is not available, mark it as "Not Found". For numerical values, extract the exact numbers without currency symbols. For dates, use YYYY-MM-DD format.`;

// Function to transform extracted data into database format
function transformToDatabaseFormat(extractedData, type) {
    const today = new Date();
    
    // Helper function to safely parse dates
    const safeDateParse = (dateStr, required = false) => {
        if (!dateStr || dateStr.toLowerCase() === 'not found') {
            return required ? today : null;
        }
        const parsedDate = new Date(dateStr);
        return isNaN(parsedDate.getTime()) ? (required ? today : null) : parsedDate;
    };

    const transform = {
        income: (data) => ({
            invoiceNumber: data.invoiceNumber || null,
            date: safeDateParse(data.date, true), // date is required
            dueDate: safeDateParse(data.dueDate, false), // dueDate is optional
            billTo: {
                name: data.clientName || null,
                email: data.clientEmail || null,
                address: data.clientAddress || null,
                gst: data.clientGST || null,
                pan: data.clientPAN || null,
                phone: data.clientPhone || null
            },
            items: (data.items || []).map(item => ({
                description: item.description || 'Unnamed Item',
                hsn: item.hsn || null,
                quantity: Math.max(1, parseFloat(item.quantity) || 1),
                unitPrice: parseFloat(item.unitPrice) || 0,
                gst: Math.min(100, Math.max(0, parseFloat(item.gst) || 0)),
                discount: parseFloat(item.discount) || 0,
                amount: parseFloat(item.amount) || 0
            })).filter(item => item.description && item.amount > 0),
            subtotal: parseFloat(data.subtotal) || 0,
            cgst: parseFloat(data.cgst) || 0,
            sgst: parseFloat(data.sgst) || 0,
            igst: parseFloat(data.igst) || 0,
            total: parseFloat(data.total) || 0,
            termsAndConditions: data.termsAndConditions || null
        }),
        expense: (data) => ({
            invoiceNumber: data.invoiceNumber || null,
            date: safeDateParse(data.date, true), // date is required
            dueDate: safeDateParse(data.dueDate, false), // dueDate is optional
            billFrom: {
                name: data.vendorName || null,
                email: data.vendorEmail || null,
                address: data.vendorAddress || null,
                gst: data.vendorGST || null,
                pan: data.vendorPAN || null,
                phone: data.vendorPhone || null
            },
            items: (data.items || []).map(item => ({
                description: item.description || 'Unnamed Item',
                hsn: item.hsn || null,
                quantity: Math.max(1, parseFloat(item.quantity) || 1),
                price: parseFloat(item.unitPrice) || 0,
                gst: Math.min(100, Math.max(0, parseFloat(item.gst) || 0)),
                discount: parseFloat(item.discount) || 0,
                total: parseFloat(item.amount) || 0
            })).filter(item => item.description && item.total > 0),
            subtotal: parseFloat(data.subtotal) || 0,
            cgst: parseFloat(data.cgst) || 0,
            sgst: parseFloat(data.sgst) || 0,
            igst: parseFloat(data.igst) || 0,
            total: parseFloat(data.total) || 0,
            termsAndConditions: data.termsAndConditions || null
        })
    };

    return transform[type](extractedData);
}

router.post('/scan-invoice', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const invoiceType = req.body.type;
        if (!['income', 'expense'].includes(invoiceType)) {
            return res.status(400).json({ message: 'Invalid invoice type' });
        }

        // Initialize Gemini Pro Vision model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Create image part from binary data
        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype
            }
        };

        // Select prompt based on invoice type
        const prompt = invoiceType === 'income' ? incomeInvoicePrompt : expenseInvoicePrompt;

        // Generate content with image and prompt
        const result = await model.generateContent({
            contents: [{
                parts: [
                    { text: prompt },
                    imagePart
                ]
            }]
        });
        const response = await result.response;
        const text = response.text();
        //console.log('Gemini Response:', text);
        // Instead of parsing manually, ask Gemini to convert to DB format
        const dbIncomePrompt = `Convert the following invoice information into a JSON object matching this schema (use null for missing fields, and ensure all types are correct):\n\n{
  invoiceNumber: String,
  date: Date (YYYY-MM-DD),
  dueDate: Date (YYYY-MM-DD or null),
  billTo: {
    name: String,
    email: String or null,
    address: String or null,
    gst: String or null,
    pan: String or null,
    phone: String or null
  },
  items: [
    {
      description: String,
      hsn: String or null,
      quantity: Number,
      unitPrice: Number,
      gst: Number,
      discount: Number,
      amount: Number
    }
  ],
  subtotal: Number,
  cgst: Number,
  sgst: Number,
  igst: Number,
  total: Number,
  termsAndConditions: String or null
}\n\nHere is the extracted invoice information:\n${text}`;

const dbExpensePrompt = `Convert the following expense invoice information into a JSON object matching this schema (use null for missing fields, and ensure all types are correct):\n\n{
    invoiceNumber: String,
    date: Date (YYYY-MM-DD),
    dueDate: Date (YYYY-MM-DD or null),
    billFrom: {
      name: String,
      email: String or null,
      address: String or null,
      gst: String or null,
      pan: String or null,
      phone: String or null
    },
    items: [
      {
        description: String,
        hsn: String or null,
        quantity: Number,
        price: Number,
        gst: Number,
        discount: Number,
        total: Number
      }
    ],
    subtotal: Number,
    cgst: Number,
    sgst: Number,
    igst: Number,
    total: Number,
    termsAndConditions: String or null
  }\n\nHere is the extracted expense invoice information:\n${text}`;
  
          const dbPrompt = invoiceType === 'income' ? dbIncomePrompt : dbExpensePrompt;
  

        // Second Gemini call to get DB-ready JSON
        const dbResult = await model.generateContent({
            contents: [{ parts: [{ text: dbPrompt }] }]
        });
        const dbResponse = await dbResult.response;
        const dbText = dbResponse.text();
        console.log('Gemini DB JSON:', dbText);
        let invoiceData;
        try {
            invoiceData = JSON.parse(dbText.replace(/```json|```/g, '').trim());
        } catch (e) {
            console.error('Error parsing Gemini JSON:', e);
            return res.status(500).json({ message: 'Failed to parse Gemini JSON', error: e.message });
        }

        // Add user ID and status
        const finalData = {
            ...invoiceData,
            user: req.user._id,
            status: 'draft'
        };
        console.log(finalData);
        // Save to appropriate database model
        let savedInvoice;
        if (invoiceType === 'income') {
            savedInvoice = await Invoice.create(finalData);
        } else {
            savedInvoice = await ExpenseInvoice.create({
                ...finalData,
                userId: req.user._id
            });
        }

        // Return success response with redirect URL
        res.json({
            success: true,
            message: 'Invoice scanned and saved successfully',
            invoiceId: savedInvoice._id,
            redirectUrl: '/dashboard.html'
        });

    } catch (error) {
        console.error('Error scanning invoice:', error);
        res.status(500).json({ 
            message: 'Error processing invoice image',
            error: error.message 
        });
    }
});

// Helper function to parse the extracted text into structured data
function parseExtractedText(text) {
    const data = {};
    
    // Helper to clean and check for placeholder
    const cleanField = (val) => {
        if (!val) return null;
        const cleaned = val.replace(/\*/g, '').trim();
        if (/^\/Bill To Information:?\*\*$/i.test(cleaned) || cleaned === '' || cleaned.toLowerCase() === 'not found') {
            return 'Please fill manually';
        }
        return cleaned;
    };

    // Extract basic details
    const invoiceNumberMatch = text.match(/Invoice Number:?\s*\*?\s*([^\n]+)/i);
    const dateMatch = text.match(/Date of Issue:?\s*\*?\s*(\d{4}-\d{2}-\d{2})/i);
    const dueDateMatch = text.match(/Due Date:?\s*\*?\s*([^\n]+)/i);
    const totalMatch = text.match(/Total Amount:?\s*\*?\s*[₹$]?\s*([\d,]+\.?\d*)/i);
    const currencyMatch = text.match(/Currency:?\s*\*?\s*([^\n]+)/i);

    data.invoiceNumber = invoiceNumberMatch ? cleanField(invoiceNumberMatch[1]) : null;
    data.date = dateMatch ? dateMatch[1] : null;
    data.dueDate = dueDateMatch ? (dueDateMatch[1].toLowerCase() === 'not found' ? null : dueDateMatch[1]) : null;
    data.total = totalMatch ? parseFloat(totalMatch[1].replace(/,/g, '')) : null;
    data.currency = currencyMatch ? cleanField(currencyMatch[1]) : null;

    // Extract client/vendor information
    const nameMatch = text.match(/(?:Company\/Client|Vendor) Name:?\s*\*?\s*([^\n]+)/i);
    const addressMatch = text.match(/(?:Complete|Client|Vendor) Address:?\s*\*?\s*([^\n]+)/i);
    const emailMatch = text.match(/(?:Email Address|Client|Vendor Email):?\s*\*?\s*([^\n]+)/i);
    const phoneMatch = text.match(/(?:Phone Number|Client|Vendor Phone):?\s*\*?\s*([^\n]+)/i);
    const gstMatch = text.match(/(?:GST Number|Client|Vendor GST):?\s*\*?\s*([^\n]+)/i);
    const panMatch = text.match(/(?:PAN Number|Client|Vendor PAN):?\s*\*?\s*([^\n]+)/i);

    if (nameMatch) data.clientName = cleanField(nameMatch[1]);
    if (addressMatch) data.clientAddress = cleanField(addressMatch[1]);
    if (emailMatch) data.clientEmail = cleanField(emailMatch[1]);
    if (phoneMatch) data.clientPhone = cleanField(phoneMatch[1]);
    if (gstMatch) data.clientGST = cleanField(gstMatch[1]);
    if (panMatch) data.clientPAN = cleanField(panMatch[1]);

    // Extract items
    const itemsSection = text.match(/\*\*3\. Items\/Services:\*\*([\s\S]*?)(?=\*\*4\. Tax Details:|$)/i);
    if (itemsSection) {
        const itemsText = itemsSection[1];
        const itemRows = itemsText.split('\n').filter(line => line.trim() && !line.includes('---'));
        data.items = itemRows.map(row => {
            const [description, hsn, quantity, unitPrice, gstRate, discount, amount] = row.split('|').map(cell => cell.trim());
            return {
                description: description && description !== '' ? description.replace(/\*/g, '').trim() : 'Fill Item',
                hsn: hsn?.replace(/\*/g, '').trim(),
                quantity: parseFloat(quantity) || 0,
                unitPrice: parseFloat(unitPrice?.replace(/[₹$,]/g, '')) || 0,
                gst: parseFloat(gstRate?.replace(/[%]/g, '')) || 0,
                discount: parseFloat(discount?.replace(/[₹$,]/g, '')) || 0,
                amount: parseFloat(amount?.replace(/[₹$,]/g, '')) || 0
            };
        });
    }

    // Extract tax details
    const subtotalMatch = text.match(/Subtotal:?\s*\*?\s*[₹$]?\s*([\d,]+\.?\d*)/i);
    const cgstMatch = text.match(/CGST Amount and Rate:?\s*\*?\s*([^\n]+)/i);
    const sgstMatch = text.match(/SGST Amount and Rate:?\s*\*?\s*([^\n]+)/i);
    const igstMatch = text.match(/IGST Amount and Rate:?\s*\*?\s*([\d,]+\.?\d*)\s*\((\d+)%\)/i);
    const totalTaxMatch = text.match(/Total Tax Amount:?\s*\*?\s*[₹$]?\s*([\d,]+\.?\d*)/i);

    data.subtotal = subtotalMatch ? parseFloat(subtotalMatch[1].replace(/,/g, '')) : null;
    data.cgst = cgstMatch ? (cgstMatch[1].toLowerCase() === 'not found' ? 0 : parseFloat(cgstMatch[1].match(/[\d,]+\.?\d*/)?.[0]?.replace(/,/g, '') || '0')) : 0;
    data.sgst = sgstMatch ? (sgstMatch[1].toLowerCase() === 'not found' ? 0 : parseFloat(sgstMatch[1].match(/[\d,]+\.?\d*/)?.[0]?.replace(/,/g, '') || '0')) : 0;
    data.igst = igstMatch ? parseFloat(igstMatch[1].replace(/,/g, '')) : 0;

    // Extract terms and conditions
    const termsMatch = text.match(/Terms and Conditions:?\s*\*?\s*([^\n]+)/i);
    data.termsAndConditions = termsMatch ? (termsMatch[1].toLowerCase() === 'not found' ? null : termsMatch[1].trim()) : null;

    return data;
}

module.exports = router; 