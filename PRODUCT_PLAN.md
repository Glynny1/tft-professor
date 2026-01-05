# TFT Professor - Product Plan

## 1. FEATURE LIST (MVP)

### User Stories & Acceptance Criteria

#### Epic 1: Browse & Filter Comps
**US-1.1: View Available Team Comps**
- **As a** player
- **I want to** see a list of recommended team comps for Set 16
- **So that** I can learn viable strategies

**Acceptance Criteria:**
- [ ] Display list of all comps with name, thumbnail, and tags
- [ ] Show comp difficulty/tier (e.g., S, A, B tier)
- [ ] Each comp card is clickable to view details
- [ ] Mobile-responsive grid layout

**US-1.2: Filter Comps by Champions/Items I Have**
- **As a** player
- **I want to** select the champions and items I currently have in my game
- **So that** the app recommends comps I can actually build

**Acceptance Criteria:**
- [ ] Multi-select champion picker (all Set 16 champions visible)
- [ ] Multi-select item picker (all TFT items visible)
- [ ] Display champion/item sprites from CommunityDragon
- [ ] Filter comps in real-time based on selection
- [ ] Show "match %" (how many required units/items I have)
- [ ] Clear filters button

---

#### Epic 2: View Comp Details
**US-2.1: See Comp Board Positioning**
- **As a** player
- **I want to** see where each unit should be placed on the board
- **So that** I can position my team correctly

**Acceptance Criteria:**
- [ ] Display a 7×4 hex grid representing TFT board
- [ ] Show champion sprites in their designated positions
- [ ] Highlight core units vs. optional units (visual distinction)
- [ ] Show items equipped on each unit (icon overlay)

**US-2.2: View Comp Metadata**
- **As a** player
- **I want to** see comp name, description, and required units
- **So that** I understand how to play the comp

**Acceptance Criteria:**
- [ ] Display comp name, description, patch, set number
- [ ] List all required champions (with cost, traits)
- [ ] List all optional/flex champions
- [ ] Show recommended items per champion
- [ ] Display tags (e.g., "Early Game", "Reroll", "Fast 8")

---

#### Epic 3: Admin Area (Comp Management)
**US-3.1: Admin Login**
- **As an** admin
- **I want to** log in securely
- **So that** only I can edit comps

**Acceptance Criteria (Option B only):**
- [ ] Simple email/password login page
- [ ] Protected admin routes (redirect if not logged in)
- [ ] Logout button

**For Option A (no auth):**
- [ ] Admin area accessible via `/admin` route (no login)

**US-3.2: Create/Edit Team Comps**
- **As an** admin
- **I want to** add or edit team compositions
- **So that** I can keep the app updated with meta changes

**Acceptance Criteria:**
- [ ] Form to create new comp with fields:
  - Name (text)
  - Description (textarea)
  - Tags (multi-select or comma-separated)
  - Set number (dropdown: Set 16, Set 17, etc.)
  - Patch string (e.g., "14.24")
  - Tier (S, A, B, C)
- [ ] Add required champions (multi-select)
- [ ] Add optional champions (multi-select)
- [ ] For each champion, specify:
  - Position on board (click on grid to place)
  - Recommended items (up to 3 per unit)
  - Core vs. optional flag
- [ ] Save button persists to JSON (Option A) or Supabase (Option B)
- [ ] Edit existing comps (load data into form)
- [ ] Delete comp (with confirmation)

**US-3.3: Interactive Board Editor**
- **As an** admin
- **I want to** click on a board grid to place champions
- **So that** I can easily set positioning

**Acceptance Criteria:**
- [ ] 7×4 clickable hex grid in admin form
- [ ] Click empty cell → opens champion picker
- [ ] Click occupied cell → edit/remove champion
- [ ] Drag-and-drop (stretch goal for post-MVP)

---

#### Epic 4: Set Management (Future-Proofing)
**US-4.1: Filter by Set**
- **As a** player
- **I want to** switch between Set 16, Set 17, etc.
- **So that** I see comps for the current TFT set

**Acceptance Criteria:**
- [ ] Set selector dropdown (defaults to latest set)
- [ ] Filter all comps and champions by selected set
- [ ] Set metadata stored per comp (set number field)

---

## 2. RECOMMENDED TECH STACK

### Core Stack (Same for Both Options)
- **Framework**: Next.js 14+ (React) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: npm
- **Deployment**: Vercel (free tier, zero-config for Next.js)

### Why This Stack for Beginners?
- Next.js handles routing, API routes, and deployment automatically
- Tailwind = no CSS files to manage, just utility classes
- TypeScript catches errors as you type (Cursor helps write types)
- Huge community = easy to find help

---

### OPTION A: No Database (Local JSON)

**Data Storage:**
- `public/data/comps.json` - all team comps
- `public/data/champions.json` - champion metadata (name, cost, traits)
- `public/data/items.json` - item metadata

**Admin Edits:**
- Admin form writes to JSON files via Next.js API routes
- No authentication (admin accessible at `/admin` without login)

**Pros:**
- ✅ Zero setup, no external services
- ✅ Perfect for MVP and learning
- ✅ No monthly costs
- ✅ Easy to backup (just commit JSON files to Git)

**Cons:**
- ❌ No real security (anyone can access `/admin`)
- ❌ Not suitable for production if multiple people use it
- ❌ File writes can fail on some hosting platforms

**Best For:** Personal use, portfolio project, testing MVP

---

### OPTION B: Supabase (Database + Auth)

**Data Storage:**
- Supabase PostgreSQL database
- Tables: `comps`, `champions`, `items`, `comp_units`, `comp_items`
- Supabase handles API automatically (no backend code needed)

**Authentication:**
- Supabase Auth (email/password)
- Built-in session management
- Row-level security (RLS) to protect admin routes

**Static Assets:**
- Champion/item metadata still in JSON (rarely changes)
- OR pull from Supabase too (more flexible)

**Pros:**
- ✅ Real authentication (secure admin area)
- ✅ Production-ready
- ✅ Free tier generous (up to 500MB database)
- ✅ Auto-generates API (no backend code)
- ✅ Good for multiple admins/future growth

**Cons:**
- ❌ Requires learning Supabase concepts (tables, RLS, auth)
- ❌ External dependency (if Supabase is down, admin broken)
- ❌ Slightly more setup time (~30 min)

**Best For:** If you want to deploy publicly and protect admin area

---

### CommunityDragon Asset URLs

Both options use the same approach:
- Champion sprites: `https://raw.communitydragon.org/latest/game/assets/characters/{championKey}/hud/{championKey}_square.png`
- Item sprites: `https://raw.communitydragon.org/latest/game/assets/maps/particles/tft/item_icons/{itemKey}.png`

Example: `https://raw.communitydragon.org/latest/game/assets/characters/tft9_kaisa/hud/tft9_kaisa_square.png`

**Important:** You'll need a JSON mapping of champion/item names → CommunityDragon keys.

---

## 3. EXACT BUILD SEQUENCE

I'll provide steps for **Option A** (simpler). Option B steps provided after if you want that route.

### OPTION A: Step-by-Step Build

#### Phase 1: Setup Project (10 min)

**Step 1.1:** Open PowerShell in your project folder and run:
```bash
npx create-next-app@latest tft-professor
```

When prompted:
- TypeScript? → **Yes**
- ESLint? → **Yes**
- Tailwind CSS? → **Yes**
- `src/` directory? → **No**
- App Router? → **Yes**
- Customize default import alias? → **No**

**Step 1.2:** Navigate into project:
```bash
cd tft-professor
```

**Step 1.3:** Install additional dependencies:
```bash
npm install lucide-react
```
(lucide-react = icon library)

**Step 1.4:** Start dev server:
```bash
npm run dev
```

Open browser to `http://localhost:3000` - you should see Next.js welcome page.

---

#### Phase 2: Setup Data Files (15 min)

**Step 2.1:** Create `public/data` folder structure in your project root.

**Step 2.2:** Create `public/data/champions.json`:
```json
{
  "set16": [
    {
      "id": "aatrox",
      "name": "Aatrox",
      "cost": 1,
      "traits": ["Conqueror", "Bruiser"],
      "cdnKey": "tft13_aatrox"
    }
  ]
}
```
(You'll add all Set 16 champions here - I'll help generate this list later)

**Step 2.3:** Create `public/data/items.json`:
```json
{
  "basic": [
    { "id": "bf_sword", "name": "B.F. Sword", "cdnKey": "bf_sword" },
    { "id": "recurve_bow", "name": "Recurve Bow", "cdnKey": "recurve_bow" }
  ],
  "combined": [
    { "id": "infinity_edge", "name": "Infinity Edge", "components": ["bf_sword", "bf_sword"], "cdnKey": "infinity_edge" }
  ]
}
```

**Step 2.4:** Create `public/data/comps.json`:
```json
{
  "comps": [
    {
      "id": "1",
      "name": "Reroll Kog'Maw",
      "description": "Hyperroll for 3★ Kog'Maw and Twitch. Vertical Sniper comp.",
      "set": "set16",
      "patch": "14.24",
      "tier": "S",
      "tags": ["Reroll", "Snipers"],
      "units": [
        {
          "championId": "kogmaw",
          "position": { "row": 2, "col": 3 },
          "isCore": true,
          "items": ["infinity_edge", "last_whisper", "giant_slayer"]
        }
      ]
    }
  ]
}
```

---

#### Phase 3: Build Main UI (Comp Browser) (2 hours)

**Step 3.1:** Create `app/page.tsx` (home page):
- Fetch comps from `/data/comps.json`
- Display comp cards in a grid
- Each card shows: name, tier, tags

**Step 3.2:** Create `app/comps/[id]/page.tsx` (comp detail page):
- Show comp name, description, patch
- Render 7×4 board grid
- Display champions in their positions with items

**Step 3.3:** Create `components/BoardGrid.tsx`:
- Render hex grid with CSS (7 columns × 4 rows)
- Accept units array as prop
- Display champion sprites at specified positions

**Step 3.4:** Create `components/ChampionPicker.tsx`:
- Multi-select component for champions
- Show sprites from CommunityDragon URLs
- Pass selected champions to parent

**Step 3.5:** Add filtering logic to home page:
- Filter comps based on selected champions
- Calculate match % (e.g., "You have 6/8 units")

---

#### Phase 4: Build Admin Area (2-3 hours)

**Step 4.1:** Create `app/admin/page.tsx`:
- List all comps with "Edit" and "Delete" buttons
- "Create New Comp" button

**Step 4.2:** Create `app/admin/comps/new/page.tsx`:
- Form with fields: name, description, set, patch, tier, tags
- Champion selector (required & optional)
- Interactive board grid (click to place champions)
- Item picker per champion
- Submit button

**Step 4.3:** Create API route `app/api/comps/route.ts`:
- `POST /api/comps` → reads `comps.json`, adds new comp, writes back
- `PUT /api/comps/[id]` → updates existing comp
- `DELETE /api/comps/[id]` → removes comp

**Step 4.4:** Create `app/admin/comps/[id]/edit/page.tsx`:
- Same form as new, but pre-filled with existing data

---

#### Phase 5: Polish & Deploy (1 hour)

**Step 5.1:** Add loading states and error handling

**Step 5.2:** Test on mobile (Chrome DevTools responsive mode)

**Step 5.3:** Deploy to Vercel:
```bash
npm install -g vercel
vercel
```
(Follow prompts, link to GitHub for auto-deployments)

**Step 5.4:** Commit code to Git:
```bash
git init
git add .
git commit -m "Initial MVP"
```

---

### OPTION B: Step-by-Step Build (Supabase)

If you choose Option B, the sequence is:

**Phase 1:** Same as Option A (setup Next.js)

**Phase 2 (Different):** Setup Supabase
- Go to supabase.com, create free account
- Create new project
- Run SQL to create tables:
  ```sql
  CREATE TABLE comps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    set TEXT,
    patch TEXT,
    tier TEXT,
    tags TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
  );
  
  CREATE TABLE comp_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comp_id UUID REFERENCES comps(id) ON DELETE CASCADE,
    champion_id TEXT,
    position_row INT,
    position_col INT,
    is_core BOOLEAN,
    items TEXT[]
  );
  ```
- Install Supabase client: `npm install @supabase/supabase-js @supabase/auth-helpers-nextjs`
- Create `.env.local` with Supabase URL and anon key

**Phase 3 & 4 (Modified):**
- Replace JSON file reads with Supabase queries
- Use Supabase Auth for admin login
- API routes use Supabase client instead of fs.readFile/writeFile

**Phase 5:** Deploy (same as Option A, but add env vars to Vercel)

---

## 4. RISKS & PITFALLS

### Risk 1: CommunityDragon Image URLs
**Problem:** Champion keys change between sets (e.g., `tft9_kaisa` vs `tft13_kaisa`)
**Mitigation:**
- Maintain a manual mapping JSON for Set 16 champion keys
- Test each image URL before launch
- Fallback to placeholder image if 404

**Example Pitfall:** Morgana might be `tft9_morgana` or `tft_morgana` - you need to verify each one.

---

### Risk 2: CORS Issues
**Problem:** CommunityDragon is generally CORS-friendly, but can change
**Mitigation:**
- Use Next.js Image component (`next/image`) which proxies images through your domain
- Or: Download sprites to `public/images/` folder (more reliable but requires updates)

---

### Risk 3: Admin File Writes (Option A Only)
**Problem:** Vercel and some hosts have read-only file systems - writing to JSON fails
**Mitigation:**
- For MVP, test admin locally only
- For production, use Option B (Supabase) OR use Vercel KV storage (key-value store)

**Workaround:** During development, admin works fine. For deployment, manually update JSON files and commit to Git.

---

### Risk 4: Board Grid Layout
**Problem:** TFT uses hexagonal grid - HTML/CSS grids are rectangular
**Mitigation:**
- Use offset columns (even rows shift right by 0.5 cell width)
- Many CSS hex grid tutorials available
- Alternative: Use absolute positioning with pre-calculated x/y coordinates

**Example:** Row 0: cols 0-6, Row 1: cols 0.5-6.5 (visual offset)

---

### Risk 5: Mobile Performance
**Problem:** Loading 50+ champion sprites can be slow
**Mitigation:**
- Lazy load images (next/image does this automatically)
- Use `loading="lazy"` attribute
- Consider pagination (show 10 comps per page)

---

### Risk 6: Set Updates
**Problem:** When Set 17 launches, all champion IDs change
**Mitigation:**
- Store `set` field on every comp and champion
- Filter by set in all queries
- Admin can duplicate comps and change set number for new sets
- Champions JSON structured by set:
  ```json
  {
    "set16": [...],
    "set17": [...]
  }
  ```

---

### Risk 7: Authentication (Option B)
**Problem:** Supabase auth can be confusing for beginners
**Mitigation:**
- Use Supabase Auth UI components (pre-built login form)
- Follow official Next.js + Supabase starter template
- Don't build custom auth from scratch

---

### Risk 8: Deployment Environment Variables
**Problem:** Forgetting to set `.env.local` variables in Vercel breaks production
**Checklist:**
- Add all env vars to Vercel dashboard → Settings → Environment Variables
- Redeploy after adding vars
- Test production URL before sharing

---

## 5. FOLDER STRUCTURE

### Option A (JSON Storage)

```
tft-professor/
├── app/
│   ├── layout.tsx              # Root layout (global nav, fonts)
│   ├── page.tsx                # Home page (comp browser)
│   ├── globals.css             # Global styles
│   ├── comps/
│   │   └── [id]/
│   │       └── page.tsx        # Comp detail page
│   ├── admin/
│   │   ├── page.tsx            # Admin dashboard (list comps)
│   │   └── comps/
│   │       ├── new/
│   │       │   └── page.tsx    # Create comp form
│   │       └── [id]/
│   │           └── edit/
│   │               └── page.tsx # Edit comp form
│   └── api/
│       └── comps/
│           ├── route.ts        # GET, POST /api/comps
│           └── [id]/
│               └── route.ts    # PUT, DELETE /api/comps/:id
├── components/
│   ├── BoardGrid.tsx           # 7×4 hex grid display
│   ├── ChampionPicker.tsx      # Multi-select champion picker
│   ├── ItemPicker.tsx          # Multi-select item picker
│   ├── CompCard.tsx            # Comp card for browser
│   ├── AdminBoardEditor.tsx    # Clickable board for admin
│   └── ui/
│       ├── Button.tsx          # Reusable button component
│       └── Input.tsx           # Reusable input component
├── lib/
│   ├── types.ts                # TypeScript types (Comp, Champion, Item)
│   ├── utils.ts                # Helper functions (match %, image URLs)
│   └── data.ts                 # Functions to read/write JSON files
├── public/
│   ├── data/
│   │   ├── comps.json          # All team comps
│   │   ├── champions.json      # Champion metadata
│   │   └── items.json          # Item metadata
│   └── images/
│       └── placeholder.png     # Fallback image
├── .env.local                  # Environment variables (if needed)
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

---

### Option B (Supabase)

Same structure, but:
- Remove `lib/data.ts` (no JSON file operations)
- Add `lib/supabase.ts` (Supabase client setup)
- Add `middleware.ts` (auth middleware to protect admin routes)
- Add `app/login/page.tsx` (login page)
- Remove most of `public/data/` (only keep champion/item JSON if you want static metadata)

---

## MVP vs. Post-MVP Features

### MVP (Build First)
- ✅ Browse comps
- ✅ Filter by champions/items you have
- ✅ View comp details + board positioning
- ✅ Admin create/edit/delete comps
- ✅ Basic mobile responsive

### Post-MVP (Add Later)
- 🔮 Search comps by name/tag
- 🔮 Sorting (by tier, patch date)
- 🔮 Comp favorites/bookmarks
- 🔮 Export comp as image
- 🔮 Dark mode toggle
- 🔮 Multi-language support
- 🔮 Drag-and-drop board editor
- 🔮 "Copy comp code" (shareable link with selected units)
- 🔮 Integration with Riot API (auto-suggest based on your match history)

---

## Recommendation for Beginners

**Start with Option A** for these reasons:
1. Faster to build MVP (no Supabase learning curve)
2. Everything in one codebase (easier to debug)
3. No external dependencies (works offline)
4. You can migrate to Option B later if needed

**When to switch to Option B:**
- You want to deploy publicly and need secure admin
- Multiple people will manage comps
- You need user accounts (e.g., save favorite comps per user)

---

## Time Estimates

| Phase | Option A | Option B |
|-------|----------|----------|
| Setup | 30 min | 1 hour |
| Data files | 30 min | 1 hour (Supabase tables) |
| Comp browser UI | 3 hours | 3 hours |
| Comp detail page | 2 hours | 2 hours |
| Admin CRUD | 3 hours | 4 hours (auth + forms) |
| Polish & deploy | 1 hour | 1.5 hours |
| **Total** | **~10 hours** | **~12.5 hours** |

Spread across 3-4 days if working 2-3 hours per day.

---

## Next Steps

1. **Choose storage option** (A or B)
2. **I'll generate the full champion/item JSON for Set 16** (saves you hours of data entry)
3. **We'll scaffold the project together** (I'll guide you through each file)
4. **Iterate on styling** (make it look like TFT Academy)

---

## Question for You

**Which data storage option do you want to start with: Option A (local JSON) or Option B (Supabase)?**

I recommend **Option A** for MVP, then we can migrate to B if you want to deploy with authentication.

