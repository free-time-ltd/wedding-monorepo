# Wedding Website With Chat

This is a project for my wedding and website

## ToDos

- Gotta add the event handler for when user gets invites to a new room
- At some point maybe migrate to better-sqlite3?
- Търсачка във CreateRoomDialog че при 88 човека - проблем
- RSVP страница със формуляр - измисли по-добър вариант от това което имаме в момента. Не би трябвало invitations таблицата да е главната
- Fuzzy search при guest portal-a ?
- Create a script that ssets everything up - env variables, mostly, but also runs any necessary drizzle-kit commands

## Fixing turborepo

- npx syncpack@alpha fix --dependency-types prod

## Requirements

For now the project requires both:

- Bun v1.2.10+
- NodeJS v22+
- NPM v10.9+

## Installation

```bash
npm run install
npm run dev
```

## Adding ShadCN components

```bash
cd packages/ui
npm run ui [rest of shadcn command - e.g. install Skeleton]
```

## Uploading schema updates

```bash
ch apps/backend
npx drizzle-kit push
npx drizzle-kit generate
```
