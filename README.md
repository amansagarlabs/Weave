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
