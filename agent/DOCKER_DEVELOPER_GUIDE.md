# Weave Docker Developer Guide

Run Weave on a new computer with Docker Desktop, PostgreSQL, Redis, MinIO, Mailpit, the Spring Boot API, and the Next.js frontend.

## Requirements

- Docker Desktop with Compose v2
- Git
- Node.js 20 or newer and npm

Verify:

```powershell
docker --version
docker compose version
node --version
npm --version
```

## Get and configure

```powershell
git clone <repository-url> weave
cd weave
Copy-Item weave-backend/.env.example weave-backend/.env
Copy-Item weave-frontend/.env.example weave-frontend/.env.local
```

For local demo data, set this in `weave-backend/.env`:

```dotenv
JWT_SECRET=change-this-development-secret-to-at-least-32-characters
SPRING_PROFILES_ACTIVE=demo
MAIL_ENABLED=true
MAIL_PROVIDER=mailpit
```

Do not commit either environment file. Docker supplies the internal PostgreSQL, Redis, MinIO, and Mailpit connection values. Keep the backend database host as the Compose service name `postgres`, not `localhost`.

## Start the backend

```powershell
cd weave-backend
docker compose up -d --build
docker compose ps
Invoke-WebRequest http://localhost:8080/actuator/health
```

The health response should contain `{"status":"UP"}`. Follow backend logs with:

```powershell
docker compose logs -f backend
```

## Start the frontend

Open a second terminal:

```powershell
cd weave-frontend
npm install
npm run dev
```

Open `http://localhost:3000`. For same-machine development, leave `NEXT_PUBLIC_API_URL` blank. To set it explicitly in `weave-frontend/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_REALTIME_URL=ws://localhost:8080
```

Restart Next.js after changing public environment variables.

## Service URLs

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:8080` |
| Health | `http://localhost:8080/actuator/health` |
| MinIO API | `http://localhost:9000` |
| MinIO console | `http://localhost:9001` |
| Mailpit | `http://localhost:8025` |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |

## Demo accounts

These exist only with `SPRING_PROFILES_ACTIVE=demo`:

| Role | Email | Password |
|---|---|---|
| Creator | `user@gmail.com` | `12345678` |
| Brand | `brand@gmail.com` | `12345678` |
| Editor | `editor@gmail.com` | `12345678` |
| Admin | `admin@gmail.com` | `12345678` |

Use these credentials only for local development. See [DEMO_CREDENTIALS.md](DEMO_CREDENTIALS.md).

## Use from another PC on the LAN

Find the host computer IPv4 address:

```powershell
ipconfig
```

Set the host address in `weave-frontend/.env.local`, then restart Next.js:

```dotenv
NEXT_PUBLIC_API_URL=http://192.168.1.15:8080
NEXT_PUBLIC_REALTIME_URL=ws://192.168.1.15:8080
```

From the second PC, open `http://192.168.1.15:3000`. Replace the example address with the host address. The Compose backend already allows development origins matching `http://192.168.*:3000`. Allow only TCP ports 3000 and 8080 through the host firewall on the private network. Never expose PostgreSQL, Redis, or MinIO publicly.

## Local uploads and email

- MinIO creates the `weave-assets` bucket for portfolio and editor uploads.
- MinIO console credentials default to `weave-minio` and `change-this-minio-password` when not overridden.
- Mailpit captures local mail at `http://localhost:8025`; no real email is sent.
- UniBee is optional. Leave its API key empty when payment work is skipped.

## Stop or reset

Preserve local data:

```powershell
cd weave-backend
docker compose down
```

Delete all local database, Redis, and MinIO data:

```powershell
docker compose down -v
docker compose up -d --build
```

Use `down -v` only when a full local reset is intended.

## Troubleshooting

- Backend unavailable: run `docker compose ps` and `docker compose logs backend postgres redis minio`.
- Frontend cannot connect: verify the health URL, use the host IP for LAN access, restart Next.js, and check firewall ports 3000/8080.
- Upload failure: confirm `minio` and `minio-init` are healthy and verify `weave-assets` at `http://localhost:9001`.
- Demo login failure: confirm the demo profile was active when the backend started. Existing volumes may require `docker compose down -v` to recreate demo data.

## Verification

```powershell
cd weave-backend
docker compose build backend
cd ../weave-frontend
npx tsc --noEmit --incremental false
```

Never commit `.env`, `.env.local`, API keys, or production secrets.
