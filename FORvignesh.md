# Mahalakshmi Stores Billing App - Project Handover (Current State)

## 1) Project Purpose

A touch-first, offline-capable billing PWA for Mahalakshmi Stores.

Primary goals achieved:
- Fast, low-friction billing on mobile/tablet.
- Consistent PDF output across devices.
- Strong resilience against accidental refresh/data loss.
- Simple local usage without backend.

## 2) Hard Requirements Preserved

These were explicitly preserved throughout the redesign:
- Hardcoded item lists remain in code (no backend/dynamic catalogs).
- Category set remains exactly:
  - Groceries
  - Toiletries
  - Disinfectives
- PDF generation remains programmatic via jsPDF.
- PDF format/layout logic retained (A4 invoice structure with pagination, totals, etc.).

## 3) Scope of Completed Upgrades

### UX and UI
- Rebuilt from table-based entry to large card-based, tap-first controls.
- Added guided, touch-friendly entry model:
  - Qty stepper (+/-)
  - Rate stepper (+/- with step 5)
  - Numeric keypad modal for direct entry
- Added voice readout on item name tap (speech synthesis).
- Added lightweight haptic feedback on supported devices.
- Added sticky top tooling (category + search tools) with compact-on-scroll behavior.
- Added floating `Top` button.
- Added floating `+ Add Custom Item` button.
- Added mobile micro-responsiveness improvements for very small screens.

### Data and Reliability
- Added full auto-save draft across categories (`activeBillDraft`) so refresh does not lose work.
- Added per-category bill number memory (`billNosByCategory`) with defaults:
  - Groceries: 92
  - Toiletries: 93
  - Disinfectives: 94
- Added/maintained save-load bill workflow (`bill_*` keys).
- Preserved default rate memory per item (`defaultRates`).

### CSV and Preview
- CSV export retained and updated for integer rate display.
- CSV import added (reads app-exported invoice CSV and maps rows to items).
- Added bill preview modal for quick at-a-glance verification (not PDF-styled, intentionally).

### Service Worker / PWA
- Service worker cache version updated to `mstores-v3`.
- Offline fetch fallback improved.
- Manifest metadata adjusted for current app identity/theme.

## 4) Requirements/Requests Implemented (User-Driven)

This section captures the major requested tweaks that were completed.

- Removed onboarding instruction strip (1/2/3).
- Numeric popup titles now include item context:
  - `Set Quantity for <item>`
  - `Set Rate (Rs.) for <item>`
- Rate +/- increment changed to 5.
- Removed quick rate suggestion chips.
- Removed category subtitle texts (`Basket`, `Sparkle`, `Shield`) from tabs.
- Toiletries list updated:
  - Added `Odonil Air freshner 48g x 4 Box`
  - Corrected to `Odonil Room Spray 150ml`
- Added autosave draft on edits and restored on reload.
- Improved long-list usability:
  - Search
  - Back-to-top
  - Sticky tools
- Refined toolbar prominence:
  - Category tabs made more prominent
  - Find/Clear tools made less prominent
- Find + Clear kept on same row for space efficiency.
- Rate display/entry switched to integer-focused behavior.
- Numpad `Back` renamed to `Delete`.
- Added bill preview popup.
- Added CSV import action/button.
- Dock button arrangement updated:
  - Row 1: Preview, Save, Load
  - Row 2: Save CSV, Import CSV, Reset
  - PDF remains full-width top row CTA
- Picked item active highlight strengthened, then tuned thickness to `1.25px`.
- Active highlight accent unified to toiletries color for all categories.
- Floating custom button repositioned and restyled for prominence.
- Custom item insertion logic updated to use **most recently picked item** semantics.

## 5) Current Functional Behavior (Detailed)

### Item data and state
- Item masters are defined in `script.js` arrays.
- `buildState()` expands variant items into flat display rows.
- Runtime state by category is maintained in-memory and persisted to draft.

### Entry model
- Qty and rate updates recompute amount immediately.
- Rate is rounded to integer in UI entry path.
- Total and picked count update live.

### Picked-item tracking
- Each item has `lastPickedAt` metadata.
- When qty is changed to a positive value, timestamp updates.
- Used to place newly added custom item after the most recently picked item.

### Custom items
- Added via floating action button.
- Inserted after most recently picked item in current category.
- Marked `isCustom: true` and can be removed.

### Bill Preview
- Popup modal shows:
  - Bill metadata (number, category, date, recipient)
  - Table of selected items (item, qty, rate, amount)
  - Total
- Uses selected items only (`qty > 0` and `rate > 0`).

### PDF generation
- Uses jsPDF (`generatePDF()`).
- Keeps header/meta/table/footer layout logic.
- Smart pagination preserved.
- Includes grand total and page numbering.

### Save / Load
- Saved bill key: `bill_<billNo>_<CategoryLabel>`.
- Load modal lists saved bills sorted by `savedAt` descending.
- Can load or delete saved bills.

### CSV export
- Exports selected bill rows for current category.
- Includes grand total row.
- File naming: `Invoice_<billNo>_<Category>.csv`.

### CSV import
- Accepts `.csv` file input.
- Parses exported invoice format.
- Detects category from filename where possible, otherwise infers by item overlap.
- Maps known items, adds unknown rows as custom items.
- Updates bill number from filename if present.

### Draft persistence
- Draft key: `activeBillDraft`.
- Includes:
  - current category
  - date, recipient
  - per-category bill numbers
  - item rows per category
  - custom items
  - `lastPickedAt`
- Draft updated on relevant user actions.

### Bill numbers by category
- Key: `billNosByCategory`.
- Defaults:
  - groceries: 92
  - toiletries: 93
  - disinfectives: 94
- Stored independently and not auto-incremented.

## 6) Current UI Organization

### Main structure
- `header.hero`: store branding + install CTA
- `bill-strip`: date, bill no, recipient
- `sticky-tools`:
  - category tabs
  - search + clear + autosave status
- `items-panel`: item cards list
- floating custom item button
- summary panel (picked count + total)
- action dock (PDF/Preview/Save/Load/Save CSV/Import CSV/Reset)

### Overlays/modals
- Numeric pad modal
- Load bills modal
- Preview modal
- Toast notifications

## 7) Files and Responsibilities

- `index.html`
  - app shell, toolbar, dock, modals, file input hook
- `style.css`
  - visual system, responsive behavior, sticky/floating controls, modal/table styles
- `script.js`
  - all app behavior: state, rendering, edits, autosave, preview, CSV import/export, save/load, PDF
- `sw.js`
  - cache install/activate/fetch handling (`mstores-v3`)
- `manifest.json`
  - installable PWA metadata
- `jspdf.umd.min.js`
  - PDF library bundle
- `README.md`
  - user/developer overview
- `FORvignesh.md`
  - this detailed handover

## 8) Local Storage Keys in Use

- `defaultRates`
- `billNosByCategory`
- `activeBillDraft`
- `bill_<billNo>_<CategoryLabel>`

## 9) Notes for Future Changes

- Do not modify hardcoded category names/lists unless business asks explicitly.
- Keep PDF layout logic stable when doing UX-only changes.
- If changing CSV format, update both export and import parser together.
- If changing dock buttons, also verify mobile breakpoints and floating button overlap.
- Preserve draft compatibility (`lastPickedAt` and item fields) to avoid restore breakage.

## 10) Current Status

Project is in a production-ready functional state for local/PWA use with:
- modern touch UI,
- robust persistence,
- preview + PDF + CSV workflows,
- and responsive layout tuned iteratively from live usage feedback.
