# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Start Commands

### Development
```bash
# Backend (Express + MongoDB)
cd server && npm run dev           # Runs on http://localhost:8080

# Frontend (Next.js)
cd client && npm run dev           # Runs on http://localhost:3000 with Turbopack

# Both services simultaneously (from root, requires 2 terminals)
# Terminal 1: cd server && npm run dev
# Terminal 2: cd client && npm run dev

# Docker (all services at once)
docker-compose up                  # Starts client, server, and nginx
docker-compose up --build          # Rebuild containers after dependency changes
docker-compose down                # Stop all services
```

### Code Quality
```bash
# Frontend linting
cd client && npm run lint          # ESLint check

# Backend has no lint/test scripts currently
```

### Production Build
```bash
# Build frontend
cd client && npm run build         # Creates optimized .next build
cd client && npm start             # Serves production build

# Production server
cd server && npm start             # Runs node index.js directly
```

## Architecture Overview

### Tech Stack
- **Frontend:** Next.js 15 (App Router) + React 19 + TypeScript + Material-UI + Zustand
- **Backend:** Node.js + Express.js + MongoDB (Mongoose) + JWT authentication
- **DevOps:** Docker + Docker Compose + Nginx reverse proxy

### Project Structure
```
quiz-app/
├── client/                    # Next.js frontend (port 3000)
│   ├── src/app/              # Next.js App Router pages
│   ├── src/components/        # Reusable React components
│   ├── src/stores/            # Zustand state (useUserStore, useSnackBarStore)
│   ├── src/api/               # API client functions
│   ├── src/utils/             # Helpers (api.ts with axios, authManager.ts)
│   ├── src/types/             # TypeScript definitions
│   ├── src/validations/       # Zod validation schemas
│   └── next.config.ts         # Next.js configuration
│
├── server/                    # Express backend (port 8080)
│   ├── models/                # Mongoose schemas (User, Quiz, Question, Tag)
│   ├── routes/                # Express route handlers
│   ├── helper/                # Utilities (auth middleware, file upload)
│   ├── validators/            # Express-validator schemas
│   ├── scripts/               # Database seeding
│   └── index.js               # Main server entry point
│
├── docker-compose.yml         # Orchestrates client, server, nginx
├── nginx.conf                 # Reverse proxy config
└── README.md                  # Project overview
```

### Key Data Flow & Architecture Patterns

#### 1. Authentication System
- JWT token-based with localStorage storage
- Axios interceptor automatically adds bearer token to requests
- 401 errors trigger logout + redirect to login
- useUserStore caches user data with 5-minute TTL
- `WithAuth` HOC protects routes that require authentication

**Key Files:**
- [server/helper/auth.js](server/helper/auth.js) - JWT middleware
- [server/routes/auth.js](server/routes/auth.js) - Auth endpoints
- [client/src/utils/api.ts](client/src/utils/api.ts) - Axios with interceptors
- [client/src/utils/authManager.ts](client/src/utils/authManager.ts) - Auth helpers
- [client/src/stores/useUserStore.ts](client/src/stores/useUserStore.ts) - User state

#### 2. Quiz CRUD Operations
Quiz model has embedded questions and options (denormalized for simplicity):
```javascript
Quiz {
  title, description, author, tags, visibility, maxPoints,
  questions: [{ questionText, explanation, options: [{ text, points, isCorrect }] }]
}
```

Flow: React Hook Form (with Zod) → API client → Express router → Mongoose save → Response

**Key Files:**
- [server/models/quiz.js](server/models/quiz.js) - Quiz schema with computed maxPoints
- [server/routes/quiz.js](server/routes/quiz.js) - CRUD endpoints
- [client/src/components/Wizard/](client/src/components/Wizard/) - Multi-step form component

#### 3. State Management (Zustand)
- `useUserStore`: Caches authenticated user (auto-refreshes after 5 min)
- `useSnackBarStore`: Manages toast notifications
- URL query params for pagination/filters (not Zustand)
- React Hook Form for local form state during creation/editing

**Key Files:**
- [client/src/stores/useUserStore.ts](client/src/stores/useUserStore.ts)
- [client/src/stores/useSnackBarStore.ts](client/src/stores/useSnackBarStore.ts)

#### 4. Docker Networking
```
nginx (localhost:80)
├── routes / → http://client:3000
└── routes /api/ → http://server:8000

client container runs on :3000 internally
server container runs on :8000 internally
```

Uses a shared `dev` bridge network defined in docker-compose.yml.

### Database Models
- **User:** email, name, password (hashed), avatar, roles, googleId, timestamps
- **Quiz:** title, description, author (ref), tags (array of strings), visibility, questions (embedded), maxPoints (computed), timestamps
- **Tag:** name, unique index
- **AIQuizAttempt:** Tracks AI generation usage for rate limiting

### API Communication Pattern
All client requests use axios instance from [client/src/utils/api.ts](client/src/utils/api.ts):
- Base URL: `process.env.NEXT_PUBLIC_API_URL`
- Request interceptor adds JWT token from localStorage
- Response interceptor handles 401 (logout + redirect)
- API functions organized by resource: `quizApi`, `authApi`, `tagApi`

## Important Implementation Details

### Special Features
- **AI Quiz Generation:** OpenAI integration at `/api/quiz-generator` with attempt tracking
- **Google OAuth:** Configured routes at `/auth/google` and `/auth/google/callback`
- **Tag System:** Predefined tags with search/popularity endpoints
- **Point-based Scoring:** Each option has point value, auto-calculated max
- **Visibility Modes:** private, public, selected (shared with specific users)
- **Success Animation:** Confetti effect on quiz completion (CSS animation)
- **Pagination:** Default 12 items/page, implemented with limit/skip parameters

### Validation Strategy
- **Frontend:** React Hook Form + Zod schemas for all forms
- **Backend:** Express Validator middleware for all POST/PUT requests
- Quiz title: 3-100 chars, questions: 5+ chars, at least 2 options per question

### Environment Variables
**Server (.env - not in git):**
```
MONGO_DB_URI=mongodb://...
SECRET=your_jwt_secret
PORT=8080
CLIENT_URL=http://localhost:3000
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
OPENAI_API_KEY=...
```

**Client (.env.local - not in git):**
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
```

### Git Branch Information
- **Main branch:** `main` (production)
- **Current branch:** `deploy-config` (Docker setup for deployment)
- Recent work: refactored header, fixed quiz behavior, removed rate limits
- Uncommitted changes: Dockerfiles and docker-compose.yml for deployment

## Common Development Tasks

### Adding a New Quiz Property
1. Update Mongoose schema in [server/models/quiz.js](server/models/quiz.js)
2. Add validation rules in [server/validators/index.js](server/validators/index.js) if needed
3. Update quiz creation form in [client/src/components/Wizard/](client/src/components/Wizard/)
4. Update TypeScript types in [client/src/types/](client/src/types/)
5. Update API functions in [client/src/api/](client/src/api/)

### Creating a New API Endpoint
1. Define Mongoose operation in [server/models/](server/models/)
2. Create route handler in [server/routes/](server/routes/) with validation
3. Add express-validator schema in [server/validators/index.js](server/validators/index.js)
4. Implement API client function in [client/src/api/](client/src/api/)
5. Use in component with proper error handling (useSnackBarStore for notifications)

### Protecting a Route
Wrap component with `WithAuth` HOC:
```tsx
import WithAuth from '@/components/WithAuth'
export default WithAuth(MyComponent)
```

### Adding a New State
Create new Zustand store in [client/src/stores/](client/src/stores/) following useUserStore pattern (with optional TTL caching).

## Testing & Deployment

### Local Testing
- Backend: `npm run dev` in server/
- Frontend: `npm run dev` in client/
- Verify API integration via browser DevTools Network tab
- Check browser Console for client errors
- Check terminal output for server errors

### Docker Testing
```bash
docker-compose up --build
# Access via http://localhost (nginx), frontend/api automatically proxied
```

### Pre-deployment Checklist
1. Verify no console errors: `npm run lint` in client/
2. Check environment variables are set (see above)
3. Test authentication flow (login, logout, token refresh)
4. Verify quiz CRUD operations work
5. Test pagination and filtering
6. Run `docker-compose up --build` to verify containers start

## Known Patterns & Conventions

- **Error Handling:** Use useSnackBarStore to show errors to users
- **Loading States:** Use React Loading Skeleton or MUI Skeleton
- **Form Submissions:** React Hook Form + Zod for validation
- **Async Operations:** Wrap with try-catch, show feedback via snackbar
- **Authorization:** Check token expiry in API interceptor, verify ownership on backend
- **File Organization:** Keep components small, use subfolders for feature grouping
- **Typing:** Use TypeScript strict mode, define interfaces in types/ folder
- **API Paths:** All server routes use `/api/` or `/auth/` prefix for namespacing

## Useful File References

- **Server entry:** [server/index.js](server/index.js)
- **Quiz routes:** [server/routes/quiz.js](server/routes/quiz.js)
- **Frontend layout:** [client/src/app/layout.tsx](client/src/app/layout.tsx)
- **API client setup:** [client/src/utils/api.ts](client/src/utils/api.ts)
- **Form wizard:** [client/src/components/Wizard/](client/src/components/Wizard/)
- **Protected routes:** [client/src/components/WithAuth/](client/src/components/WithAuth/)
