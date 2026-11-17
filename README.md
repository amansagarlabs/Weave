# Weave
# Weave

Weave is a creator, brand, and editor collaboration platform with a Spring Boot API, Next.js frontend, PostgreSQL, Redis, MinIO, and Mailpit development stack.

## Developer setup

Follow the complete [Docker Developer Guide](agent/DOCKER_DEVELOPER_GUIDE.md) to set up the project on another computer.

Quick start:

```powershell
Copy-Item weave-backend/.env.example weave-backend/.env
Copy-Item weave-frontend/.env.example weave-frontend/.env.local
cd weave-backend
docker compose up -d --build
cd ../weave-frontend
npm install
npm run dev
```

Open `http://localhost:3000`. Demo credentials are documented in [agent/DEMO_CREDENTIALS.md](agent/DEMO_CREDENTIALS.md).

## Real-time chat and free self-hosting

Weave's existing conversation UI uses the Spring Boot STOMP/WebSocket endpoint (`/ws`) and persists messages in PostgreSQL. The AnyCable project is a useful MIT-licensed Next.js real-time reference, but its example deploys the web app on Vercel and requires a separately hosted AnyCable-Go server. We do not use that Vercel deployment path; this repository already runs Next.js and its WebSocket backend locally with Docker Compose.

Local development can run without a PaaS account or hosting bill: use the Docker stack in [agent/DOCKER_DEVELOPER_GUIDE.md](agent/DOCKER_DEVELOPER_GUIDE.md). It includes PostgreSQL, Redis, MinIO, the API, and Mailpit. A public internet deployment still needs a machine, VPS, or provider; free tiers have quotas and are not a promise of unlimited free production hosting. Cloudflare Durable Objects are an optional future realtime backend, not required for the current self-hosted app.

Chat UI currently supports live text, typing status, reconnects, and local emoji reactions. File selection is surfaced in the composer, while durable attachment upload and cross-user reaction persistence need backend API/schema work before they are production features.
