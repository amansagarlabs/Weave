# Weave backend

Spring Boot API for the Weave polyrepo.

## Development demo accounts

Demo accounts are created only when the `demo` Spring profile is explicitly active:

| Role | Email | Password |
|---|---|---|
| Creator | `user@gmail.com` | `12345678` |
| Brand | `brand@gmail.com` | `12345678` |
| Editor | `editor@gmail.com` | `12345678` |
| Admin | `admin@gmail.com` | `12345678` |

Run the backend with the demo profile using `--spring.profiles.active=demo` or `SPRING_PROFILES_ACTIVE=demo`. Do not enable this profile in production; these are predictable test credentials.

## Reproducible local build

Docker provides the pinned Maven 3.9 / Java 21 build environment, runs the backend tests, and starts the API with PostgreSQL:

```bash
docker compose up --build
```

The API is available at `http://localhost:8080`. Demo data remains opt-in. To use the documented demo accounts with Compose, set `SPRING_PROFILES_ACTIVE=demo` before starting the stack. Stop the stack with `docker compose down`; add `-v` only when you intentionally want to remove the local PostgreSQL volume.

## Local object storage

Compose also starts MinIO on `http://localhost:9000` with its console at `http://localhost:9001`. The `minio-init` service creates the `weave-assets` bucket for development uploads. The editor asset endpoint accepts preview or final files at `POST /edit-requests/{id}/assets` using multipart fields `kind` and `file`; uploads are limited to 25 MB and are restricted to the request participants.

For a different S3-compatible provider, replace `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, and `S3_PUBLIC_BASE_URL` without changing application code. The local Compose bucket is public-read for development only; use private objects and signed delivery URLs for production.

## Email and newsletters

Compose includes Mailpit at `http://localhost:8025` for local email capture. Set `MAIL_ENABLED=true` and `MAIL_PROVIDER=mailpit` to exercise transactional notifications. For production, set `MAIL_PROVIDER=resend`, `RESEND_API_KEY`, and a verified `MAIL_FROM` domain. Listmonk remains the separate admin-managed newsletter service; use it for campaigns and subscriber consent, not for Weave's transactional account emails. Cloudflare can provide DNS, SPF/DKIM/DMARC, and inbound routing; its outbound Email Sending service is not the free default.

### Object storage

Local Compose uses MinIO. Production can use Cloudflare R2 without changing application code because R2 exposes an S3-compatible API. Set `S3_ENDPOINT` to `https://<account-id>.r2.cloudflarestorage.com`, `S3_REGION=auto`, and use an R2 API token as `S3_ACCESS_KEY` and `S3_SECRET_KEY`. R2 currently includes 10 GB storage, 1 million Class A operations, and 10 million Class B operations in its monthly free tier; usage above those allowances is billable, while egress is free.

Production may instead use Cloudinary for media assets. Set `STORAGE_PROVIDER=cloudinary`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`. The API secret is backend-only and must never enter frontend environment variables. Cloudinary uploads are performed server-side with type and size validation and return HTTPS delivery URLs. For sensitive assets, configure Cloudinary authenticated/private delivery and add the signed-delivery response path before exposing those assets publicly.
## Transactional email

Local development uses Mailpit. Production can use any authenticated SMTP relay, Resend, or the optional self-hosted Docker Mailserver overlay:

```powershell
Copy-Item docker-data/dms/mailserver.env.example docker-data/dms/mailserver.env
docker compose -f docker-compose.yml -f docker-compose.mailserver.yml --profile mailserver up -d mailserver
docker compose -f docker-compose.yml -f docker-compose.mailserver.yml up -d backend
```

Set `MAIL_ENABLED=true`, `MAIL_PROVIDER=smtp`, `MAIL_HOST=mailserver`, and `MAIL_FROM` in `.env`. Create the sending account/configuration with Docker Mailserver's `setup` script, then generate DKIM keys with `docker exec <container> setup config dkim`. Publish SPF, DKIM, and DMARC records before sending to real addresses. Self-hosted SMTP is not automatically deliverable: DNS authentication, reverse DNS, port 25 access, reputation, bounce handling, and monitoring are required.

Postal remains a valid later replacement when Weave needs a dedicated mail-delivery UI, IP pools, and delivery webhooks; its API/SMTP boundary can be adopted without changing application callers.

## Production deployment

Do not run the development Compose file in production. Copy `.env.production.example` to a secret-managed `.env.production`, copy `docker-data/dms/mailserver.env.example` to `docker-data/dms/mailserver.env`, replace every placeholder, and deploy the production stack:

```bash
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
```

The `prod` profile refuses to start with demo data, insecure cookies, localhost origins, Mailpit, weak JWT secrets, non-HTTPS app URLs, disabled email, or missing storage configuration. Put a TLS reverse proxy in front of the backend; port 8080 binds to loopback only.
