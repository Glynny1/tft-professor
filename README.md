# TFT Professor

A modern TFT team composition recommender that helps players find the best comps based on their owned champions and items.

![TFT Professor](https://img.shields.io/badge/TFT-Set%2016-gold)
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

### For Players
- **Smart Recommendations** - Get comp suggestions scored by match percentage
- **Visual Board Grid** - See unit positioning on a 7×4 TFT board
- **Champion & Item Selection** - Pick what you own, get tailored recommendations
- **Detailed Breakdowns** - Understand why each comp was recommended
- **Share Links** - Share your selections via URL
- **Persistent Selections** - Your choices are saved automatically
- **Global Search** - Quickly find champions, items, or comps

### For Admins
- **Comp Editor** - Add/edit team compositions with drag-and-drop positioning
- **Item Assignment** - Set recommended and optional items per unit
- **JSON Export** - Copy positioning data for easy updates

---

## 🚀 Quick Start

### Development

```bash
# Clone the repo
git clone https://github.com/your-username/tft-professor.git
cd tft-professor/frontend

# Install dependencies
npm install

# Start dev server
npm run dev

# Visit http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npx serve dist -p 3000
```

### Run Tests

```bash
# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Run tests once (CI mode)
npm run test:run
```

---

## 📚 Documentation

- **[Product Plan](PRODUCT_PLAN.md)** - Feature list, tech stack, build sequence
- **[Quick Start](QUICK_START.md)** - Beginner-friendly setup guide
- **[Roadmap](ROADMAP.md)** - Development phases and priorities
- **[Deployment Guide](frontend/DEPLOYMENT_GUIDE.md)** - Deploy to GitHub Pages or Vercel
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Quick deployment reference
- **[Recommendation Algorithm](frontend/RECOMMENDATION_ALGORITHM.md)** - How scoring works
- **[No Database Implementation](frontend/NO_DATABASE_IMPLEMENTATION.md)** - Data structure details

---

## 🏗️ Tech Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v7
- **Styling:** Tailwind CSS
- **Validation:** Zod
- **Testing:** Vitest

### Data
- **Option A:** Local JSON files (no backend needed)
- **Option B:** Supabase (PostgreSQL + Auth)

### Assets
- **Sprites:** CommunityDragon CDN
- **Icons:** Lucide React

---

## 📁 Project Structure

```
tft-professor/
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── data/            # Data helpers + recommendation engine
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Route pages
│   │   ├── types.ts         # TypeScript types
│   │   ├── schemas.ts       # Zod validation schemas
│   │   └── utils/           # Utility functions
│   ├── public/
│   │   └── data/
│   │       └── comps.json   # Comp data (no-database mode)
│   └── tests/               # Unit tests
├── .github/
│   └── workflows/
│       └── deploy.yml       # GitHub Actions deployment
└── docs/                    # Documentation
```

---

## 🎮 Usage

### 1. Select Your Champions & Items
Navigate to **Builder** and select the champions and items you currently own.

### 2. View Recommendations
Click **View Results** to see recommended comps sorted by match percentage.

### 3. See Details
Click any comp to view:
- Board positioning (7×4 grid)
- Required and optional units
- Recommended items per unit
- Score breakdown

### 4. Share Your Build
Click **Copy Share Link** to share your selections with others.

---

## 🔧 Configuration

### Deployment Modes

**GitHub Pages (No Database):**
```typescript
// vite.config.ts
export default defineConfig({
  base: '/tft-professor/', // Your repo name
})
```

**Vercel + Supabase:**
```typescript
// vite.config.ts
export default defineConfig({
  base: '/', // Root path for Vercel
})

// .env.local
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
```

### Scoring Weights

Customize recommendation scoring in `src/data/scoringConfig.ts`:

```typescript
export const SCORING_CONFIG = {
  weights: {
    coreUnits: 50,      // Carry units (50%)
    optionalUnits: 15,  // Tanks/support (15%)
    carryItems: 25,     // Carry items (25%)
    supportItems: 10,   // Tank items (10%)
  },
  bonuses: {
    allCoreUnits: 10,
    allCarryItems: 8,
    costEfficiency: 5,
  },
}
```

---

## 🧪 Testing

### Unit Tests

23 tests covering:
- Score calculation
- Explanation generation
- Filtering logic
- Edge cases

```bash
npm run test
```

### Manual Testing Checklist

- [ ] Builder: Select champions/items
- [ ] Results: See recommendations
- [ ] Comp Detail: View board + items
- [ ] Admin: Edit positioning
- [ ] Global Search: Find champions/items/comps
- [ ] Share Link: Copy and paste URL
- [ ] Mobile: Test responsive layout
- [ ] Keyboard: Navigate with Tab/Arrow keys

---

## 📊 Performance

- **Bundle Size:** ~330 KB (gzipped: ~100 KB)
- **Initial Load:** < 2s (fast 3G)
- **Lighthouse Score:** > 90
- **Assets:** Lazy-loaded sprites
- **Caching:** Service worker ready

---

## 🚢 Deployment

### Quick Deploy to GitHub Pages

```bash
# 1. Update vite.config.ts base path
# 2. Enable GitHub Pages (Settings → Pages → Source: GitHub Actions)
# 3. Push to main
git push origin main
```

### Quick Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel
```

See [DEPLOYMENT_GUIDE.md](frontend/DEPLOYMENT_GUIDE.md) for detailed instructions.

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Ensure `npm run build` passes
- Keep bundle size reasonable

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- **CommunityDragon** - Champion and item sprites
- **Riot Games** - TFT game data
- **TFT Academy** - Inspiration for design

---

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/your-username/tft-professor/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-username/tft-professor/discussions)

---

## 🗺️ Roadmap

### MVP (Completed ✅)
- [x] Champion/item selection
- [x] Comp recommendations with scoring
- [x] Board positioning display
- [x] Admin comp editor
- [x] Persistent selections
- [x] Share links
- [x] Global search
- [x] Accessibility (keyboard nav)

### Post-MVP (Planned)
- [ ] Supabase integration
- [ ] User accounts (save favorite comps)
- [ ] Trait synergy bonus
- [ ] Meta comp weighting
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Export comp as image
- [ ] Riot API integration (auto-suggest based on match history)

See [ROADMAP.md](ROADMAP.md) for detailed feature roadmap.

---

## 💻 Development

### Requirements

- Node.js 20+
- npm 10+

### Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run test:ui      # Run tests with UI
npm run lint         # Lint code
```

### Environment Variables

```env
# Optional (Supabase mode only)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

**Built with ❤️ for the TFT community**

Star ⭐ this repo if you find it useful!



