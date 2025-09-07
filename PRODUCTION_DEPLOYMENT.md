# 🚀 Production Deployment Guide

## 🔒 **Authentication & Security**

### **Cookie Security Settings**

The application now automatically handles cookie security based on environment:

#### **Development (HTTP)**
```typescript
{
  secure: false,        // HTTP allowed
  sameSite: 'Lax',     // More permissive
  httpOnly: false,     // Client-side access needed
  path: '/',           // Site-wide access
  expires: 1           // 1 day
}
```

#### **Production (HTTPS)**
```typescript
{
  secure: true,        // HTTPS required
  sameSite: 'Strict', // Maximum security
  httpOnly: false,    // Client-side access needed
  path: '/',          // Site-wide access
  expires: 1          // 1 day
}
```

### **Environment Variables**

#### **Frontend (.env.production)**
```bash
# Production Backend URL (HTTPS required)
VITE_BACKEND_URL=https://your-api-domain.com

# Environment
VITE_NODE_ENV=production

# Feature Flags
VITE_ENABLE_AI_SCANNING=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_EXPORT=true

# Analytics (Production IDs)
VITE_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
VITE_GOOGLE_TAG_MANAGER_ID=GTM_ID

# Error Tracking (Production DSN)
VITE_SENTRY_DSN=https://your-sentry-dsn
```

#### **Backend (.env.production)**
```bash
# Environment
NODE_ENV=production

# Service URLs (HTTPS)
API_GATEWAY_URL=https://your-api-domain.com
AUTH_SERVICE_URL=https://your-api-domain.com:3001
BUSINESS_SERVICE_URL=https://your-api-domain.com:3002
AI_SERVICE_URL=https://your-api-domain.com:3003

# Database (Production)
DATABASE_URL=postgresql://user:password@prod-db-host:5432/invoice_db

# Redis (Production)
REDIS_URL=redis://prod-redis-host:6379

# JWT Secret (Strong, unique)
JWT_SECRET=your-super-secure-jwt-secret-key

# CORS Origins (Production domains)
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com
```

## 🌐 **Deployment Architecture**

### **Recommended Setup**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Microservices │
│   (Vercel/Netlify) │    │   (Load Balancer) │    │   (Docker/K8s)  │
│   HTTPS         │───▶│   HTTPS         │───▶│   Internal      │
│   your-app.com  │    │   api.your-app.com│    │   Network       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **SSL/TLS Requirements**

1. **Frontend**: Must be served over HTTPS
2. **API Gateway**: Must be served over HTTPS
3. **Internal Services**: Can use HTTP (internal network)
4. **Database**: Use SSL connections

## 🔧 **Build & Deploy Commands**

### **Frontend Build**
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod --dir=dist
```

### **Backend Deployment**
```bash
# Build Docker images
docker build -t invoice-api-gateway ./src/services/api-gateway
docker build -t invoice-auth-service ./src/services/auth-service
docker build -t invoice-business-service ./src/services/business-service
docker build -t invoice-ai-service ./src/services/ai-service

# Deploy with Docker Compose
docker-compose -f docker-compose.prod.yml up -d
```

## 🛡️ **Security Checklist**

### **Frontend Security**
- [ ] HTTPS enabled
- [ ] Secure cookies in production
- [ ] No sensitive data in client-side code
- [ ] Content Security Policy (CSP) headers
- [ ] XSS protection enabled

### **Backend Security**
- [ ] HTTPS with valid SSL certificate
- [ ] Strong JWT secret (32+ characters)
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] Environment variables secured

### **Infrastructure Security**
- [ ] Database access restricted
- [ ] Redis access restricted
- [ ] Firewall rules configured
- [ ] Regular security updates
- [ ] Monitoring and logging enabled

## 📊 **Monitoring & Logging**

### **Error Tracking**
```typescript
// Sentry integration (already configured)
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_NODE_ENV,
});
```

### **Analytics**
```typescript
// Google Analytics (already configured)
// GTM integration (already configured)
```

## 🔄 **CI/CD Pipeline**

### **GitHub Actions Example**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build frontend
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

## 🚨 **Common Production Issues**

### **Cookie Issues**
- **Problem**: Cookies not working in production
- **Solution**: Ensure HTTPS and correct domain settings

### **CORS Issues**
- **Problem**: API calls blocked by CORS
- **Solution**: Configure `ALLOWED_ORIGINS` with production domains

### **JWT Issues**
- **Problem**: Tokens not validating
- **Solution**: Ensure same JWT secret across all services

### **Database Connection**
- **Problem**: Database connection failures
- **Solution**: Use connection pooling and SSL

## 📝 **Environment-Specific Notes**

### **Development**
- HTTP allowed for local development
- Debug logging enabled
- Relaxed CORS settings
- Local database and Redis

### **Staging**
- HTTPS required
- Limited debug logging
- Production-like database
- Staging-specific domains

### **Production**
- HTTPS mandatory
- No debug logging
- Production database
- Full security measures
- Monitoring enabled

## 🔐 **Security Best Practices**

1. **Never commit secrets** to version control
2. **Use environment variables** for all sensitive data
3. **Rotate JWT secrets** regularly
4. **Implement rate limiting** on all endpoints
5. **Use HTTPS everywhere** in production
6. **Regular security audits** and updates
7. **Monitor for suspicious activity**
8. **Backup data regularly**
9. **Use strong passwords** for all services
10. **Keep dependencies updated**

