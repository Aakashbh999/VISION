# VISION - IT Career Guidance Platform

VISION is a centralized career guidance platform for Nepalese IT students. It brings together curated domain roadmaps, degree pathways, local IT club directories, and structured academic resources in one place.

## Highlights

- Guides students through IT domains with curated learning roadmaps and resources.
- Supports academic planning with degree pathways and local IT community discovery.
- Includes discussions, study groups, resource moderation, user dashboards, and gamified progress tracking.
- Provides role-based administration for managing reference data, roadmaps, resources, and users.

## Technology

- **Frontend:** React, Vite, Tailwind CSS, React Query, React Router
- **Backend:** Node.js, Express, PostgreSQL (Neon Cloud)
- **Architecture:** Modular REST APIs following routes/controllers/services patterns
- **Infrastructure:** Vercel serverless deployment, database connection pooling, CORS, JWT authentication, and environment-based configuration

## Project Structure

```text
frontend/my-react-app/  React client
server/                 Express API, database migrations, and seeds
shared/                 Shared validation rules
docs/                   Supporting project documentation
```

## Run Locally

```bash
cd frontend/my-react-app
npm install
npm run dev
```

```bash
cd server
npm install
npm start
```

Configure the required frontend and server environment variables before running the application. Local `.env` files, dependencies, builds, logs, and IDE files are excluded from version control.