# Wedding Website With Chat

This is a project for my wedding and website

## ToDos

- Gotta add the event handler for when user gets invites to a new room
- At some point maybe migrate to better-sqlite3?
- Create a script that sets everything up - env variables, mostly, but also runs any necessary drizzle-kit commands
- Make a helper function for system chat messages
- For some reason chat duplicates messages at least according to NextJS.
- Make a better tailwind theme
- Integrate Resent to receive an email on RSVP change
- Tests for the backend?
- Daily or weekly SQLite backup to S3
- Decide on how you want gallery uploads
  - The whole infrastructure should be tagged as "wedding" so we can easily delete resources later
  - AWS cognito for Krisi and I
  - S3 bucket for image uploads
  - Github action to deploy backend to the VPS using deploy key
  - Figure out Vercel deployment (ezpz)
  - Lambda for image processing???
    - Resize
    - Convert to webp from any format
    - Lower quality
    - Generate thumbnails?
    - FFMPEG for video? Or smartphones already encode well? Investigate

## Fixing turborepo

- npx syncpack@alpha fix --dependency-types prod

## Requirements

For now the project requires both:

- Bun v1.2.10+
- NodeJS v22+
- NPM v10.9+

## Installation

```bash
cp apps/frontend/.env.example apps/frontend/.env.local
cp apps/backend/.env.example apps/backend/.env
npm run install
cd apps/backend
npx drizzle-kit migrate
```

## Seeding the database

From the project root execute the following command:

```bash
npx turbo run db:seed --filter=backend
```

## Adding ShadCN components

Since the project is using ShadCN UI Canary, we cannot copy & paste fom the official docs directly

```bash
cd packages/ui
npm run ui [rest of shadcn command - e.g. install Skeleton]
```

## Pushing & Generating schema updates

```bash
cd apps/backend
npx drizzle-kit push
npx drizzle-kit generate
```
