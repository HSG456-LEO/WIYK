# Deploying "What's in the Kitchen"

This package gets your app onto a real, live URL with **working AI-generated recipes** — not just a UI preview. No coding experience needed for these steps, but you will need a free GitHub account and a free Netlify account.

## What's in this folder

- `public/index.html` — the app itself
- `netlify/functions/generate.js` — a small server-side function that talks to Anthropic on the app's behalf, so your API key stays private
- `netlify.toml` — tells Netlify how to build the site

---

## Step 1: Get an Anthropic API key

1. Go to **console.anthropic.com** and sign up (this is separate from any Claude.ai subscription)
2. Add a payment method under **Plans & Billing** so you have credits available (see the billing conversation we had — costs at low usage are typically cents, not dollars)
3. Go to **API Keys** → **Create Key** → copy it somewhere safe. You won't be able to see it again after this.

## Step 2: Put this code on GitHub

1. Go to **github.com**, sign up if you don't have an account
2. Click **New repository**, give it a name (e.g. `kitchen-app`), keep it **Private** if you'd rather not make the code public, then **Create repository**
3. On the new repo's page, click **Add file → Upload files**
4. Drag in all the files and folders from this package (keeping the folder structure: `public/`, `netlify/functions/`, and `netlify.toml` at the top level)
5. Click **Commit changes**

## Step 3: Connect it to Netlify

1. Go to **netlify.com**, sign up (the free tier covers this comfortably)
2. Click **Add new site → Import an existing project**
3. Choose **GitHub**, authorize Netlify, and select the repo you just created
4. Netlify will detect `netlify.toml` automatically — leave the build settings as they are and click **Deploy**

## Step 4: Add your API key to Netlify (never to the code itself)

1. In your new site's dashboard, go to **Site configuration → Environment variables**
2. Add a variable named exactly `ANTHROPIC_API_KEY`, and paste in the key from Step 1
3. Go to **Deploys** and trigger **Deploy site** again, so the function picks up the new key

## Step 5: You're live

Netlify gives you a URL like `https://your-site-name.netlify.app` — that's your real, shareable link. Recipe generation and photo analysis will now work for real, for anyone who visits it.

---

## Known limitation: community features are local-only for now

Accounts, saved recipes, community recipe uploads, and Recipe of the Week all currently save to the *visitor's own browser* (using `localStorage`), not to a shared database. That means:

- ✅ Works fine, nothing breaks, each visitor gets their own account/saved recipes
- ❌ Two different people won't see each other's uploaded community recipes — each browser only sees what it saved itself

To make community sharing genuinely work across real users, you'd need a proper shared database behind it (options include Netlify Blobs, Supabase, or Firebase — all have workable free tiers). That's a reasonably contained next step once you're ready for it — just say the word and we can wire it up.

## A cost safety net

Once your key is live, set a spend limit in Anthropic's console (**Plans & Billing → Spend limits**) — a small cap like $10–20/month costs you nothing if you never hit it, but protects you from a bug or unexpected traffic spike.
