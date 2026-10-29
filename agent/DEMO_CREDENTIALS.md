# Weave local demo credentials

Use these only for local development and page-flow testing. The backend seeds them only with the explicit Spring `demo` profile.

| Workspace | Email | Password |
|---|---|---|
| Creator | `user@gmail.com` | `12345678` |
| Brand | `brand@gmail.com` | `12345678` |
| Editor | `editor@gmail.com` | `12345678` |
| Admin | `admin@gmail.com` | `12345678` |

Start the backend with `--spring.profiles.active=demo`, then open the frontend at `http://localhost:3000/login`.

The demo profile also creates representative creator-brand booking, message, editor-request, package, and draft-invoice records so the detail pages can be exercised immediately.

Never use these credentials outside local development.
