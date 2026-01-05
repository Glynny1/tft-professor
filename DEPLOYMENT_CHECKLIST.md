# Deployment Checklist

Quick reference for deploying TFT Professor.

---

## 📦 Goal A: GitHub Pages (No Database)

### Pre-Deployment

```bash
cd frontend

# 1. Test build locally
npm run build
npx serve dist -p 3000
# Visit http://localhost:3000 and test

# 2. Update vite.config.ts
# Uncomment and set: base: '/tft-professor/'
# (Replace 'tft-professor' with your repo name)

# 3. Switch to HashRouter (for client-side routing)
# Edit src/main.tsx:
# import { HashRouter } from 'react-router-dom'
# <HashRouter>...</HashRouter>
```

### GitHub Setup

- [ ] GitHub Actions workflow exists (`.github/workflows/deploy.yml`)
- [ ] Go to repo → **Settings** → **Pages**
- [ ] Source: **GitHub Actions**
- [ ] Save

### Deploy

```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### Verify

- [ ] GitHub Actions runs successfully (Actions tab → green ✓)
- [ ] Visit `https://username.github.io/repo-name/`
- [ ] All pages load (Home, Builder, Results, Admin)
- [ ] Images load (champion/item sprites)
- [ ] No console errors (F12)
- [ ] Data loads (see comps in /results)

**Common URLs format:**
- Home: `https://username.github.io/repo-name/#/`
- Builder: `https://username.github.io/repo-name/#/builder`
- Results: `https://username.github.io/repo-name/#/results`

---

## 🚀 Goal B: Vercel + Supabase

### Supabase Setup

- [ ] Create Supabase project at [supabase.com](https://supabase.com)
- [ ] Run SQL script (see DEPLOYMENT_GUIDE.md → Supabase tables)
- [ ] Copy Project URL
- [ ] Copy anon public key
- [ ] Add allowed URL: `https://your-project.vercel.app`
  (Supabase → Authentication → URL Configuration)

### Local Setup

```bash
cd frontend

# 1. Create .env.local
cat > .env.local << EOF
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
EOF

# 2. Test locally
npm run dev
# Verify Supabase connection works

# 3. Test build
npm run build
npx serve dist -p 3000
```

### Vercel Deployment (Option A: CLI)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel

# Follow prompts:
# - Project name: tft-professor
# - Directory: ./
# - Override settings? No

# Add environment variables
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your anon key

# Deploy to production
vercel --prod
```

### Vercel Deployment (Option B: GitHub Integration)

- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign in with GitHub
- [ ] **New Project** → Import your repo
- [ ] **Root Directory:** `frontend`
- [ ] **Framework Preset:** Vite
- [ ] **Build Command:** `npm run build`
- [ ] **Output Directory:** `dist`
- [ ] **Environment Variables:**
  - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
  - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
- [ ] Click **Deploy**

### Verify

- [ ] Deployment succeeds
- [ ] Visit `https://your-project.vercel.app`
- [ ] All pages load
- [ ] Supabase connection works (check Network tab)
- [ ] Can fetch comps from database
- [ ] Authentication works (if enabled)
- [ ] Admin can create/edit comps
- [ ] No CORS errors

---

## 🐛 Troubleshooting

### Blank page / 404

**GitHub Pages:**
```typescript
// Use HashRouter in src/main.tsx
import { HashRouter } from 'react-router-dom'
```

**Vercel:**
- Check vite.config.ts: `base: '/'` (not `/repo-name/`)
- Check console for errors

### Images not loading

- Check Network tab (F12) for failed requests
- Verify CommunityDragon URLs work in browser
- Check fallback sprite is showing

### Build fails

```bash
# Clear cache
rm -rf node_modules package-lock.json
npm install

# Test build
npm run build

# Check for TypeScript errors
npm run build 2>&1 | grep error
```

### Supabase connection fails

- [ ] Environment variables set correctly (with `VITE_` prefix)
- [ ] Supabase URL ends with `.supabase.co`
- [ ] Anon key is correct (check Supabase dashboard)
- [ ] Vercel URL added to Supabase allowed URLs
- [ ] RLS policies created (see SQL script)

### Workflow permission denied

```yaml
# Add to .github/workflows/deploy.yml:
permissions:
  contents: read
  pages: write
  id-token: write
```

---

## 🔍 Quick Tests

### Test Locally

```bash
cd frontend

# Development mode
npm run dev

# Production build
npm run build
npx serve dist -p 3000

# Run tests
npm run test

# Type check
npm run build
```

### Test Deployed Site

1. **Home page loads** → Visit root URL
2. **Navigation works** → Click all nav links
3. **Builder functions** → Select champions/items
4. **Results show** → View recommended comps
5. **Comp detail loads** → Click a comp
6. **Images load** → Check champion/item sprites
7. **No console errors** → F12 → Console (should be clean)
8. **Mobile works** → Test on phone or Chrome DevTools

---

## 📊 Performance Check

### After Deploy

```bash
# Check bundle size
cd frontend/dist
du -sh .
# Should be < 2MB

# Check main JS bundle
ls -lh assets/*.js
# Should be < 500KB gzipped
```

### Lighthouse Audit

1. Open site in Chrome
2. F12 → Lighthouse tab
3. Generate report
4. Aim for:
   - Performance: > 90
   - Accessibility: > 90
   - Best Practices: > 90
   - SEO: > 80

---

## ✅ Success Criteria

Your deployment is successful when:

- [ ] Site loads without errors
- [ ] All routes accessible (Home, Builder, Results, Admin)
- [ ] Images load correctly
- [ ] Data displays (champions, items, comps)
- [ ] Selection persists (localStorage)
- [ ] Share links work (URL encoding)
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Lighthouse score > 80
- [ ] Works on Chrome, Firefox, Safari
- [ ] Works on mobile (iOS/Android)

---

## 🎉 Post-Deployment

### Monitor

**Vercel:**
- Dashboard → Analytics
- Check visitor count, page views

**GitHub Pages:**
- Add Google Analytics or Plausible

### Update

**Vercel:**
- Push to main → auto-deploys

**GitHub Pages:**
- Push to main → workflow runs automatically

### Rollback

**Vercel:**
- Dashboard → Deployments → Previous deployment → Promote to Production

**GitHub Pages:**
- Git revert → push to main

---

## 📝 Environment Variables Reference

### Development (`.env.local`)

```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### Production

**Vercel:**
```bash
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
```

**GitHub Pages:**
- Settings → Secrets → Actions
- Add: `VITE_SUPABASE_URL`
- Add: `VITE_SUPABASE_ANON_KEY`

---

## 🆘 Need Help?

1. Check `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Check workflow logs (GitHub → Actions → click run)
3. Check browser console (F12 → Console)
4. Check Network tab (F12 → Network → see failed requests)
5. Verify environment variables are set

**Common commands:**

```bash
# View Vercel logs
vercel logs

# Re-run GitHub Actions
# GitHub → Actions → Re-run jobs

# Test production build locally
npm run build && npx serve dist

# Clear Vercel cache
vercel --prod --force
```

---

**Ready to deploy?** Start with Goal A (GitHub Pages) for the simplest setup, then upgrade to Goal B (Vercel + Supabase) when you need a database! 🚀

