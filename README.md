# Wedding Website With Chat

This is a project for my wedding and website. Senior developers can't build simple stuff so here's a presentation website that uses AWS, Vercel and a 5$ VPS to split the code into backend and frontend, build an API and deal with CORS because why not?

## ToDos

- Gotta add the event handler for when user gets invites to a new room
- At some point maybe migrate to better-sqlite3?
- Create a script that sets everything up - env variables, mostly, but also runs any necessary drizzle-kit commands
- For some reason chat duplicates messages at least according to NextJS.
- Tests for the backend?
- Daily or weekly SQLite backup to S3
- Make a better email at RSVP change
- Complete the @todos in code or remove them
- Try replacing Bun with tsup for the backend project one last time

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

## Previewing the database

DrizzleORM comes with its own studio, just like PrismaORM. To run it simply run the following and follow instructions

```bash
cd apps/backend
npx drizzle-kit studio
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
