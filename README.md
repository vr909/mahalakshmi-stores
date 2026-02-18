# Mahalakshmi Stores — Billing App

A lightweight, offline-capable billing app built for **Mahalakshmi Stores**, a grocery shop in Coimbatore, India. Generates professional A4 PDF invoices that look identical on any device.

![PWA](https://img.shields.io/badge/PWA-Installable-blueviolet) ![Offline](https://img.shields.io/badge/Works-Offline-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

- **Three categories** — Groceries, Toiletries, Disinfectives with pre-loaded item lists
- **Programmatic PDF generation** — Uses [jsPDF](https://github.com/parallax/jsPDF) for pixel-perfect, device-independent A4 invoices
- **Smart pagination** — Multi-page support with repeated headers; avoids orphan items on the last page
- **Save & Load bills** — Store bills in the browser and reload them anytime
- **CSV export** — Export bill data for spreadsheet use
- **Default rates** — Remembers item prices across sessions
- **Custom items** — Add one-off items not in the pre-loaded list
- **PWA** — Installable on any device, works fully offline after first visit

## Tech Stack

- **Vanilla HTML, CSS, JavaScript** — no frameworks, no build step
- **jsPDF 2.5.1** — bundled locally for offline PDF generation
- **Service Worker** — cache-first strategy for offline support
- **localStorage** — persistent storage for bills, rates, and preferences

## Getting Started

### Run Locally

```bash
cd v2/
python -m http.server 8080
# Open http://localhost:8080
```

### Install as PWA

1. Deploy to any HTTPS host (GitHub Pages, Netlify, Vercel)
2. Open the URL on your device in Chrome
3. Tap **⋮ Menu → Add to Home screen**
4. The app now works offline like a native app

### Deploy to GitHub Pages

1. Push this folder to a GitHub repository
2. Go to **Settings → Pages → Deploy from branch (main)**
3. Your app will be live at `https://username.github.io/repo-name/`

## File Structure

```
├── index.html           # App layout
├── style.css            # Tablet-first responsive design
├── script.js            # All logic: items, PDF, save/load, CSV
├── jspdf.umd.min.js     # jsPDF library (offline bundle)
├── manifest.json        # PWA manifest
├── sw.js                # Service Worker for offline caching
├── README.md            # This file
└── LICENSE              # MIT License
```

## PDF Output

Each generated invoice includes:
- Store name and recipient address on every page
- Bill number, category, and date
- Column headers: S.No, Item, Rate(Rs.), Qty, Amount(Rs.)
- Quantity shown with "Pcs" unit
- Grand Total with "Rs." prefix
- Page numbering (Page X of Y)

## License

This project is licensed under the [MIT License](LICENSE).
