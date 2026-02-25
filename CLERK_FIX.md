# Fix "Infinite redirect" and "localhost refused to connect"

## 1. Use the correct localhost URL

Your app runs on **port 8080**, not 3000. Use:

**http://localhost:8080**

(Your `package.json` has `"dev": "next dev -p 8080"`.)

---

## 2. Fix Clerk "keys do not match" (infinite redirect)

The error means your **publishable key** and **secret key** are from **different** Clerk apps. They must both come from the **same** application.

### Steps

1. Go to **https://dashboard.clerk.com** and sign in.
2. Open **one** application (e.g. your NestWise app). Do not mix keys from different apps.
3. In that app, go to **API Keys**.
4. Copy the **Publishable key** (starts with `pk_test_` or `pk_live_`).
5. Copy the **Secret key** (starts with `sk_test_` or `sk_live_`).
6. Open your project’s **`.env.local`** file.
7. Set **both** keys (replace the existing values):
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...` (the one you just copied)
   - `CLERK_SECRET_KEY=sk_test_...` (the one you just copied)
8. Save the file.
9. **Stop** the dev server (Ctrl+C in the terminal).
10. Run **`npm run dev`** again.
11. In your browser, clear cookies for `localhost` or use a **private/incognito** window, then open **http://localhost:8080**.

After this, the infinite redirect should stop and the app should load.
