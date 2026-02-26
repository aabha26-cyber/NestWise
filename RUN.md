# Run NestWise

## First-time setup (required for sign-in and full app)

1. Copy env example and add your Clerk keys:
   ```bash
   cp .env.local.example .env.local
   ```
2. Open `.env.local` and replace the placeholder values with your real keys from [dashboard.clerk.com](https://dashboard.clerk.com) (use **both** Publishable key and Secret key from the same app).
3. Start the app with a clean build:
   ```bash
   npm run clean-dev
   ```
4. Open **http://localhost:8080**

If you skip Clerk setup, you may see an error screen; follow the link there to add keys and restart.

**Server connections (all optional except Clerk for sign-in):**
- **Clerk** – Required for sign-in. Use both Publishable and Secret keys from the same app.
- **Supabase** – Optional. If not set, portfolio and watchlist use the local simulator (browser storage). Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `SUPABASE_URL` / `SUPABASE_ANON_KEY`) to persist to a database.
- **OpenAI** – Optional. If not set, the Ask AI / chat shows a friendly fallback message. Set `OPENAI_API_KEY` for real AI replies.

## If you see "missing required error components", "invalid response", "Cannot find module", or "Server Error"

1. **Stop the dev server** (Ctrl+C in the terminal where it’s running).
2. **Free port 8080** (if you see `EADDRINUSE`):
   ```bash
   lsof -i :8080 | grep LISTEN   # note the PID
   kill <PID>
   ```
3. **Clean build and start dev:**
   ```bash
   npm run clean-dev
   ```
   Or: `npm run fix` then `npm run dev`.
4. Open **http://localhost:8080**

## If you see "EMFILE: too many open files"

In the same terminal before starting the app:

```bash
ulimit -n 10240
npm run dev
```

## Quick start (no errors)

```bash
npm run dev
```

Then open **http://localhost:8080**.
