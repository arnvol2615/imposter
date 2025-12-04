# Imposter Who

A mobile-friendly web app for a local social deduction game (3–15 players) where one or more imposters do not know the secret word.

## Features
- Setup: select players (3–15), number of imposters (up to floor(players/3)), optional discussion timer.
- Language: Norwegian or English, with separate word libraries.
- Word selection: random category + word, avoids recent repeats with per-category history.
- Reveal: sequential per player; non-imposters see only the word, imposters see only their role.
- Discussion: optional countdown timer.
- Result: reveals secret word and imposter(s).

## Tech Stack
- React + TypeScript
- Vite

## Local Development
```powershell
# From repo root
cd "c:\Code\Demo\imposter\imposter"
npm install
npm run dev
```
Open the printed URL (typically http://localhost:5173/).

## Build
```powershell
npm run build
npm run preview
```

## Deployment (GitHub Pages)
This repo includes a GitHub Actions workflow that builds and deploys the site to GitHub Pages.

- Pages settings: set Build and deployment = GitHub Actions.
- On push to `main`, the workflow runs and publishes `dist`.
- URL: `https://<your-username>.github.io/imposter/`

### Vite Base Path
The site is served under the repository subpath (`/imposter`). The workflow sets `BASE_PATH` automatically during build. If you run a manual production build locally for Pages, you can set:
```powershell
$env:BASE_PATH = "/imposter"; npm run build
```

## Data
- Norwegian: `src/data/categories.ts`
- English: `src/data/categories_en.json`

## Notes & Future Work
- Expand word lists toward ~500+ words.
- Persist a longer history or add a reshuffle button.
- Optional simple voting UI (currently outside the app per spec).
# Imposter Who (Vite + React)

Mobilvennlig web-app for sosialt deduksjonsspill med 3–15 spillere på én enhet.

## Funksjoner
- Oppsett: Antall spillere, valgfri diskusjonstimer.
- Tilfeldig kategori og hemmelig ord.
- Tilfeldig Imposter blant spillerne.
- Sekvensiell visning: Rolle og ord per spiller, med "OK/Skjul".
- Diskusjon med valgfri timer.
- Avsløring: Hemmelig ord og hvem som var Imposter.

## Data
- Se `src/data/categories.ts` for kategorier og ord.
- Merk: Dette er et minimumsseed. Utvid til ~500 ord fordelt på 10+ kategorier per spesifikasjonen.

## Quick start (PowerShell)

```powershell
cd "c:\Code\Demo\imposter\imposter"
npm install
npm run dev
```

### Build & Preview
```powershell
npm run build
npm run preview
```

Åpne URL (typisk http://localhost:5173/) i nettleseren.
