# VISION Frontend

React frontend for the VISION IT Career Guidance Platform. Built with Vite, React 19, Tailwind CSS, and modern development tools.

## Quick Start

```bash
# Install dependencies (use --legacy-peer-deps for React 19 compatibility)
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Project Structure

```
src/
├── components/           # Reusable UI components
├── features/            # Feature modules with isolated state
├── pages/               # Page-level routes
├── hooks/               # Custom React hooks
├── services/            # API client and services
├── context/             # React context providers
├── utils/               # Utility functions
├── validation/          # Input validation schemas
├── assets/              # Static assets
└── styles/              # Global styles
```

## Key Technologies

- **React 19** - UI library with latest features
- **Vite 7** - Next-gen build tool with HMR
- **Tailwind CSS 4** - Utility-first CSS framework
- **React Query 5** - Server state management
- **React Hook Form 7** - Efficient form handling
- **Zod 4** - TypeScript-first schema validation
- **React Router 7** - Client-side routing
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful SVG icons

## Build Info

- **Build Time**: ~8-13 seconds
- **Bundle Size**: ~860 kB gzipped (production)
- **Dev Server**: Fast HMR with Vite
- **Production Build**: Fully minified and optimized

## Development

```bash
npm run dev      # Start dev server on http://localhost:5173
npm run build    # Build optimized production bundle
npm run preview  # Preview production build locally
npm run lint     # Check code quality
```

## Environment

Create `.env` file:

```
VITE_API_BASE_URL=https://your-api-url/api
```

## Status

✅ Production Ready - Clean, optimized, and fully functional
