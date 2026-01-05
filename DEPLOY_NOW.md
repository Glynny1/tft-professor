# 🚀 Deploy Right Now - 5 Minute Guide

Choose your path below and follow the exact steps.

---

## Option 1: GitHub Pages (Fastest, No Database)

**Best for:** MVP testing, no backend needed, completely free

### Step 1: Test Build First (Before Configuring)

```bash
cd frontend
npm run build
npx serve dist -p 3000
```

Visit http://localhost:3000 - does it work? ✅

**If yes, continue to Step 2!**

### Step 2: Configure for GitHub Pages

**Edit `vite.config.ts`:**
```typescript
// Line 10: Uncomment this and change to YOUR repo name
base: '/tft-professor/',

// Line 13: Comment out this line
// base: '/',
```

**Edit `src/main.tsx`:**
```typescript
// Line 3: Change from:
import { BrowserRouter } from 'react-router-dom'
// To:
import { HashRouter as BrowserRouter } from 'react-router-dom'
```

### Step 3: Rebuild for GitHub Pages

```bash
npm run build
```

### Step 4: Enable GitHub Pages

1. Go to your GitHub repo
2. **Settings** → **Pages**
3. **Source:** Select **GitHub Actions**
4. Click **Save**

### Step 5: Push & Deploy

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### Step 6: Wait & Visit

1. Go to **Actions** tab in GitHub
2. Wait for green checkmark (1-2 minutes)
3. Visit `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

**Done!** 🎉

---

### ⚠️ Troubleshooting: 404 Errors When Testing Locally

If you see 404 errors when running `npx serve dist -p 3000`:

**Fix:** Make sure `base: '/'` in `vite.config.ts` (NOT `/tft-professor/`)
- Use `base: '/'` for **local testing**
- Use `base: '/repo-name/'` only when **deploying to GitHub Pages**
- Rebuild after changing: `npm run build`

---

## Option 2: Vercel + Supabase (Recommended for Production)

**Best for:** Full features, database, auth, better performance

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **New Project**
3. Name it `tft-professor`
4. Choose a strong password
5. Wait for database to be ready (1-2 minutes)

### Step 2: Create Tables

1. In Supabase, click **SQL Editor**
2. Copy this SQL and run it:

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

-- Comp units
CREATE TABLE comp_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comp_id UUID REFERENCES comps(id) ON DELETE CASCADE,
  champion_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('carry', 'tank', 'support', 'flex')),
  recommended_items TEXT[] DEFAULT '{}',
  optional_items TEXT[] DEFAULT '{}'
);

-- Comp positioning
CREATE TABLE comp_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comp_id UUID REFERENCES comps(id) ON DELETE CASCADE,
  champion_id TEXT NOT NULL,
  x INT NOT NULL CHECK (x BETWEEN 0 AND 6),
  y INT NOT NULL CHECK (y BETWEEN 0 AND 3),
  UNIQUE(comp_id, x, y)
);

-- Enable public read access
ALTER TABLE champions ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE comps ENABLE ROW LEVEL SECURITY;
ALTER TABLE comp_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE comp_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON champions FOR SELECT USING (true);
CREATE POLICY "Public read" ON items FOR SELECT USING (true);
CREATE POLICY "Public read" ON comps FOR SELECT USING (true);
CREATE POLICY "Public read" ON comp_units FOR SELECT USING (true);
CREATE POLICY "Public read" ON comp_positions FOR SELECT USING (true);
```

3. Click **Run**

### Step 3: Get Supabase Credentials

1. In Supabase, go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like `https://abc123.supabase.co`)
   - **anon public** key (the long string under "Project API keys")

### Step 4: Local Setup

```bash
cd frontend

# Create .env.local file
cat > .env.local << 'EOF'
VITE_SUPABASE_URL=PASTE_YOUR_URL_HERE
VITE_SUPABASE_ANON_KEY=PASTE_YOUR_KEY_HERE
EOF

# Test locally
npm run dev
```

### Step 5: Deploy to Vercel

**Option A: Vercel CLI (faster)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Follow prompts (accept defaults)

# Add environment variables
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your anon key

# Deploy to production
vercel --prod
```

**Option B: Vercel Web UI (easier)**

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **Add New Project**
4. Import your GitHub repo
5. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Add **Environment Variables:**
   - `VITE_SUPABASE_URL` = your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
7. Click **Deploy**

### Step 6: Configure Supabase Redirect

1. In Supabase, go to **Authentication** → **URL Configuration**
2. Add **Site URL:** `https://your-project.vercel.app`
3. Add **Redirect URLs:** `https://your-project.vercel.app/**`
4. Save

### Step 7: Visit Your Site

Visit `https://your-project.vercel.app`

**Done!** 🎉

---

## ✅ Verify It Works

### Check These:

- [ ] Home page loads
- [ ] Can navigate to Builder
- [ ] Can select champions/items
- [ ] Results page shows comps
- [ ] Can click into comp detail
- [ ] Board grid displays correctly
- [ ] Images load (champion/item sprites)
- [ ] No red errors in console (F12)

### Test on Mobile:

- [ ] Open on your phone
- [ ] Navigation works
- [ ] Selections work
- [ ] Board is scrollable/readable

---

## 🐛 Something Broken?

### GitHub Pages: Blank page

**Fix:**
```typescript
// frontend/src/main.tsx
import { HashRouter as BrowserRouter } from 'react-router-dom'
```

### GitHub Pages: Images broken

**Fix:**
```typescript
// frontend/vite.config.ts
base: '/your-repo-name/', // Must match GitHub repo name exactly
```

### Vercel: Environment variables not working

**Fix:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Make sure they start with `VITE_`
3. Redeploy: Deployments → three dots → Redeploy

### Supabase: Connection failed

**Fix:**
1. Check Supabase URL ends with `.supabase.co`
2. Check anon key is correct (copy again from dashboard)
3. Run the SQL script again (maybe tables weren't created)
4. Check Vercel environment variables are set

### Build fails

**Fix:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 🆘 Still Stuck?

### Check Logs

**GitHub Pages:**
- Go to repo → **Actions** → click the workflow → expand steps
- Look for red text

**Vercel:**
- Dashboard → click deployment → **Logs** tab
- Look for errors

### Check Console

1. Open your deployed site
2. Press **F12**
3. Go to **Console** tab
4. Look for red errors
5. Go to **Network** tab
6. Reload page
7. Look for failed requests (red text)

### Common Fixes

```bash
# Test build locally first
cd frontend
npm run build
npx serve dist -p 3000

# If local build works but deploy fails:
# - Check environment variables
# - Check vite.config.ts base path
# - Check you're using HashRouter (GitHub Pages)

# If Supabase isn't connecting:
# - Verify env vars start with VITE_
# - Check Supabase project isn't paused
# - Check you ran the SQL script
```

---

## 🎉 Success?

### Next Steps:

1. **Add your real data** (replace sample comps)
2. **Customize colors** (edit `tailwind.config.js`)
3. **Add your logo** (edit `Layout.tsx`)
4. **Set up analytics** (Vercel Analytics or Google Analytics)
5. **Share with friends!**

### Make Changes:

**GitHub Pages:**
```bash
# Make changes
git add .
git commit -m "Update X"
git push origin main
# Wait 1-2 min, refresh browser
```

**Vercel:**
```bash
# Make changes
git push origin main
# Vercel auto-deploys in ~1 min
```

---

## 📊 Performance Tips

After deploying, run **Lighthouse** audit:

1. Open site in Chrome
2. Press **F12**
3. Go to **Lighthouse** tab
4. Click **Analyze page load**
5. Aim for scores > 90

---

**You're live!** 🚀 Now share your URL and get feedback from players!

