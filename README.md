# Advanced Invoice Management System by AgilityAI

A modern, feature-rich invoice management application built with Node.js, Express, and MongoDB. This application allows users to create, manage, and track invoices, with advanced features like invoice scanning using Gemini AI, client autocomplete, and multi-currency support.

## Features

- 👤 User Authentication & Authorization
- 📝 Invoice Creation and Management
- 📸 Invoice Scanning with AI
- 💰 Multiple Currency Support (USD, EUR, GBP, INR)
- 📊 Dashboard for Invoice Overview
- 🖨️ Print Preview and Direct Printing
- 📱 Responsive Design
- 👥 Client Auto-Complete
- 💾 Draft Saving
- 📧 Client Information Management
- 🔄 Status Tracking (Draft, Sent, Paid, Overdue)
- 🧮 Automatic Tax Calculation
- 📊 Item-wise Billing with Auto-Total

## Prerequisites

Before running this application, make sure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- NPM (v6 or higher)

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **Frontend**: HTML5, CSS3, JavaScript
- **AI Integration**: Google Gemini AI
- **Authentication**: JWT (JSON Web Tokens)
- **Image Processing**: Sharp
- **File Upload**: Multer

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
cd INVOICE-APP
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=mongodb://localhost:27017/invoice-app
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-super-secret-session-key
PORT=3000
GEMINI_API_KEY=your-gemini-api-key
```

4. Start the development server:
```bash
npm run dev
```

5. Start the production server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure

```
.
├── config/
│   └── db.js                # Database configuration
├── models/
│   ├── Invoice.js           # Invoice model with client tracking
│   └── User.js             # User model with profile data
├── public/
│   ├── css/
│   │   └── styles.css      # Global styles and print layouts
│   ├── js/
│   │   ├── auth.js         # Authentication and user management
│   │   ├── dashboard.js    # Dashboard with print functionality
│   │   ├── invoice.js      # Invoice creation with autosave
│   │   ├── print.js        # Enhanced print preview
│   │   └── scan.js         # AI-powered scanning logic
│   ├── dashboard.html      # Dashboard with quick actions
│   ├── index.html         # Login/Register with company info
│   ├── invoice.html       # Invoice form with autocomplete
│   ├── print-preview.html # Professional print layout
│   ├── scan.html         # Scan interface with preview
│   └── ico.jpg           # AgilityAI branding
├── routes/
│   ├── auth.js            # Authentication and profile routes
│   ├── invoices.js        # Invoice and client management
│   └── scan.js           # Gemini AI integration
├── package.json           # Project dependencies
├── server.js             # Express application setup
└── .env                  # Environment configuration
```

## Features in Detail

### User Management
- User registration with name, email, company details
- Secure authentication using JWT
- User profile management

### Invoice Management
- Create, edit, and delete invoices with an intuitive interface
- Support for multiple currencies (USD, EUR, GBP, INR)
- Dynamic tax rate calculation with real-time updates
- Item-wise billing with automatic total calculation
- Flexible status tracking (draft, sent, paid, overdue)
- Print preview with dedicated print layout
- One-click printing from dashboard
- Client autocomplete based on previous entries
- Automatic saving of client information
- Draft saving functionality

### AI-Powered Invoice Scanning
- Drag-and-drop or click-to-upload invoice images
- AI-powered text extraction using Google's Gemini AI
- Smart form auto-population from scanned data
- Real-time scanning progress indicator
- Preview of extracted information before creation

### Dashboard
- Comprehensive overview of all invoices
- Quick status updates and filtering
- One-click actions (Edit, Print, Delete)
- Search and filter capabilities
- Responsive table layout
- Direct print access from dashboard
- Status-based color coding

## Required Packages

```json
{
  "dependencies": {
    "@google/generative-ai": "^0.24.1",
    "bcryptjs": "^3.0.2",
    "body-parser": "^2.2.0",
    "dotenv": "^16.5.0",
    "express": "^5.1.0",
    "express-session": "^1.18.1",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.15.1",
    "multer": "^2.0.0",
    "sharp": "^0.34.2"
  },
  "devDependencies": {
    "nodemon": "^3.1.10"
  }
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Invoices
- `GET /api/invoices` - Get all invoices
- `POST /api/invoices` - Create new invoice
- `GET /api/invoices/:id` - Get single invoice
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice
- `GET /api/invoices/clients` - Get distinct client names for autocomplete
- `GET /api/invoices/clients/:name` - Get client details by name

### Scanning
- `POST /api/scan/scan` - Scan and extract invoice data using Gemini AI

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Session management
- Secure HTTP-only cookies
- Input validation and sanitization
- Protected API endpoints

## Deployment to Google Cloud Platform

1. Install Google Cloud SDK
2. Initialize and set up your GCP project:
```bash
gcloud init
gcloud projects create [PROJECT-ID]
gcloud config set project [PROJECT-ID]
```

3. Update app.yaml with your environment variables
4. Deploy the application:
```bash
gcloud app deploy
```

5. View your application:
```bash
gcloud app browse
```

For detailed deployment instructions, see the deployment guide in the documentation.

