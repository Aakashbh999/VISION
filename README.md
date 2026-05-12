# VISION - IT Career Guidance Platform

An IT Career Guidance Platform for Nepalese Students. A comprehensive full-stack application built with React, Node.js, and PostgreSQL.

## Project Overview

VISION is a career guidance and learning platform designed specifically for Nepalese IT students. The platform provides:

- **Academic Roadmaps**: Structured learning paths with resources and milestones
- **Career Insights**: Job market analysis and career development guidance
- **Discussion Forums**: Community-driven learning and peer support
- **Study Groups**: Collaborative learning with peer communities
- **Gamification**: Streak tracking, badges, and reputation system
- **Admin Dashboard**: Comprehensive management and moderation tools
- **Resource Management**: Curated IT resources with approval workflows

## Project Structure

```
VISION/
├── frontend/my-react-app/     # React frontend (Vite)
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── features/          # Feature modules (discussions, groups, profile, etc.)
│   │   ├── pages/             # Page-level components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── services/          # API client services
│   │   ├── context/           # React context providers
│   │   └── utils/             # Utility functions
│   └── package.json
│
├── server/                    # Node.js/Express backend
│   ├── controllers/           # Route handlers (~30 controllers)
│   ├── services/              # Business logic (~8 services)
│   ├── routes/                # API routes (~26 route files)
│   ├── middleware/            # Express middleware
│   ├── config/                # Configuration files
│   ├── db/                    # Database migrations and seeds
│   ├── validation/            # Input validation schemas
│   ├── utils/                 # Utility functions
│   └── package.json
│
└── README.md                  # This file
```

## Tech Stack

### Frontend

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v7
- **UI Components**: Lucide React, custom components
- **Animations**: Framer Motion

### Backend

- **Runtime**: Node.js (>=18)
- **Framework**: Express.js v5
- **Database**: PostgreSQL
- **Authentication**: JWT with refresh token rotation
- **File Storage**: Cloudinary
- **Email**: Nodemailer with Handlebars templates
- **Validation**: Zod
- **Security**: Helmet, CORS, XSS protection, bcrypt

## Setup Instructions

### Prerequisites

- Node.js >= 18
- PostgreSQL database
- Cloudinary account (for image uploads)
- SMTP email service (Gmail or similar)

### Frontend Setup

```bash
cd frontend/my-react-app

# Install dependencies (use --legacy-peer-deps for React 19)
npm install --legacy-peer-deps

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

**Environment Variables**: Create `.env` file in `frontend/my-react-app/`:

```
VITE_API_BASE_URL=https://your-api-url/api
```

### Backend Setup

```bash
cd server

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your actual values

# Database migrations (if needed)
npm run migrate

# Seed database (optional - for development/testing)
npm run seed

# Start development server
npm start

# Run tests
npm test
```

**Environment Variables**: See `.env.example` for required variables:

- DATABASE_URL
- JWT_SECRET
- CORS_ORIGINS
- CLOUDINARY credentials
- Email service credentials

## Build & Deployment

### Frontend Build

```bash
cd frontend/my-react-app
npm run build
# Output: dist/ folder (ready for deployment to Vercel/Netlify)
```

### Backend Deployment

- Deploy to Render, Heroku, or similar Node.js hosting
- Ensure PostgreSQL database is accessible
- Set environment variables in production environment

### Bundle Size

- Frontend: ~860 kB gzipped (production build)
- Build time: ~8-13 seconds

## API Endpoints Summary

The backend provides 140+ API endpoints across these domains:

- **Auth**: Registration, login, password reset, email verification
- **Profiles**: User profiles, social links, career interests
- **Roadmaps**: Learning paths, steps, resource tracking
- **Resources**: Curated content, approval workflows, interactions
- **Discussions**: Threaded conversations, voting, tags
- **Groups**: Study groups, membership, permissions, posts
- **Feed**: Personalized activity feed
- **Search**: Universal search with filters
- **Recommendations**: Personalized content recommendations
- **Dashboard**: User statistics and admin analytics
- **Admin**: User management, moderation, reference data
- **Gamification**: Streaks, goals, badges, XP system
- **Notifications**: Real-time updates

## Key Features

### Gamification System

- **Streaks**: Track consecutive daily activity
- **Reputation Tiers**: Unlock features at different levels
- **Badges**: Achievement recognition
- **VXP (Virtual Experience Points)**: Earned through activities
- **Spending System**: Use reputation/VXP for premium features

### Admin Features

- User management and moderation
- Reference data management (programs, tags, IT data)
- Resource approval workflows
- Roadmap creation and management
- Analytics and reporting
- Audit logging

### Community Features

- Discussion forums with threading
- Study groups with roles (member, co-admin, admin)
- Group visibility control (public/private)
- Media sharing in groups
- Peer recommendations

## Code Quality & Best Practices

- **Modular Architecture**: Feature-based frontend structure
- **Error Handling**: Comprehensive error boundaries and middleware
- **Validation**: Input validation on frontend and backend
- **Security**: HTTPS, CORS, XSS protection, bcrypt hashing
- **Testing**: Unit tests for critical functions
- **Documentation**: Code comments, API documentation
- **Performance**: Query optimization, lazy loading, code splitting

## Recent Improvements

- Fixed critical syntax error in authController.js
- Removed debug console.log statements from production code
- Cleaned up scratch/test files
- Verified frontend and backend build/startup
- Consolidated profile feature module
- Implemented UI/UX components (LoadingState, EmptyState, ErrorState)

## Known Issues & Notes

- Frontend bundle warning for large vendor chunk (~687 kB) - non-blocking
- `nepali-calendar-react` requires direct import: `nepali-calendar-react/dist/index.js`
- Strict TypeScript types not enabled (future enhancement)

## Development Workflow

### Git Convention

- Create feature branches for new features
- Commit messages should be descriptive
- Use PR reviews before merging to main

### Adding Features

1. Backend: Create controllers/services/routes
2. Frontend: Add components/pages/hooks in appropriate feature folder
3. Test locally before committing
4. Update documentation

## Support & Maintenance

For issues or questions:

1. Check existing documentation
2. Review error logs in browser console (frontend) or server logs (backend)
3. Verify environment variables are correctly set
4. Run database migrations if schema changes

## License

ISC License - See LICENSE file for details

---

**Last Updated**: May 11, 2026
**Status**: Production Ready ✅
