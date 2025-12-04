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
