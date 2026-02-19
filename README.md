# Mahalakshmi Stores Billing PWA

A touch-first, offline-capable billing app for Mahalakshmi Stores.

The app is optimized for fast billing on mobile/tablet, supports category-based billing, and generates consistent A4 PDF invoices using jsPDF.

## Current Highlights

- Three fixed categories with hardcoded item lists:
  - Groceries
  - Toiletries
  - Disinfectives
- Large tap-based item cards for quantity/rate entry
- Integer rate entry with step controls and number pad
- Strong picked-item highlight for quick scanning
- Auto-save draft across refresh (all categories)
- Separate bill numbers by category (defaults: 92/93/94)
- Save/Load bills from localStorage
- CSV export and CSV import (for app-exported invoice CSV files)
- Bill Preview modal (quick at-a-glance table)
- Programmatic A4 PDF generation with pagination
- Installable PWA + offline service worker caching

## Important Behavior

- Item master lists and category names are fixed in code.
- PDF layout is generated programmatically (not HTML screenshot based).
- Custom items are supported and inserted after the most recently picked item.
- Floating `+ Add Custom Item` button is available while scrolling.

## Tech Stack

- HTML, CSS, JavaScript (no framework)
- jsPDF (bundled locally in `jspdf.umd.min.js`)
- localStorage (drafts, rates, saved bills, category bill numbers)
- Service Worker (`sw.js`) for offline support

## Run Locally

From this project folder:

```bash
python -m http.server 8080 --bind 0.0.0.0
```

Open on this machine:

```text
http://127.0.0.1:8080
```

Open from another device on same Wi-Fi:

```text
http://<your-local-ip>:8080
```

Example:

```text
http://192.168.68.103:8080
```

If LAN access fails, check Windows Firewall and ensure both devices are on the same network.

## Core User Flows

### 1. Build a bill

1. Select category tab
2. Enter qty and rate for items
3. Use Preview for quick verification
4. Download PDF

### 2. Save and resume

1. Tap Save
2. Later tap Load and restore bill

### 3. CSV round trip

1. Export CSV from current category bill
2. Tap Import CSV and select that file
3. App maps rows to known items and adds unknown rows as custom items

## Data Persistence

Stored in browser localStorage:

- `defaultRates`
- `billNosByCategory`
- `activeBillDraft`
- `bill_*` saved bill records

## File Structure

- `index.html`: UI structure and modal shells
- `style.css`: responsive UI styling and visual system
- `script.js`: state, rendering, save/load, CSV import/export, preview, PDF logic
- `jspdf.umd.min.js`: local jsPDF bundle
- `manifest.json`: PWA manifest
- `sw.js`: service worker cache logic
- `README.md`: project documentation
- `LICENSE`: MIT license

## License

MIT. See `LICENSE`.
