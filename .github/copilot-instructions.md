# Imposter Who - AI Coding Agent Instructions

## Project Overview
A mobile-friendly React/TypeScript web app for a local social deduction game (3–15 players). Players share one device to receive roles sequentially, then discuss to identify imposter(s) who don't know the secret word/location.

## Architecture

### Two Game Modes (src/modes/)
- **ClassicApp.tsx**: Word-based deduction. Players see a category + secret word; imposters see "Imposter" instead
- **SpyfallApp.tsx**: Location-based with role assignments. Players know location + role; spies only see "Spy"

Both modes follow identical phase flow: `setup → pre-reveal → reveal → discussion → reveal-result`

### Data Structure Pattern
Game data uses explicit TypeScript structures:
- Classic: `src/data/categories.ts` (Norwegian) + `categories_en.json` (English)
- Spyfall: `src/data/locations.ts` + `location_roles.ts` (both languages)
- Structure: `{ name: string, words: string[] }` or location-to-roles mappings

### State Management
Pure React hooks - no Redux/Zustand. Each mode maintains:
```tsx
const [phase, setPhase] = useState<Phase>('setup')
const [state, setState] = useState<GameState | null>(null)
```

### Bilingual i18n Pattern
Inline translation function `t(lang: Language, key: string)` with Norwegian/English dictionaries defined as plain objects within each mode file. No i18n library.

## Critical Patterns

### Sequential Reveal Mechanism
Key UX requirement: Each player must see their role individually without others seeing
- `currentRevealIndex` tracks which player is viewing
- UI shows "Show player #N" button between reveals
- Cards display role/word, then "OK / Hide" advances to next

### localStorage for Persistence
Three keys store cross-session data:
- `imposterwho:history` - Prevents recent word/category repeats (last 5 per category)
- `imposterwho:last` - Stores previous game's category/word for avoidance
- `imposterwho:setup` / `spyfall:setup` - Remembers player count, timer settings

Pattern: Always wrap in `try/catch` blocks (privacy mode compatibility)

### Word Selection Anti-Repeat Logic
`pickCategoryAndWord()` in [ClassicApp.tsx](imposter/src/modes/ClassicApp.tsx#L19-L44):
1. Excludes last category (if possible)
2. Filters out last 5 words from chosen category
3. Falls back gracefully if all words exhausted
4. Updates history after selection

### Random Imposter Assignment
Generate array of unique random indices: `while (indices.length < targetImposters) { const r = randomInt(playerCount); if (!indices.includes(r)) indices.push(r) }`

### Inline Styling Convention
All styles use React inline `style={{}}` objects - no CSS files, no CSS-in-JS libraries. Pattern:
```tsx
style={{
  background:'#1c1c1c',
  borderRadius:12,
  padding:24,
  boxShadow:'0 6px 16px rgba(0,0,0,0.35)'
}}
```

## Development Commands

```powershell
# Working directory is imposter/ subdirectory
cd c:\Code\Demo\imposter\imposter

# Development
npm install
npm run dev  # Opens http://localhost:5173/

# Production build
npm run build
npm run preview
```

### GitHub Pages Deployment
- Vite base path configured via `BASE_PATH` env var in [vite.config.ts](imposter/vite.config.ts#L5)
- GitHub Actions workflow auto-deploys to `/imposter` subpath
- Manual build: `$env:BASE_PATH = "/imposter"; npm run build`

## Common Tasks

### Adding Words to Classic Mode
Edit [src/data/categories.ts](imposter/src/data/categories.ts) (Norwegian) or [categories_en.json](imposter/src/data/categories_en.json) (English). Maintain parallel structures - ensure both have matching category names.

### Adding Spyfall Locations
1. Add location to [locations.ts](imposter/src/data/locations.ts) `LOCATIONS` (English) and `LOCATIONS_NO` (Norwegian)
2. Add corresponding roles array in [location_roles.ts](imposter/src/data/location_roles.ts) for both `ROLES_EN` and `ROLES_NO`

### Adding Translation Keys
Locate the `t()` function in the relevant mode file and add entries to both `no` and `en` objects. Use existing keys like `{max}` for variable substitution.

## Constraints & Spec Adherence

Per [spec.txt](spec.txt):
- **Word library goal**: ~500 words across 10+ categories (currently ~300, expand gradually)
- **Player range**: Enforce 3–15 players
- **Max imposters**: `floor(players/3)` (validated in Setup component)
- **No accounts/login**: Pure client-side, works offline after initial load
- **Timer**: Optional countdown during discussion phase, stored in setup preferences

## Anti-Patterns to Avoid
- Don't add external state management (Redux, Zustand, etc.) - hooks are intentional for simplicity
- Don't extract CSS to separate files - inline styles maintain single-file portability
- Don't add server-side logic - this is 100% client-side by design
- Don't break sequential reveal flow - sharing device is core mechanic
