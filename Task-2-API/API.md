# Mocha Studio API

Backend for the Mocha Studio frontend: contact enquiries, newsletter
signups, and the studio's project list. JSON in, JSON out.

## Running it

```bash
cd server
npm install
cp .env.example .env   # then edit API_KEY to a real secret
npm start               # listens on http://localhost:3001
```

## Auth

Public endpoints need nothing. Admin endpoints require an API key sent as
a header on every request:

```
x-api-key: <value of API_KEY from .env>
```

- Missing key → `401 Unauthorized`
- Wrong key → `403 Forbidden`

## Response envelope

Success:
```json
{ "data": { ... } }
```
or for lists:
```json
{ "data": [ ... ], "count": 3 }
```

Error:
```json
{ "error": { "message": "...", "details": [ { "field": "email", "message": "..." } ] } }
```
`details` is only present for validation errors (`400`).

## Endpoints

### Health

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | none | Liveness check. Returns `{ "status": "ok" }`. |

### Contact enquiries

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/contact` | none | Submit the contact form. |
| GET | `/api/contact` | API key | List all submissions. |
| GET | `/api/contact/:id` | API key | Fetch one submission. |

**POST /api/contact** request body:
```json
{
  "name": "Mara Allen",
  "email": "mara@example.com",
  "budget": "5-15k",
  "message": "We'd like a new storefront."
}
```
- `name`, `email`, `message` required, non-empty strings.
- `email` must look like a valid email address.
- `budget` optional; if present must be one of `under-5k`, `5-15k`, `15-40k`, `40k-plus`.

Responses: `201` on success with the created record (includes `id`,
`createdAt`); `400` with field-level `details` on validation failure.

### Newsletter

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/newsletter` | none | Subscribe an email. |
| GET | `/api/newsletter` | API key | List all subscribers. |

**POST /api/newsletter** request body:
```json
{ "email": "you@example.com" }
```
Responses: `201` on success; `400` on invalid email; `409` if the email is
already subscribed.

### Projects (studio work)

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/projects` | none | List all work items. |
| GET | `/api/projects/:id` | none | Fetch one work item. |
| POST | `/api/projects` | API key | Add a new work item. |

**POST /api/projects** request body:
```json
{
  "title": "Northbound",
  "tag": "Landing",
  "tone": "mocha",
  "description": "A launch page for a slow-travel journal app."
}
```
- `title`, `tag`, `description` required, non-empty strings.
- `tone` optional, one of `mocha`, `blue`, `grey` (defaults to `mocha`).

Responses: `201` on success; `400` with field-level `details` on
validation failure.

## Status codes used

| Code | Meaning |
|---|---|
| 200 | Successful GET |
| 201 | Resource created (POST) |
| 400 | Bad request — missing/invalid fields, or malformed JSON body |
| 401 | Missing API key on an admin route |
| 403 | Wrong API key on an admin route |
| 404 | Unknown route, or resource id doesn't exist |
| 409 | Conflict — email already subscribed |
| 500 | Unhandled server error |

## Manual testing (curl)

```bash
# Public: submit contact form
curl -i -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"Mara Allen","email":"mara@example.com","message":"Hello"}'

# Validation failure -> 400
curl -i -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" -d '{}'

# Admin: list contacts, no key -> 401
curl -i http://localhost:3001/api/contact

# Admin: list contacts, with key -> 200
curl -i http://localhost:3001/api/contact -H "x-api-key: <your-key>"

# Unknown route -> 404
curl -i http://localhost:3001/api/does-not-exist
```
