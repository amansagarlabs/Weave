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
