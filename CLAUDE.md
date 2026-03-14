# Wanderlust — Travel Globe Explorer

Interactive 3D travel agency website with a spinning globe, 49 destinations, and a full booking funnel.

## Run

```bash
cd ~/Documents/travel-agency
python3 -m http.server 8080
# Open http://localhost:8080
```

## File Structure

```
travel-agency/
├── index.html              # Single-page app shell, all page overlays, booking modal
├── app.js                  # Three.js globe, search, fly-to, navigation, booking logic
├── countries.js            # 49 destinations — name, region, description, offers, imagePrompt
├── style.css               # Full design system — tokens, components, pages, responsive
├── image-map.js            # Maps country names → image file paths (auto-generated)
├── generate-images.mjs     # FAL AI (flux/schnell) batch image generator
├── rebuild-map.mjs         # Rebuilds image-map.js from /images directory
└── images/                 # 49 destination hero photos (mix of AI-generated + Unsplash stock)
```

## Features

### 3D Globe
- Three.js globe with NASA Blue Marble textures, bump mapping, specular oceans
- Atmospheric fresnel glow shader
- 6,000 background stars
- OrbitControls with damping, auto-rotate, zoom range 1.2–5x (close zoom for small European countries)
- Country borders from world-atlas TopoJSON — featured countries highlighted with lighter borders
- Invisible pick meshes for raycasting click detection on featured countries
- Thin white pin markers with diamond tips on each featured destination

### Search
- Centered search bar with glass-surface blur aesthetic
- Live filtering as you type, highlighted match text, region labels
- Keyboard navigation (Arrow keys, Enter, Escape)
- `/` keyboard shortcut to focus
- Selecting a result triggers fly-to animation

### Fly-To Animation
- Smooth cubic ease-out camera flight to selected country (1.2s)
- Auto-opens country panel on arrival
- Used by search and can be called programmatically

### Country Panel (slide-in sidebar)
- Hero image with gradient overlay
- Country name, region, literary description
- Social proof — star rating + review count (deterministic per country, 4.5–4.9 range)
- 3 offer cards per country (flight, hotel, tour) with:
  - Strikethrough original prices (urgency)
  - Scarcity badges ("Limited spots", "Selling fast", "Popular choice")
  - "Book now" button on each card → opens booking modal
- Sticky "Book your [Country] trip" CTA at bottom

### Booking Modal
- Pre-filled with offer context (country, offer title, type, price)
- Fields: name, email, preferred dates, travelers, special requests
- Success confirmation with auto-close
- "No payment required" disclaimer to reduce friction

### Full Navigation
- **Destinations** — returns to globe view, closes any open pages
- **Experiences** — full-page overlay with 6 curated experience cards:
  - Safari & Wilderness, Luxury Resorts, Mountain & Adventure
  - Cultural Immersion, Food & Wine, Northern Lights & Arctic
  - Each card uses existing country photos as hero images
- **About** — agency story, 3 core values, 3 team members with bios
- **Book a Trip** — standalone booking form with destination dropdown (49 countries grouped by region), trip type selector, dates, travelers, notes
- **Logo click** — returns to globe from anywhere
- **Escape** key closes any open page/panel/modal
- All pages fade in with upward slide animation

### Conversion Features
1. "Book Now" buttons on every offer card
2. Lead capture modal with low-friction copy
3. Social proof (ratings + review counts)
4. Urgency/scarcity (strikethrough prices + badges)
5. Sticky CTA in country panel
6. Location pin markers showing clickable countries
7. Full standalone booking page via nav

## Destinations (49 total)

### Europe (24)
France, Italy, Spain, Portugal, Greece, Switzerland, Croatia, Iceland, Norway, Ireland, Czech Republic, Turkey, Germany, United Kingdom, Netherlands, Austria, Sweden, Denmark, Poland, Hungary, Belgium, Finland, Montenegro, Slovenia

### Asia (9)
Japan, Thailand, Vietnam, Indonesia, India, South Korea, Sri Lanka, Nepal, Maldives

### Americas (7)
United States, Mexico, Brazil, Argentina, Peru, Costa Rica, Colombia

### Africa (5)
Morocco, South Africa, Kenya, Tanzania, Egypt

### Middle East (2)
Jordan, United Arab Emirates

### Oceania (2)
Australia, New Zealand

## Design System

### Color Palette
- Background: `#060610` (near-black with blue undertone)
- Surface: `rgba(8, 8, 20, 0.94)` (glass panels)
- Accent: `#ffffff` (pure white — no gold)
- Text: `#e4e4ec` primary, `#70708a` muted
- Borders: `rgba(255, 255, 255, 0.07)`

### Typography
- Display: **Instrument Serif** (italic) — proxy for PP Editorial New
- Body: **DM Sans** — proxy for Akkurat by Lineto
- Headlines use `font-weight: 400; font-style: italic` for editorial feel

### Design Decisions
- No gold/warm accent colors — pure white accent for clean luxury
- Ghost buttons (white border) that fill white on hover
- Glass-surface panels with `backdrop-filter: blur`
- Minimal pin markers (thin line + diamond) instead of pulsing dots
- Literary, opinionated destination descriptions (not generic marketing copy)
- Page overlays instead of route-based navigation (SPA stays on one URL)
- All prices are illustrative, booking is lead-capture only (no payment processing)

## Image Generation

Photos are a mix of AI-generated (FAL AI flux/schnell) and Unsplash stock. To regenerate AI images:

```bash
# Set FAL API key (needs active balance at fal.ai/dashboard/billing)
export FAL_KEY="your-key-here"
node generate-images.mjs
```

The script skips existing images. Delete specific files from `images/` to force regeneration. It auto-rebuilds `image-map.js` when done.

## Tech Stack
- **Three.js 0.160.0** — 3D globe, atmosphere shader, raycasting
- **TopoJSON** (world-atlas) — country border geometry
- **ES Modules** — native import maps, no bundler
- **Python HTTP server** — local dev (any static server works)
- **Google Fonts** — Instrument Serif + DM Sans
- **No frameworks** — vanilla HTML/CSS/JS throughout
