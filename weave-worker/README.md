# Weave Worker API

Chat migration slice: D1 message history and reactions, R2 attachments, and one Durable Object per thread for live message delivery and typing.

## Local-only setup

1. Run npm install.
2. Copy .dev.vars.example to .dev.vars and set JWT_SECRET to the Spring signing secret used by your local backend.
3. Apply the local schema with npx wrangler d1 migrations apply weave --local.
4. Run npm run dev.
5. Set NEXT_PUBLIC_CHAT_API_URL to the local Worker URL and NEXT_PUBLIC_REALTIME_URL to that URL plus /realtime. Keep NEXT_PUBLIC_API_URL on Spring for sign-in, session refresh and realtime-token issuance.

This local setup does not create Cloudflare resources. The D1 ID in wrangler.toml is a local placeholder. Before a future deployment, replace it and configure production D1/R2 bindings and secrets.

Spring auth cookies are host-scoped. Production chat requests must use a compatible hostname/site with Spring, or the auth transport must be migrated. A separate workers.dev hostname will not receive the current host-scoped cookies.

## Routes

- GET /health
- GET /users/me and participant-only GET /bookings/:id
- GET /messages, GET /messages/:threadId and POST /messages
- POST /messages/attachments and participant-only GET /messages/attachments/:id
- POST /messages/:id/reactions
- GET /realtime/:threadId WebSocket upgrade

The Worker verifies Spring HS256 access/realtime tokens and looks up users in D1. It expects imported users, bookings and message history. The frontend can route chat API calls separately with NEXT_PUBLIC_CHAT_API_URL; login and realtime-token issuance remain on Spring for this slice.

Attachments are limited to 10 MB and JPEG, PNG, GIF, WebP, AVIF, PDF or plain text. Notifications, auth issuance, billing, admin and other marketplace domains remain on the migration roadmap.

Do not run a remote deploy until D1 import, cookie hostname, secrets, R2 bucket and rollback have been prepared.