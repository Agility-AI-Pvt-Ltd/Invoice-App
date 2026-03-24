#!/bin/bash

# 🚀 Environment Setup Script for Invoice App Client
# This script creates a single .env file for both local and production

echo "🚀 Setting up Invoice App Client Environment..."

# Create single .env file
cat > .env << 'EOF'
# 🚀 Invoice App Client - Environment Configuration
# This single file works for both local development and production

# Backend URLs - Automatically switches based on NODE_ENV
# Local Development: http://localhost:3000
# Production: https://api-gateway-914987176295.asia-south1.run.app
VITE_BACKEND_URL=http://localhost:3000
VITE_API_BASE_URL=http://localhost:3000

# Environment Mode (development/production)
VITE_NODE_ENV=development

# Feature Flags
VITE_ENABLE_AI_SCANNING=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_EXPORT=true

# Analytics (Optional - Add your IDs when ready)
VITE_GOOGLE_ANALYTICS_ID=your-ga-id
VITE_GOOGLE_TAG_MANAGER_ID=your-gtm-id

# Error Tracking (Optional - Add your DSN when ready)
VITE_SENTRY_DSN=your-sentry-dsn
EOF

echo "✅ Environment file created successfully!"
echo ""
echo "📁 File created:"
echo "  • .env (works for both local and production)"
echo ""
echo "🔧 Usage:"
echo "  • Local development: npm run dev"
echo "  • Production build: npm run build"
echo ""
echo "🌐 Backend URLs:"
echo "  • Local: http://localhost:3000"
echo "  • Production: https://api-gateway-914987176295.asia-south1.run.app"
echo ""
echo "💡 The app automatically switches between URLs based on NODE_ENV!"
echo "   • Development mode: Uses localhost:3000"
echo "   • Production mode: Uses Cloud Run URL"
