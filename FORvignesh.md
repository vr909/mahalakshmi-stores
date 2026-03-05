# Mahalakshmi Stores Billing App - Project Handover (Updated)

## 1) Project Purpose

A touch-first, offline-capable billing PWA for Mahalakshmi Stores.

Primary goals:
- Fast, low-friction billing on mobile/tablet.
- Consistent PDF output across devices.
- Strong resilience against accidental refresh/data loss.
- Simple local usage without backend.

## 2) Hard Requirements Preserved

Preserved throughout all work:
- Hardcoded item lists remain in code (no backend catalog).
- Category-driven billing model retained.
- PDF generation remains programmatic via jsPDF.
- Invoice PDF layout/formatting style preserved.

## 3) Current Category Set

- Groceries
- Toiletries
- Disinfectives
- Vegetables
- Milk

## 4) Input UX by Category

### A) Card-based tabs
For:
- Groceries
- Toiletries
- Disinfectives

Behavior:
- Large card rows
- Qty stepper (+/-)
- Rate stepper (+/- with step 5)
- Numeric keypad popup for direct input
- Custom item add/remove

### B) Simple table tabs
For:
- Vegetables
- Milk

Behavior:
- Table columns: Item, Rate, Qty, Unit, Amount
- Vegetables unit: selectable (`Kgs` / `Pcs`)
- Milk unit: fixed (`Litres`)
- Live amount and total updates

## 5) Lists Added Today

### Vegetables list
- Tomato
- Onion
- Garlic
- Coriander/Curry leaf
- Coconut
- Carrot/Beans
- Potato
- Ginger
- Drumstick
- Lady'sFinger
- Mushroom
- Greenchillies
- Lemon
- Greens
- Bittergourd
- Broccoli
- Eggs

### Milk list
- Milk

## 6) Bill Number Defaults (Per Category)

Stored in `billNosByCategory`:
- Groceries: 92
- Toiletries: 93
- Disinfectives: 94
- Vegetables: 95
- Milk: 96

No auto-increment.

## 7) Major Features (Current)

- Auto-save draft across categories (`activeBillDraft`)
- Save/Load bill records (`bill_*` keys)
- Default rate memory (`defaultRates`)
- Preview modal (quick bill inspection)
- CSV export/import
- Programmatic PDF generation (A4 + pagination)
- PWA install support + offline cache (`mstores-v3`)

## 8) Custom Item Rules

- Floating `+ Add Custom Item` button
- Inserts custom item after the **most recently picked item**
- Applies in runtime order and reflected in output order

## 9) Quantity + Unit Behavior

- Core tabs default to `Pcs` style qty representation
- Vegetables supports:
  - `Kgs` (decimal-friendly)
  - `Pcs` (integer)
- Milk supports:
  - `Litres` (decimal-friendly)

Formatting updates applied to:
- Preview table
- CSV export/import
- PDF Qty display text (e.g., `2 Kgs`, `3 Pcs`, `1.5 Litres`)

## 10) CSV Behavior

### Export
- File naming: `Invoice_<billNo>_<Category>.csv`
- Includes selected rows and grand total
- For unit-based categories, qty includes unit text

### Import
- Parses app-exported invoice CSV
- Category detection:
  - From filename if available
  - Else inferred via item overlap scoring
- Maps known items and adds unknown items as custom
- Restores bill number from filename when available
- Supports unit parsing for `Kgs`, `Pcs`, `Litres`

## 11) Preview Behavior

Bill Preview modal shows:
- Bill meta (number, category, date, recipient)
- Item rows (Item, Qty+Unit, Rate, Amount)
- Total

## 12) PDF Behavior

- jsPDF-based invoice generation
- Existing layout style retained
- Smart pagination retained
- Qty text now unit-aware where applicable

## 13) UI Layout Notes

- Sticky top tools (category tabs + search controls)
- Search and Clear Search on same row for space efficiency
- Category selector prominence tuned
- Floating Top button
- Floating Add Custom Item button
- Dock layout:
  - PDF as full-width primary row
  - Preview/Save/Load row
  - Save CSV/Import CSV/Reset row

## 14) Local Storage Keys in Use

- `defaultRates`
- `billNosByCategory`
- `activeBillDraft`
- `bill_<billNo>_<CategoryLabel>`

## 15) File Responsibilities

- `index.html`
  - app shell, tabs, dock, modals, file input hook
- `style.css`
  - responsive visual system, table/card styles, sticky/floating behavior
- `script.js`
  - all app logic: state, renderers, autosave, preview, CSV, save/load, PDF
- `sw.js`
  - cache install/activate/fetch handling
- `manifest.json`
  - PWA metadata

## 16) Current Status

Project is stable and production-usable for local/PWA operation with:
- multi-category billing,
- resilient persistence,
- preview + PDF + CSV workflows,
- unit-aware quantity handling,
- and responsive touch-first UX.
