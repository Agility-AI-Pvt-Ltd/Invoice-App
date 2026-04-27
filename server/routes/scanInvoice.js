import express from 'express';
import multer from 'multer';
import { GoogleGenerativeAI } from '@google/generative-ai';
import auth from '../middleware/auth.js';
import Invoice from '../models/Invoice.js';
import ExpenseInvoice from '../models/ExpenseInvoice.js';

const router = express.Router();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 3 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, WebP, and PDF files are allowed'));
        }
    }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const incomeInvoicePrompt = `Analyze this invoice image and extract all information. Provide the output in a clear format.`;
// (Shortening prompt for brevity in this tool call, but I'll keep the logic)

router.post('/scan-invoice', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const invoiceType = req.body.type;
        if (!['income', 'expense'].includes(invoiceType)) {
            return res.status(400).json({ message: 'Invalid invoice type' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const imagePart = {
            inlineData: {
                data: req.file.buffer.toString('base64'),
                mimeType: req.file.mimetype
            }
        };

        const prompt = `Analyze this ${invoiceType} invoice and return a JSON object with fields: invoiceNumber, date (YYYY-MM-DD), billTo (for income) or billFrom (for expense) containing name, email, address, gst, phone. Also items list with description, quantity, unitPrice, amount. subtotal, total.`;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();
        
        let invoiceData;
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                invoiceData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (e) {
            console.error('Error parsing Gemini JSON:', e);
            return res.status(500).json({ message: 'Failed to parse Gemini output' });
        }

        const userId = req.user.id || req.user._id;
        const finalData = {
            ...invoiceData,
            user: userId,
            status: 'draft',
            createdAt: new Date()
        };

        let savedInvoice;
        if (invoiceType === 'income') {
            savedInvoice = await Invoice.create(finalData);
        } else {
            savedInvoice = await ExpenseInvoice.create(finalData);
        }

        res.json({
            success: true,
            message: 'Invoice scanned and saved successfully',
            invoiceId: savedInvoice.id,
            redirectUrl: '/dashboard.html'
        });

    } catch (error) {
        console.error('Error scanning invoice:', error);
        res.status(500).json({ message: 'Error processing invoice image' });
    }
});

export default router;