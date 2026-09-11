# Vercel Deployment Multi-Account & Team Setup

> Guide for deploying KisanSetu on Vercel under multiple personal accounts or team organizations for SIH 2026.

Since SIH team members often collaborate and need to test deployments, or you want to separate preview branches and production across different Vercel spaces, follow this guide for multi-account and team organization setup.

## 1. Setting Up Teams vs Personal Accounts

Vercel provides Personal Accounts (Hobby tier - Free) and Team Accounts (Pro tier - Paid/Trial). For SIH, a common scenario is deploying from the same repository to a Vercel Team (for the main staging link) or to multiple Personal Accounts (for individual branch testing).

### How to link multiple Vercel accounts to one repository:
1. Ensure the GitHub repository has **Vercel GitHub App** installed and given access to the repository.
2. In User A's Vercel account, import the `kisansetu` repository.
3. In User B's Vercel account, import the *same* `kisansetu` repository. Vercel allows multiple personal accounts to link to the same GitHub repo, provided they are not pushing to the exact same production custom domain simultaneously.

## 2. Using `vercel.json` Across Teams/Accounts

We have provided a `vercel.json` at the root of this project. It standardizes the deployment configuration across any account or team that imports the codebase:

- Enforces the `npm run build` and Next.js framework configuration.
- Sets strict Security Headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`) globally.
- Sets global CORS headers and proxy rewrites (`/api/proxy/*`) so the frontend can securely call your Render backend without exposing raw backend URLs.
- Sets `regions: ["bom1"]` to ensure the frontend Edge nodes default to **Mumbai, India** for ultra-low latency.

## 3. Environment Variables Sync

When deploying across multiple accounts/teams, you must ensure Environment Variables are synced identically.
For each Vercel project in each account, navigate to **Settings → Environment Variables** and add:

- `NEXT_PUBLIC_API_BASE_URL` (e.g. `https://kisansetu-api.onrender.com` or your own deployed backend URI)
- `NEXT_PUBLIC_USE_MOCK_API` (set to `false` for real backend)
- Add any other Maps or UI API keys.

## 4. Local CLI Switching

If you are using the Vercel CLI locally (`npm i -g vercel`), use the `--scope` flag to deploy to different teams or accounts without logging in and out constantly:

```bash
# Login to Vercel locally
vercel login

# Deploy to your personal hobby account
vercel --prod

# Deploy to an SIH Team organization
vercel --prod --scope your-sih-team-slug
```

To link the local directory to a specific project id across accounts:
```bash
# Link the project
vercel link
# (It will ask you to pick the scope and the existing project)
```

## 5. Branch Preview Tiers and Ownership

By default, any PR made to the repository will generate a Vercel Preview URL. If you have multiple Vercel accounts linked to the repository, Vercel will attempt to generate a preview deployment on *all* connected projects.
To stop duplicate preview builds:
1. Decide which Vercel Account is the "Primary" host.
2. On other accounts, go to **Settings → Git → Ignored Build Step**, and set it so it doesn't build preview branches.
   - Run command: `if [ "$VERCEL_ENV" = "production" ]; then exit 1; else exit 0; fi` (Inverts it so it only builds on `main`).