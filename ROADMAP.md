# TFT Professor - Development Roadmap

## 🗺️ MVP Build Phases

```
Phase 1: Foundation (Day 1)
└─ Setup Next.js project
└─ Create data files (champions, items, comps JSON)
└─ Test dev server

Phase 2: User Features (Days 2-3)
└─ Home page: Browse comps
└─ Comp detail page: View board + units
└─ Champion/item filter
└─ Calculate match percentage

Phase 3: Admin Features (Day 4)
└─ Admin dashboard
└─ Create/edit comp forms
└─ Interactive board editor
└─ Save to JSON

Phase 4: Deploy (Day 5)
└─ Test on mobile
└─ Deploy to Vercel
└─ Share link with friends
```

---

## 📊 Feature Priority Matrix

### Must Have (MVP)
| Feature | Complexity | Impact | Priority |
|---------|-----------|--------|----------|
| View comp list | Low | High | P0 🔴 |
| View comp details | Medium | High | P0 🔴 |
| Filter by champions | Medium | High | P0 🔴 |
| Admin create comp | High | High | P0 🔴 |
| Board grid display | High | High | P0 🔴 |

### Should Have (Post-MVP)
| Feature | Complexity | Impact | Priority |
|---------|-----------|--------|----------|
| Search comps | Low | Medium | P1 🟡 |
| Sort by tier | Low | Medium | P1 🟡 |
| Bookmark comps | Medium | Medium | P1 🟡 |
| Dark mode | Low | Low | P2 🟢 |

### Could Have (Future)
| Feature | Complexity | Impact | Priority |
|---------|-----------|--------|----------|
| Drag-drop board | High | Medium | P3 🔵 |
| Export as image | Medium | Low | P3 🔵 |
| Riot API integration | Very High | High | P3 🔵 |

---

## 🏗️ Architecture Decision: Option A vs B

### Option A: JSON Files (Recommended for MVP)
```
User Browser
    ↓
Next.js Frontend (React)
    ↓
API Routes (Node.js)
    ↓
public/data/comps.json (File System)
```

**Pros:** Simple, fast to build, no external services
**Cons:** No real auth, file writes may fail on some hosts

---

### Option B: Supabase
```
User Browser
    ↓
Next.js Frontend (React)
    ↓
Supabase Client (JavaScript SDK)
    ↓
Supabase (PostgreSQL + Auth)
```

**Pros:** Production-ready, real auth, scalable
**Cons:** More setup, external dependency

---

## 🎨 UI/UX Inspiration (TFT Academy Style)

### Color Palette (TFT Theme)
```
Primary (Gold): #D4AF37
Secondary (Blue): #0397AB
Dark BG: #0A1428
Card BG: #1C2B3F
Border: #2A3F5F
Success: #10B981
Warning: #F59E0B
```

### Component Style Guide

**Comp Card:**
- Rounded corners (8px)
- Hover effect (scale up slightly)
- Tier badge (S/A/B/C with color)
- Champion portraits in a row

**Board Grid:**
- 7 columns × 4 rows
- Hex outline for each cell
- Champion portraits 48×48px
- Item badges overlay on champion (bottom-right)

**Admin Forms:**
- Clean, minimal design
- Clear labels above inputs
- Visual feedback on save
- Inline validation errors

---

## 🧪 Testing Checklist

### Before Launch
- [ ] Test on Chrome (desktop)
- [ ] Test on Chrome (mobile - DevTools)
- [ ] Test on Firefox
- [ ] Test on Safari (if you have Mac)
- [ ] Create 3+ comps in admin
- [ ] Filter comps by selecting random champions
- [ ] Verify all images load (CommunityDragon)
- [ ] Check responsive layout (mobile, tablet, desktop)
- [ ] Test admin forms (create, edit, delete comp)

### Edge Cases
- [ ] Empty state (no comps match filter)
- [ ] Comp with 0 items on a unit
- [ ] Comp with all 8 required units
- [ ] Very long comp description (text overflow)
- [ ] Champion with no CommunityDragon sprite (fallback image)

---

## 📈 Post-MVP Enhancements (Ordered by Value)

### Iteration 1 (Week 2)
1. **Search bar** - Filter comps by name/description
2. **Sort dropdown** - By tier, patch, date added
3. **Mobile nav** - Hamburger menu for mobile

### Iteration 2 (Week 3)
4. **Favorite comps** - Save to localStorage
5. **Copy comp link** - Share specific comp URL
6. **Loading skeletons** - Better UX while loading

### Iteration 3 (Week 4)
7. **Dark mode toggle** - Save preference
8. **Export comp as image** - PNG download
9. **Tags filter** - Click tag to filter by that tag

### Iteration 4 (Month 2)
10. **Multi-set support** - Add Set 17 when released
11. **Comp stats** - Win rate, play rate (if you have data)
12. **User accounts** - Save favorite comps per user (requires Option B)

---

## 🔐 Security Considerations

### Option A (JSON)
- ⚠️ Admin area has NO authentication
- ⚠️ Anyone with `/admin` URL can edit comps
- ✅ OK for personal use or trusted friends
- ❌ NOT OK for public deployment

**Mitigation (Quick Fix):**
Add a simple password in `.env.local`:
```
ADMIN_PASSWORD=your_secret_password
```
Check password in admin page before rendering.

### Option B (Supabase)
- ✅ Real authentication (email/password)
- ✅ Row-level security (RLS) protects data
- ✅ Production-ready
- ⚠️ Must configure RLS policies correctly

---

## 🚢 Deployment Checklist

### Pre-Deploy (Local)
- [ ] Run `npm run build` - Check for errors
- [ ] Test production build locally: `npm run build && npm start`
- [ ] Commit all code to Git
- [ ] Create `.env.local.example` (without real values)

### Vercel Deploy
- [ ] Install Vercel CLI: `npm install -g vercel`
- [ ] Run `vercel` in project root
- [ ] Link to GitHub repo (for auto-deploys)
- [ ] Add environment variables in Vercel dashboard (if any)
- [ ] Test production URL
- [ ] Set custom domain (optional)

### Post-Deploy
- [ ] Test on real mobile device
- [ ] Share with 2-3 friends for feedback
- [ ] Monitor Vercel logs for errors
- [ ] Set up Vercel analytics (free, shows page views)

---

## 🐛 Known Issues & Workarounds

### Issue 1: File Writes on Vercel (Option A)
**Problem:** Vercel has read-only filesystem - admin can't save comps
**Workaround:** 
- Use admin locally only
- Manually commit updated `comps.json` to Git
- Redeploy to Vercel (auto-deploy from GitHub)

**Permanent Fix:** Migrate to Option B (Supabase) or use Vercel KV storage

---

### Issue 2: CommunityDragon Image 404s
**Problem:** Some champion keys are incorrect or changed
**Workaround:**
- Open image URL in browser to test
- If 404, try different key variants:
  - `tft13_aatrox` vs `tft_aatrox` vs `aatrox`
- Use placeholder image as fallback

**Permanent Fix:** Maintain a tested mapping JSON

---

### Issue 3: Hex Grid Alignment
**Problem:** Hex grid doesn't look right on mobile
**Workaround:**
- Use CSS `grid-template-columns: repeat(7, minmax(40px, 1fr))`
- Offset even rows by 50% column width
- Test in Chrome DevTools responsive mode

**Permanent Fix:** Use a library like `react-hexgrid` (post-MVP)

---

## 📚 Key Files You'll Edit Most

### For Content
- `public/data/comps.json` - Add your comps here (or via admin)
- `public/data/champions.json` - One-time setup (I'll generate this)
- `public/data/items.json` - One-time setup (I'll generate this)

### For Code
- `app/page.tsx` - Home page (comp browser)
- `app/comps/[id]/page.tsx` - Comp detail page
- `app/admin/comps/new/page.tsx` - Create comp form
- `components/BoardGrid.tsx` - Board display logic
- `lib/types.ts` - TypeScript types (Comp, Champion, etc.)

### For Styling
- `app/globals.css` - Global styles (colors, fonts)
- Each component file - Tailwind classes inline

---

## 🎓 What You'll Learn Building This

### Day 1
- How to create a Next.js project
- How to structure files and folders
- How to read JSON data in React

### Day 2-3
- How to create pages and routes
- How to pass data between components
- How to style with Tailwind CSS
- How to filter/search data

### Day 4
- How to create forms in React
- How to handle user input
- How to save data (JSON or database)
- How to build an admin panel

### Day 5
- How to deploy a web app
- How to test on mobile
- How to use Git and version control

**Bonus:** You'll have a portfolio project to show employers!

---

## 🎯 Definition of Done

### MVP is complete when:
1. ✅ Home page shows at least 5 comps
2. ✅ Clicking a comp shows its detail page with board
3. ✅ Selecting champions filters the comp list
4. ✅ Admin can create a new comp from scratch
5. ✅ New comp appears immediately on home page
6. ✅ All images load (or show placeholder)
7. ✅ Works on mobile (tested in DevTools)
8. ✅ Deployed to Vercel with shareable URL

---

## 📞 Support & Help

**Stuck on a step?** Tell me:
1. What you're trying to do
2. What error you're seeing (paste full error)
3. What file you're editing

**Want to add a feature?** Ask:
"How do I add [feature]?"

**Not sure what to do next?** Ask:
"What should I build next?"

I'll guide you through every step! 🚀

