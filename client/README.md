# Invoice Management App - Frontend Client

A modern React + TypeScript + Vite frontend for the Invoice Management System with microservices backend.

## 🚀 Quick Start

### Environment Setup

1. **Run the environment setup script:**
   ```bash
   ./setup-env.sh
   ```

2. **Or manually create environment file:**
   - Copy `.env.example` to `.env` for your environment setup

### Development

```bash
# Install dependencies
npm install

# Start development server (uses .env)
npm run dev

# Build for production (uses .env)
npm run build

# Preview production build
npm run preview
```

## 🌐 Backend Configuration

The app automatically switches between local and production backends:

- **Local Development**: `http://localhost:3000` (API Gateway)
- **Production**: `https://api-gateway-914987176295.asia-south1.run.app`

### Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_BACKEND_URL` | Backend API URL (defaults to localhost:3000) |
| `VITE_API_BASE_URL` | API Base URL (same as backend URL) |
| `VITE_NODE_ENV` | Environment mode (development/production) |

**Note**: The app automatically uses the production URL when `NODE_ENV=production`, otherwise it uses localhost.

## 🏗️ Architecture

This frontend connects to a microservices backend with the following services:
- **API Gateway** (Port 3000) - Main entry point
- **Auth Service** (Port 3001) - Authentication & authorization
- **Business Service** (Port 3002) - Core business logic
- **AI Service** (Port 3003) - AI-powered invoice scanning

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
