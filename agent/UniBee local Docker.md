# Local UniBee Docker Setup

Weave uses UniBee for hosted invoice checkout. UniBee can be self-hosted locally using its official AGPLv3 standalone Docker Compose deployment.

## Start UniBee

From the repository root:

```powershell
.\scripts\setup-unibee.ps1
```

The official stack starts MySQL, Redis, the UniBee API, admin portal, user portal, and Nginx. Open `http://localhost` for the UniBee portal. UniBee documents the same standalone deployment in its [official repository](https://github.com/UniBee-Billing/unibee).

## Connect Weave

The local Weave backend runs in Docker, so it reaches the UniBee API through Docker Desktop's host gateway:

```env
WEAVE_UNIBEE_BASE_URL=http://host.docker.internal:8088
WEAVE_UNIBEE_API_KEY=your_local_unibee_api_key
WEAVE_UNIBEE_PAYMENT_GATEWAY_ID=your_local_gateway_id
WEAVE_UNIBEE_PAYMENT_TYPE=
```

Create the API key and configure a payment gateway in the UniBee admin portal. Self-hosting removes UniBee Cloud fees, but it does not create a free UPI/card/bank payment rail. A real payment method still needs a configured gateway, and its provider may charge transaction fees.

Restart Weave after configuration:

```powershell
docker compose -f weave-backend/docker-compose.yml up -d --build backend
```

When running that command from the repository root, use the backend env file explicitly so a Windows user-level environment variable cannot override it:

```powershell
docker compose --env-file weave-backend/.env -f weave-backend/docker-compose.yml up -d --build backend
```

For local webhook delivery, configure UniBee to call:

```text
http://host.docker.internal:8080/webhooks/unibee
```

Then the creator can use **Refresh UniBee checkout** for an existing invoice. The brand will receive the external UniBee payment URL instead of the old local booking URL.
