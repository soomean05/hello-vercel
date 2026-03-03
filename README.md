# CaptionRater – Project 1

Next.js (App Router) app with Supabase auth, DB reads, voting, and AlmostCrackd image-caption pipeline.

## Deploy on Vercel

1. Push to GitHub and connect the repo to Vercel.
2. Configure environment variables (see below).
3. **Disable deployment protection** so the app is publicly accessible.
4. Deploy.

## Environment Variables

Set these in Vercel (or `.env.local` for local dev):

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `NEXT_PUBLIC_SITE_URL` | (Optional) App origin, e.g. `https://your-app.vercel.app`. Falls back to `window.location.origin` if unset. |

**Supabase project reference:** `qihsgnfjqmkjmoowyfbn` (use env vars in code; do not hardcode keys).

## Google OAuth (Supabase)

1. In Supabase: Authentication → Providers → Google → enable.
2. Use Client ID: `388960353527-fh4grc6mla425lg0e3g1hh67omtrdihd.apps.googleusercontent.com`
3. Redirect URI must be: `https://<your-domain>/auth/callback` (e.g. `https://your-app.vercel.app/auth/callback`).

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). For Google sign-in locally, add `http://localhost:3000/auth/callback` as a redirect URI in Supabase and optionally set `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.

## Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Homepage, sign in with Google |
| `/list` | Public | DB read demo (20 rows from `captions`) |
| `/protected` | Protected | Dashboard, links to rate/upload |
| `/rate` | Protected | Vote on captions (thumbs up/down) |
| `/upload` | Protected | Upload image → AlmostCrackd pipeline → captions |

## AlmostCrackd Pipeline

The upload flow calls `https://api.almostcrackd.ai`:

1. `POST /pipeline/generate-presigned-url` → presignedUrl, cdnUrl  
2. `PUT` file bytes to presignedUrl  
3. `POST /pipeline/upload-image-from-url` → imageId  
4. `POST /pipeline/generate-captions` → captions array  

Supported image types: JPEG, PNG, WebP, GIF, HEIC.
