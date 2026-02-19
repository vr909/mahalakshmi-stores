# 🧾 Mahalakshmi Stores Billing App — v2

## What's New in v2?

The **entire app was rebuilt** to solve the core problem with v1: **inconsistent PDF output across devices**. The old approach (html2pdf.js) took a screenshot of the HTML, so PDFs looked different on your tablet vs desktop. The new approach uses **jsPDF** to draw every line of the PDF programmatically — same result on any device.

### Key Changes from v1
| Feature | v1 | v2 |
|---|---|---|
| PDF Engine | html2pdf.js (screenshot) | jsPDF (programmatic drawing) |
| Multi-page | DOM cloning hack | Built-in page loop |
| Save/Load | Not supported | localStorage |
| CSV Export | Not supported | ✅ |
| Offline | Service worker (basic) | PWA with cache-first SW |
| Android APK | Cordova build | Discontinued (PWA only) |

---

## File Structure

```
v2/
├── index.html           # App layout & structure
├── style.css            # Tablet-first, modern UI styles
├── script.js            # All logic: items, state, PDF, save/load, CSV
├── jspdf.umd.min.js     # jsPDF 2.5.1 (bundled locally for offline)
├── manifest.json        # PWA manifest (installable app)
├── sw.js                # Service Worker (cache-first, offline ready)
└── FORvignesh.md        # This file
```

---

## How the App Works

### Item Data
Items are hardcoded arrays (Groceries, Toiletries, Disinfectives). Some items have **variants** (e.g., "Amul Ghee 200ml" and "Amul Ghee 500ml"). The `buildState()` function flattens these into individual rows.

### Default Rates
When you enter a rate for an item, it's saved to `localStorage` as a default. Next time you open the app, that rate auto-fills. This saves time on repeat billing.

### PDF Generation (`generatePDF()`)
This is the heart of the rebuild. Here's how it works:

1. **Filter** — Only items with qty > 0 and rate > 0 are included
2. **Calculate rows-per-page** — Based on available vertical space (A4 page minus headers/margins/footer)
3. **Smart pagination** — If the last page would have ≤2 items, we redistribute items to fill pages more evenly
4. **Page loop** — For each page:
   - Draw header (store name left, recipient right)
   - Draw bill meta (bill number, category, date)
   - Draw column headers (S.No, Item, Rate, Qty, Amount)
   - Draw data rows
   - On last page: draw Grand Total
   - Draw footer ("Page X of Y" bottom-right)

### Save/Load
Bills are saved to `localStorage` with key format `bill_{number}_{category}`. The Load modal shows all saved bills sorted by date, with load and delete buttons.

### CSV Export
Generates a standard CSV file with S.No, Item, Rate, Qty, Amount columns plus Grand Total.

---

## How to Use (on your Samsung tablet)

1. Open the app in **Chrome** on your tablet
2. Tap the browser menu → **"Add to Home screen"** → this installs it as a PWA
3. Now you can open it like a regular app, and it works **offline**
4. Select a category tab (Groceries/Toiletries/Disinfectives)
5. Enter rates and quantities for items
6. Tap **Download PDF** to generate and save the invoice
7. Use **Save** to store the bill, **Load** to recall it, **CSV** to export data

---

## Design Decisions

- **No HTML preview panel** — v1 had a hidden HTML invoice that was screenshotted. v2 draws directly with jsPDF, so no preview needed
- **PWA only, no APK** — Simpler updates (just refresh the page), no Gradle/JDK/Cordova headaches
- **Rates persist** — Remembers your last-used rate per item via localStorage
- **Smart pagination** — Avoids ugly 1-2 item last pages by redistributing items evenly
