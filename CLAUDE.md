# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A wedding website monorepo built with Turborepo, featuring a Next.js frontend, Hono backend API, real-time chat via Socket.io, and AWS Lambda for image processing. Uses SQLite with DrizzleORM for data persistence.

## Repository Structure

This is a Turborepo monorepo with:

**Apps:**
- `apps/frontend` - Next.js 16 app with App Router (deployed to Vercel)
- `apps/backend` - Hono API server with Socket.io websockets (runs on VPS)
- `apps/image-processor` - AWS Lambda function for processing uploaded images

**Packages:**
- `packages/db` - DrizzleORM schema and database utilities (SQLite)
- `packages/socket` - Socket.io type definitions and shared socket logic
- `packages/ui` - ShadCN UI components (Canary version) and shared React components
- `packages/utils` - Shared utilities (ID generation, URL factory, etc.)
- `packages/eslint-config` - Shared ESLint configuration
- `packages/typescript-config` - Shared TypeScript configuration

## Development Commands

### Initial Setup

```bash
# Copy environment files
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backend/.env.example apps/backend/.env

# Install dependencies
npm install

# Run database migrations
cd apps/backend
npx drizzle-kit migrate

# Seed the database (optional)
npx turbo run db:seed --filter=backend
```

### Running the Development Server

```bash
# From project root - runs both frontend and backend
npm run dev

# Or run individual apps:
npx turbo run dev --filter=frontend
npx turbo run dev --filter=backend
```

Default ports:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- WebSocket: ws://localhost:3001/ws

### Building

```bash
# Build all apps
npm run build

# Build specific app
npx turbo run build --filter=frontend
npx turbo run build --filter=backend
```

### Linting and Type Checking

```bash
npm run lint
npm run check-types

# Format code
npm run format
```

### Database Operations

```bash
cd apps/backend

# View database in Drizzle Studio
npx drizzle-kit studio

# Generate new migration after schema changes
npx drizzle-kit generate

# Push schema changes directly (dev only)
npx drizzle-kit push

# Run seeder
npx turbo run db:seed --filter=backend
```

### Image Processor Lambda

```bash
cd apps/image-processor

# Build Sharp layer (Linux binaries, not Windows compatible)
sh build-layer.sh

# Build lambda function
npm run build

# This creates lambda.zip ready for AWS Lambda deployment
```

### Cleaning Build Artifacts

```bash
# From project root - removes node_modules, .next, .turbo, dist
npm run clean
```

### Fixing Turborepo Dependencies

```bash
# Synchronize dependencies across workspaces
npx syncpack@alpha fix --dependency-types prod
```

## Architecture

### Frontend (Next.js 16)

- **App Router** with route groups: `(admin)`, `(root)`
- **API Rewrites**: `/api/*` proxies to backend except `/api/revalidate`
- **Authentication**: JWT stored in cookies, validated on the frontend
- **State Management**: Zustand for client state
- **Forms**: TanStack Form with Zod validation
- **Real-time**: Socket.io client connects to backend WebSocket server
- **Styling**: Tailwind CSS 4 with ShadCN UI (Canary)
- **Animations**: Motion library (formerly Framer Motion)

Key frontend routes:
- `/` - Public landing page
- `/rsvp` - RSVP form
- `/(root)/chat` - Real-time chat rooms
- `/(root)/gallery` - Photo gallery
- `/(root)/polls` - Event polls
- `/(root)/guestbook` - Guest messages
- `/(admin)/admin` - Admin dashboard (requires AWS Cognito auth)

### Backend (Hono)

- **Framework**: Hono running on Node.js via `@hono/node-server`
- **WebSockets**: Socket.io server mounted at `/ws` path
- **CORS**: Configured for production domains (svatba2026.com, vercel preview URLs)
- **Authentication**:
  - Guest auth: JWT tokens in cookies (`wed_sess`)
  - Admin auth: AWS Cognito tokens (`cog_token`)
- **Middleware**: `requireAuth` for guest routes, `requireAdminAuth` for `/api/admin/*`

API routes:
- `/api/auth` - Guest authentication
- `/api/rsvps` - RSVP management
- `/api/rooms` - Chat rooms
- `/api/images` - Image upload/presigned URLs
- `/api/gallery` - Photo gallery
- `/api/polls` - Polls and voting
- `/api/hotels` - Nearby hotels
- `/api/guestbook` - Guest messages
- `/api/urls` - URL shortener
- `/api/admin` - Admin operations (requires Cognito auth)
- `/api/weather` - Weather data
- `/` - General API endpoints

### Database Schema (SQLite + DrizzleORM)

Core tables:
- `users` - Guest information with name, email, phone, gender, table assignment
- `families` - Family groupings for guests
- `tables` - Seating arrangements
- `invitations` - RSVP responses with menu choice, transportation, accommodation
- `rooms` + `user_rooms` - Chat room management
- `messages` - Chat messages
- `polls` + `poll_options` + `poll_answers` - Event polls
- `guest_uploads` + `official_photos` - Photo gallery (S3 + CloudFront)
- `guestbook` + `guestbook_likes` - Guest messages with likes
- `url_shortener` - Short URLs
- `hotels` - Nearby accommodation
- `newsletter` - Email subscriptions
- `cache` - Application cache with expiry

Database file location: `apps/backend/database/dbase.sqlite`

### WebSocket Events (Socket.io)

**Client to Server:**
- `create-room` - Create new chat room
- `join-room` - Join existing room
- `get-messages` - Fetch room messages with pagination
- `chat-message` - Send message to room
- `invite-room` - Invite user to room
- `change-user` - Switch active user
- `get-unreads` - Get unread message counts
- `ping` - Connection health check

**Server to Client:**
- `new-room` - Room created notification
- `chat-message` - New message received
- `joined-room` - Successfully joined room
- `messages` - Message history response
- `live-feed` - Real-time event updates

Socket authentication uses the same JWT cookie as the REST API.

### Image Processing Lambda

- **Trigger**: S3 upload events
- **Function**: Processes images with Sharp (resizing, optimization)
- **Webhook**: Notifies backend via HMAC-signed webhook
- **Dependencies**: Sharp library in separate Lambda layer (Linux binaries)
- **Environment**: `WEBHOOK_URL`, `WEBHOOK_SECRET`, `BUCKET_NAME`, `AWS_REGION`

### UI Package (ShadCN Canary)

Uses ShadCN UI Canary version. To add new components:

```bash
cd packages/ui
npm run ui add [component-name]
```

Do NOT copy components from the stable ShadCN docs - the Canary version has different APIs.

### Shared Utilities

- `generateId()` - UUID v4 generator
- `eventData` - Wedding event metadata (date, location)
- `urlFactory()` - URL construction helpers
- `mimeToExt()` - MIME type to file extension mapping
- `getRootDomain()` - Extract root domain from URL
- `doubleKeyMap` - Two-key map data structure
- `mapByKey()` - Array to map conversion
- `pluralize()` - Pluralization utility
- `toArray()` - Ensure value is array

## Authentication Flow

1. **Guest Authentication**:
   - User selects their name from pre-populated guest list
   - Backend issues JWT with userId claim
   - JWT stored in httpOnly cookie (`wed_sess`)
   - Frontend decodes JWT client-side for user info

2. **Admin Authentication**:
   - AWS Cognito OAuth flow (separate from guest auth)
   - Cognito token stored in `cog_token` cookie
   - Admin routes prefixed with `/api/admin` require this token
   - Frontend admin routes under `(admin)` route group

## Environment Variables

### Frontend (`apps/frontend/.env.local`)
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL
- `NEXT_PUBLIC_WS_SERVER_URL` - WebSocket server URL
- `NEXT_PUBLIC_WS_PATH` - WebSocket path (/ws)
- `NEXT_PUBLIC_CDN_URL` - CloudFront CDN for images
- `NEXT_PUBLIC_COGNITO_*` - AWS Cognito config for admin auth
- `REVALIDATE_KEY` - Secret for Next.js on-demand revalidation

### Backend (`apps/backend/.env`)
- `BACKEND_PORT` - Server port (default 3001)
- `FRONTEND_URL` - Frontend URL for CORS
- `JWT_SECRET` - JWT signing secret
- `DB_PATH` - SQLite database path
- `SESSION_COOKIE_NAME` - Cookie name for JWT
- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` - AWS credentials
- `AWS_BUCKET_NAME` - S3 bucket for uploads
- `CDN_DOMAIN` - CloudFront domain
- `RESEND_KEY` - Resend API key for emails
- `MAIL_ADDRESS_FROM` - From address for emails
- `MAIL_PRETEND` - When true, doesn't send actual emails (dev mode)
- `WEBHOOK_SECRET` - Shared secret for Lambda webhook

## Key Technical Details

### Frontend-Backend Communication

- The Next.js frontend uses rewrites to proxy `/api/*` to the backend server
- WebSocket connection is direct to backend (no Next.js proxy)
- CORS is configured on backend for production domains
- All API requests include credentials (cookies) for authentication

### Database Location

The SQLite database is file-based at `apps/backend/database/dbase.sqlite`. This is a local file on the VPS where the backend runs.

### Build Configuration

- **Frontend**: Standard Next.js build with React Compiler enabled
- **Backend**: tsup bundles to single CJS file, minified, with `@repo/*` packages inlined
- **Lambda**: tsup + zip, Sharp library in separate layer

### React Version

The project uses React 19.2.3 across all packages (enforced via npm overrides).

### TypeScript

- Node 22+ required
- Shared configs in `packages/typescript-config`
- Strict mode enabled

### CSS/Styling

- Tailwind CSS 4 (new oxide engine)
- Global styles in `packages/ui/src/globals.css`
- CSS variables for theming
- Dark mode support via `next-themes`

## Common Development Patterns

### Adding a New API Route

1. Create route file in `apps/backend/src/routes/`
2. Import and mount in `apps/backend/src/index.ts` using `app.route()`
3. Use middleware for auth: `requireAuth` or `requireAdminAuth`
4. Return responses using Hono's `c.json()` with `{ success, data/error }` format

### Adding a New Database Table

1. Define schema in `packages/db/src/schema.ts`
2. Define relations if needed
3. Run `npx drizzle-kit generate` to create migration
4. Run `npx drizzle-kit migrate` to apply migration
5. Update seeder if needed in `packages/db/src/seeder.ts`

### Adding a New Frontend Page

1. Create route folder in `apps/frontend/app/(root)/` or `apps/frontend/app/(admin)/`
2. Add `page.tsx` for the route component
3. Use server components by default, client components where needed
4. Fetch data using Next.js patterns (Server Components, Route Handlers, or client-side fetching)

### Working with WebSockets

1. Socket events defined in `packages/socket/src/index.ts`
2. Server implementation in `apps/backend/src/socket.ts`
3. Client hooks in frontend use socket.io-client
4. Always handle connection/disconnection states
5. Authentication validated on socket connection via cookie

## Deployment

- **Frontend**: Vercel (automatic via git push)
- **Backend**: VPS with Node.js (manual deployment)
- **Database**: SQLite file on VPS
- **Images**: AWS S3 + CloudFront CDN
- **Lambda**: AWS Lambda (manual zip upload)
