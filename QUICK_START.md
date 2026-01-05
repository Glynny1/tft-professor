# TFT Professor - Quick Start Guide

## 🎯 What You're Building

A TFT team comp recommender that:
- Shows you team comps for Set 16
- Filters comps based on champions/items you have
- Displays unit positioning on a board grid
- Has an admin area to add/edit comps

---

## 🚀 60-Second Decision Tree

**Question 1:** Do you need admin authentication (login)?
- **NO** → Choose **Option A** (JSON files)
- **YES** → Choose **Option B** (Supabase)

**Question 2:** Will you deploy this publicly?
- **NO** (personal use) → **Option A** is perfect
- **YES** (public website) → Consider **Option B** for security

**My recommendation:** Start with **Option A**, takes 10 hours vs 12.5 hours.

---

## 📦 Option A: First Commands (Run These)

```bash
# Create project
npx create-next-app@latest tft-professor
# Choose: Yes to TypeScript, Yes to Tailwind, Yes to App Router

# Navigate in
cd tft-professor

# Install icons
npm install lucide-react

# Start dev server
npm run dev
```

Then open `http://localhost:3000` in your browser.

---

## 📂 What We'll Build Together

```
tft-professor/
├── app/                    # Pages
│   ├── page.tsx           # Home (comp browser)
│   ├── comps/[id]/        # Comp details
│   └── admin/             # Admin area
├── components/            # Reusable UI
│   ├── BoardGrid.tsx      # 7×4 hex grid
│   └── ChampionPicker.tsx # Select champions
└── public/data/           # Your data
    ├── comps.json         # Team comps you create
    ├── champions.json     # All Set 16 champs
    └── items.json         # All TFT items
```

---

## 🎨 Tech Stack (No Need to Memorize)

- **Next.js** - Framework (handles pages, routing automatically)
- **TypeScript** - Catches errors as you type
- **Tailwind CSS** - Style with classes like `bg-blue-500 p-4`
- **Vercel** - Free hosting (deploy with one command)

---

## 📅 Build Timeline (Option A)

| Day | Task | Time |
|-----|------|------|
| 1 | Setup + Data files | 1 hour |
| 2 | Build comp browser page | 3 hours |
| 3 | Build comp detail page | 2 hours |
| 4 | Build admin forms | 3 hours |
| 5 | Polish + deploy | 1 hour |

**Total: ~10 hours** (spread across 5 days, 2 hours/day)

---

## ⚠️ Common Beginner Pitfalls

### Pitfall 1: Port Already in Use
**Error:** `Port 3000 is already in use`
**Fix:** Stop the old server (Ctrl+C in terminal) or use a different port:
```bash
npm run dev -- -p 3001
```

### Pitfall 2: Changes Not Showing
**Fix:** Hard refresh browser (Ctrl+Shift+R on Windows, Cmd+Shift+R on Mac)

### Pitfall 3: Module Not Found
**Error:** `Cannot find module 'lucide-react'`
**Fix:** Make sure you ran `npm install` in the project folder

### Pitfall 4: TypeScript Errors
**Fix:** Ask me! Cursor (me) will help fix type errors in real-time.

### Pitfall 5: Image Not Loading
**Fix:** CommunityDragon URLs are picky. Double-check the champion key (e.g., `tft13_aatrox` not `aatrox`)

---

## 🖼️ CommunityDragon Image URLs

**Champion sprite:**
```
https://raw.communitydragon.org/latest/game/assets/characters/{cdnKey}/hud/{cdnKey}_square.png
```

**Example:**
```
https://raw.communitydragon.org/latest/game/assets/characters/tft13_aatrox/hud/tft13_aatrox_square.png
```

**Item sprite:**
```
https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/{itemKey}.png
```

---

## 🛠️ Helpful Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Check for errors
npm run lint

# Deploy to Vercel
npx vercel
```

---

## 📞 When You're Stuck

1. **Read the error message** - Usually tells you what's wrong
2. **Check the terminal** - Next.js shows helpful errors there
3. **Ask me (Cursor)** - Describe what you're trying to do
4. **Check the browser console** - F12 → Console tab

---

## 🎓 Learning Resources (Optional)

- [Next.js Tutorial](https://nextjs.org/learn) - Official, beginner-friendly
- [Tailwind Docs](https://tailwindcss.com/docs) - Search for classes
- [TypeScript Basics](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)

**But:** You don't need to read these! I'll guide you through each step.

---

## 📋 Before We Start Coding

**I'll generate for you:**
1. ✅ Complete champions.json for Set 16 (saves hours)
2. ✅ Complete items.json (saves hours)
3. ✅ Sample comps.json (so you have examples)
4. ✅ Starter components (BoardGrid, ChampionPicker)

**You'll learn:**
- How to create pages (just add files to `app/` folder)
- How to style with Tailwind (copy-paste classes)
- How to edit JSON files (add your own comps)

---

## 🎯 Success Criteria for MVP

You'll know you're done when:
- [ ] You can view a list of comps on the home page
- [ ] Clicking a comp shows its detail page with board grid
- [ ] You can filter comps by selecting champions
- [ ] You can visit `/admin` and create a new comp
- [ ] The new comp appears on the home page
- [ ] It works on mobile (test in Chrome DevTools)
- [ ] Deployed to Vercel (shareable URL)

---

## 🚀 Ready to Start?

**Tell me:** 
1. Which option? (A or B)
2. Want me to generate the Set 16 data files now?
3. Any specific comps you want in the sample data?

Then we'll run the first commands together!

