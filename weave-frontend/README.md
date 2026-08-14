# Weave frontend

Next.js 16 App Router frontend for Weave. The backend is the separate Spring Boot `weave-backend` application.

## Local development

```bash
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` when connecting to the backend.

For local page-flow testing, start the backend with the `demo` Spring profile and use the credentials in [`../agent/DEMO_CREDENTIALS.md`](../agent/DEMO_CREDENTIALS.md). The primary creator login is `user@gmail.com` / `12345678`.
