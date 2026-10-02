# Blake's Bakes

A small baking journal built with React, Vite, React-Bootstrap, and Bootstrap. Browse baking projects, search by name or notes, filter by bake type, open a post for its full recipe notes, and add a new bake to the journal.

## Stack

- **Frontend:** React + Vite + React-Bootstrap / Bootstrap
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (`pg`)

## Run locally

1. Install dependencies with `npm install`.
2. Create a PostgreSQL database, for example `blakes_bakes`.
3. Apply the schema and sample posts:

   ```sh
   psql -d blakes_bakes -f server/schema.sql
   psql -d blakes_bakes -f server/seed.sql
   ```

4. Copy `.env.example` to `.env` in the project root and set the local database URL:

   ```env
   DATABASE_URL=postgresql://postgres:your-password@localhost:5432/blakes_bakes
   PORT=3001
   CLIENT_ORIGIN=http://localhost:5173
   ```

   For a hosted PostgreSQL provider that requires TLS, set `PGSSL=true` (the server validates the TLS certificate).

5. Start the API and Vite in separate terminals:

   ```sh
   npm run server
   npm run dev
   ```

   Open the local URL printed by Vite. The API is available at `http://localhost:3001`; set `VITE_API_URL` in a root `.env` file if it runs elsewhere.

## API

- `GET /api/health` — checks the API and its PostgreSQL connection.
- `GET /api/posts` — lists baking posts, newest first.
- `POST /api/posts` — validates and creates a baking post; responds with `201 Created`, the post body, and a `Location` header.
- `GET /api/posts/:id` — retrieves one post; responds with `404 Not Found` when it does not exist.
- `PUT /api/posts/:id` — replaces all editable post fields. Omitted optional fields (`recipeSource`, `tips`, `thoughts`, and `flavors`) are reset to their empty values.
- `PATCH /api/posts/:id` — updates only supplied editable fields.
- `DELETE /api/posts/:id` — deletes a post and responds with `204 No Content`.

Post IDs must be positive integers. Invalid JSON or post data returns `400 Bad Request`; a valid ID with no matching post or unknown API path returns `404 Not Found`. Unsupported methods return `405 Method Not Allowed` with an `Allow` header. Database/server failures return `500 Internal Server Error`. All request and response bodies use JSON, except for the empty `204` response.

The database stores the project name, date, photo URL, recipe source, type, tips, thoughts, flavors, enjoyment rating, and short description. Tips, thoughts, and flavors are PostgreSQL `JSONB` arrays.

## Next improvements

- Add post editing and deletion, with confirmation before deleting.
- Support uploading photos to object storage instead of relying on image URLs.
- Store structured recipe ingredients and instructions so recipes are easier to scale, print, and follow.
- Add pagination and database-backed search/filtering as the journal grows.
- Add authentication before publishing a private journal to the internet.
