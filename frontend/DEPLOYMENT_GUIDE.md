# Deployment Guide

Complete deployment instructions for TFT Professor in both "no database" and Supabase modes.

---

## Goal A: No Database Mode → GitHub Pages

Deploy static files to GitHub Pages. No backend needed (all data in `comps.json`).

### 1. Configure Vite for GitHub Pages

**Edit `vite.config.ts`:**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/tft-professor/', // Replace with your repo name
})
```

**Important:** 
- `base` must match your GitHub repo name
- If deploying to `username.github.io`, use `base: '/'`
- If deploying to `username.github.io/repo-name`, use `base: '/repo-name/'`

### 2. Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        working-directory: ./frontend
        run: npm ci

      - name: Build
        working-directory: ./frontend
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./frontend/dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 3. Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages**
2. Under "Build and deployment":
   - Source: **GitHub Actions**
3. Save

### 4. Deploy

```bash
# Commit and push
git add .
git commit -m "Add GitHub Pages deployment"
git push origin main
```

GitHub Actions will automatically build and deploy.

### 5. Verification Checklist

- [ ] Workflow runs successfully (Actions tab → green checkmark)
- [ ] Site accessible at `https://username.github.io/repo-name/`
- [ ] Champion/item sprites load correctly
- [ ] Routing works (can navigate between pages)
- [ ] Data loads (see comps in results)
- [ ] No console errors (F12 → Console)

### 6. Common Mistakes & Fixes

**❌ Blank page / 404 on routes**
```
Problem: React Router not configured for GitHub Pages
Fix: Use HashRouter instead of BrowserRouter for GitHub Pages
```

**Solution:** Edit `src/main.tsx`:
```typescript
// Change from:
import { BrowserRouter } from 'react-router-dom'
// To:
import { HashRouter } from 'react-router-dom'

// And wrap with HashRouter:
<HashRouter>
  <ToastProvider>
    ...
  </ToastProvider>
</HashRouter>
```

**❌ Images not loading**
```
Problem: Wrong base path
Fix: Verify vite.config.ts base matches your repo name
```

**❌ Workflow fails on npm ci**
```
Problem: package-lock.json out of sync
Fix: Delete node_modules and package-lock.json, run npm install, commit
```

**❌ White screen after deploy**
```
Problem: JavaScript module path wrong
Fix: Check vite.config.ts base has trailing slash: '/repo-name/'
```

---

## Goal B: Supabase Mode → Vercel + Supabase

**Recommendation:** Use **Vercel** instead of GitHub Pages for Supabase mode.

**Why?**
- GitHub Pages only serves static files (no API routes)
- Vercel supports SSR, environment variables, and auth redirects
- Free tier is generous
- Zero-config deployment for Next.js/Vite
- Automatic HTTPS and custom domains

### Alternative: Use GitHub Pages + Supabase Client-Side

If you must use GitHub Pages:
- All Supabase calls happen client-side (no API routes needed)
- Store Supabase URL/anon key in `.env.local`
- Build handles env vars at compile time
- **Caveat:** Anon key is public (visible in JS bundle) — use Supabase RLS

We'll cover both options below.

---

## Option B1: Vercel + Supabase (Recommended)

### 1. Setup Supabase

1. Go to [supabase.com](https://supabase.com), create account
2. Create new project
3. Go to **Settings** → **API**
4. Copy:
   - `Project URL` (e.g., `https://abc123.supabase.co`)
   - `anon public` key

### 2. Create `.env.local`

In `frontend/.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important:**
- Prefix all env vars with `VITE_` for Vite to expose them
- **Never commit `.env.local`** (add to `.gitignore`)
- Anon key is safe to expose (client-side) if you use RLS

### 3. Update Vite Config

**Edit `vite.config.ts`:**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Vercel uses root path
})
```

### 4. Create Supabase Tables

Run in Supabase SQL Editor:

```sql
-- Champions table
CREATE TABLE champions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cost INT NOT NULL CHECK (cost BETWEEN 1 AND 5),
  traits TEXT[] NOT NULL,
  cdn_slug TEXT
);

-- Items table
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cdn_slug TEXT
);

-- Comps table
CREATE TABLE comps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  set TEXT NOT NULL,
  patch TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comp units (many-to-one with comps)
CREATE TABLE comp_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comp_id UUID REFERENCES comps(id) ON DELETE CASCADE,
  champion_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('carry', 'tank', 'support', 'flex')),
  recommended_items TEXT[] DEFAULT '{}',
  optional_items TEXT[] DEFAULT '{}'
);

-- Comp positioning (many-to-one with comps)
CREATE TABLE comp_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comp_id UUID REFERENCES comps(id) ON DELETE CASCADE,
  champion_id TEXT NOT NULL,
  x INT NOT NULL CHECK (x BETWEEN 0 AND 6),
  y INT NOT NULL CHECK (y BETWEEN 0 AND 3),
  UNIQUE(comp_id, x, y) -- No duplicate positions
);

-- Enable Row Level Security
ALTER TABLE champions ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE comps ENABLE ROW LEVEL SECURITY;
ALTER TABLE comp_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE comp_positions ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Allow public read" ON champions FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON items FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON comps FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON comp_units FOR SELECT USING (true);
CREATE POLICY "Allow public read" ON comp_positions FOR SELECT USING (true);

-- TODO: Add write policies for authenticated users
-- CREATE POLICY "Allow authenticated write" ON comps FOR INSERT 
--   USING (auth.role() = 'authenticated');
```

### 5. Deploy to Vercel

**Option A: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# From project root
cd frontend
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: tft-professor
# - In which directory is your code? ./
# - Override settings? No

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy
vercel --prod
```

**Option B: Vercel GitHub Integration**

1. Go to [vercel.com](https://vercel.com), sign in with GitHub
2. **New Project** → Import your repo
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **Environment Variables:**
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
5. **Deploy**

### 6. Verification Checklist (Vercel + Supabase)

- [ ] Vercel deployment succeeds
- [ ] Site loads at `https://your-project.vercel.app`
- [ ] Supabase connection works (check Network tab for API calls)
- [ ] Comps load from Supabase (not JSON)
- [ ] Authentication works (if enabled)
- [ ] Admin can create/edit comps
- [ ] No CORS errors in console

### 7. Common Mistakes & Fixes (Vercel + Supabase)

**❌ Environment variables not working**
```
Problem: Forgot VITE_ prefix
Fix: All env vars must start with VITE_ to be exposed to client
```

**❌ Supabase CORS errors**
```
Problem: Wrong Supabase URL or not using anon key
Fix: Double-check .env.local values match Supabase dashboard
```

**❌ Authentication redirect fails**
```
Problem: Vercel URL not in Supabase allowed URLs
Fix: Go to Supabase → Authentication → URL Configuration
     Add: https://your-project.vercel.app
```

**❌ RLS blocks all queries**
```
Problem: Row Level Security enabled but no read policies
Fix: Run the policies SQL above (public read access)
```

---

## Option B2: GitHub Pages + Supabase (Client-Side Only)

If you want to use GitHub Pages with Supabase:

### Limitations
- No server-side rendering
- No API routes (all Supabase calls are client-side)
- Environment variables baked into JS bundle at build time
- Anon key exposed in bundle (use RLS to protect data)

### Setup

1. Follow **Goal A** steps 1-4 (GitHub Pages setup)

2. Add env vars to **GitHub Secrets**:
   - Go to repo → **Settings** → **Secrets and variables** → **Actions**
   - Add secrets:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`

3. Update workflow to inject env vars:

```yaml
# In .github/workflows/deploy.yml, add to build step:
- name: Build
  working-directory: ./frontend
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
  run: npm run build
```

4. Configure Supabase allowed URLs:
   - Supabase → **Authentication** → **URL Configuration**
   - Add: `https://username.github.io`

5. Deploy (push to main)

**Trade-offs:**
- ✅ Free hosting
- ✅ Simple setup
- ❌ No SSR (slower initial load)
- ❌ Env vars visible in JS bundle
- ❌ Must use HashRouter (URLs look like `/#/builder`)

---

## Environment Variable Handling

### Development (`.env.local`)

```env
# frontend/.env.local
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Rules:**
- Prefix with `VITE_` to expose to client
- **Never commit** (add to `.gitignore`)
- Safe to expose anon key (use RLS for security)

### Production

**Vercel:**
- Add in dashboard: Settings → Environment Variables
- Or via CLI: `vercel env add VITE_SUPABASE_URL`

**GitHub Pages:**
- Add in repo: Settings → Secrets and variables → Actions
- Reference in workflow: `${{ secrets.VITE_SUPABASE_URL }}`

### Reading Env Vars in Code

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

---

## Deployment Checklist (All Modes)

### Pre-Deployment

- [ ] Code builds locally (`npm run build`)
- [ ] Tests pass (`npm run test`)
- [ ] No TypeScript errors (`npm run build`)
- [ ] Environment variables configured
- [ ] `.env.local` in `.gitignore`
- [ ] Vite `base` configured correctly

### GitHub Pages (Goal A)

- [ ] Workflow file created (`.github/workflows/deploy.yml`)
- [ ] GitHub Pages enabled (Settings → Pages → Source: GitHub Actions)
- [ ] Vite `base` matches repo name
- [ ] Using HashRouter (not BrowserRouter)
- [ ] Pushed to main branch
- [ ] Workflow runs successfully (Actions tab)
- [ ] Site accessible at `https://username.github.io/repo-name/`

### Vercel + Supabase (Goal B)

- [ ] Supabase project created
- [ ] Tables created (run SQL script)
- [ ] RLS enabled with public read policies
- [ ] Environment variables set in Vercel
- [ ] Vercel deployment succeeds
- [ ] Supabase URL in allowed URLs (for auth)
- [ ] Site accessible at `https://project.vercel.app`
- [ ] Data loads from Supabase

---

## Common Deployment Issues

### Issue: 404 on Refresh

**Symptom:** Direct navigation or refresh gives 404

**Cause:** GitHub Pages doesn't support client-side routing

**Fix:**
```typescript
// Use HashRouter instead of BrowserRouter
import { HashRouter } from 'react-router-dom'

<HashRouter>
  <App />
</HashRouter>
```

URLs will use hash: `https://site.com/#/builder`

---

### Issue: Blank White Screen

**Symptom:** Site loads but shows nothing

**Causes:**
1. Wrong `base` in `vite.config.ts`
2. JavaScript errors (check console)
3. Missing trailing slash in `base`

**Fix:**
1. Check console for errors (F12)
2. Verify `base: '/repo-name/'` has trailing slash
3. Check Network tab for failed asset loads

---

### Issue: Images Not Loading

**Symptom:** Broken image icons

**Causes:**
1. CommunityDragon URLs blocked by CORS
2. Wrong CDN slugs in data
3. Network issue

**Fix:**
1. Check Network tab (F12) for failed requests
2. Verify image URLs in browser
3. Add fallback sprites (already implemented)

---

### Issue: GitHub Actions Fails

**Symptom:** Red X on workflow run

**Fixes:**

**Build fails:**
```bash
# Locally test the build
cd frontend
npm ci
npm run build
```

**Permission denied:**
```yaml
# Add to workflow:
permissions:
  contents: read
  pages: write
  id-token: write
```

**Node version mismatch:**
```yaml
# Match your local Node version:
- uses: actions/setup-node@v4
  with:
    node-version: '20' # Check: node --version
```

---

### Issue: Supabase Connection Failed

**Symptom:** "Failed to fetch" or CORS errors

**Fixes:**

1. **Wrong environment variables:**
   ```bash
   # Verify in Vercel dashboard or GitHub Secrets
   # Must be VITE_SUPABASE_URL (with VITE_ prefix)
   ```

2. **URL not in allowed list:**
   - Supabase → **Authentication** → **URL Configuration**
   - Add your Vercel/GitHub Pages URL

3. **RLS blocking requests:**
   ```sql
   -- Grant public read access
   CREATE POLICY "Allow public read" ON comps 
     FOR SELECT USING (true);
   ```

---

## Performance Optimization

### Enable Gzip/Brotli

**Vercel:** Automatic

**GitHub Pages:** Automatic

### Optimize Bundle Size

```bash
# Analyze bundle
npm run build -- --mode production

# Check dist/ folder size
du -sh dist/
```

**Tips:**
- Code-split routes (already done with lazy loading)
- Tree-shake unused libraries
- Use dynamic imports for large components

### CDN Caching

CommunityDragon sprites are cached by CDN.

**Headers (Vercel only):**

Create `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

---

## Custom Domains

### GitHub Pages

1. Buy domain (Namecheap, Cloudflare, etc.)
2. Add CNAME record:
   - Name: `www` or `@`
   - Value: `username.github.io`
3. GitHub repo → Settings → Pages → Custom domain
4. Enter domain, save

### Vercel

1. Vercel dashboard → Project → Settings → Domains
2. Add domain
3. Update DNS records (Vercel shows instructions)
4. Wait for SSL (automatic)

---

## Monitoring & Analytics

### Built-in Analytics

**Vercel:**
- Dashboard → Analytics (free tier: 100k events/month)
- Real-time visitors, page views, performance

**GitHub Pages:**
- No built-in analytics
- Add Google Analytics or Plausible

### Error Tracking

Add Sentry (optional):

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
})
```

---

## Next Steps After Deployment

1. **Test on multiple devices**
   - Desktop (Chrome, Firefox, Safari)
   - Mobile (iOS Safari, Android Chrome)

2. **Set up monitoring**
   - Vercel Analytics
   - Error tracking (Sentry)

3. **SEO optimization**
   - Add meta tags (Open Graph, Twitter Card)
   - Create sitemap.xml
   - Add robots.txt

4. **Performance audit**
   - Run Lighthouse (Chrome DevTools)
   - Fix recommendations

5. **Set up CI/CD**
   - Run tests in workflow
   - Lint before deploy
   - Type-check before deploy

---

## Quick Reference

### Deploy to GitHub Pages (No DB)

```bash
# 1. Configure Vite
# Edit vite.config.ts: base: '/repo-name/'

# 2. Create workflow
# Copy .github/workflows/deploy.yml

# 3. Enable Pages
# Settings → Pages → Source: GitHub Actions

# 4. Deploy
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### Deploy to Vercel + Supabase

```bash
# 1. Create Supabase project & tables

# 2. Add env vars
# Create frontend/.env.local with Supabase URL/key

# 3. Deploy
npm install -g vercel
cd frontend
vercel
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel --prod
```

---

## Support & Troubleshooting

**Still stuck?**

1. Check workflow logs (GitHub → Actions → click on failed run)
2. Check browser console (F12 → Console)
3. Check Network tab (F12 → Network)
4. Verify environment variables are set correctly
5. Try deploying locally first (`npm run build && npx serve dist`)

**Common commands:**

```bash
# Test build locally
npm run build
npx serve dist -p 3000

# Check for TypeScript errors
npm run build 2>&1 | grep error

# Clear Vercel cache
vercel --prod --force

# Re-run GitHub Actions
# Go to Actions → click workflow → Re-run jobs
```

Good luck with your deployment! 🚀

