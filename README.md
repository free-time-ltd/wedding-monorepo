# Wedding Website With Chat

This is a project for my wedding and website. Senior developers can't build simple stuff so here's a presentation website that uses AWS, Vercel and a 5$ VPS to split the code into backend and frontend, build an API and deal with CORS because why not?

## ToDos

- В админа с поканите да се вижда винаги кой е поканения човек
- В пожеланията има бъг, когато пожеланията с 3
- Селектора на пожеланията трябва да събира всички одобрен пожелания + пожеланията добавени от _currentUser_

## Fixing turborepo

- npx syncpack@alpha fix --dependency-types prod

## Requirements

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
npm run ui [rest of shadcn command - e.g. add Skeleton]
```

## Pushing & Generating schema updates

```bash
cd apps/backend
npx drizzle-kit push
npx drizzle-kit generate
```
