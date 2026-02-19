/* ================================================================
   MAHALAKSHMI STORES - BILLING APP
   Tap-first UI upgrade with unchanged item lists/categories and PDF layout
================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    /* ==================== ITEM DATA (UNCHANGED LISTS) ==================== */
    const GROCERY_ITEMS = [
        { name: "Toor Dal Nalam Brand 1Kg" },
        { name: "Green Gram Nalam Brand 500g" },
        { name: "Urad Dal Maharaja Brand 500g" },
        { name: "Black Channa Nalam Brand 500g" },
        { name: "Peas Nalam Brand 500g" },
        { name: "Red Lobia Nalam Brand 500g" },
        { name: "Rajma Nalam Brand 500g" },
        { name: "Roast Peanuts Nalam Brand 500g" },
        { name: "Soya Chunks Sakthi Brand 200g" },
        { name: "Tata Salt 1Kg" },
        { name: "Sugar Tata Brand 1Kg" },
        { name: "Unrefined Sugar Nalam Brand 500g" },
        { name: "3 Roses Loose Tea Leaf 250g" },
        { baseName: "Amul Ghee", variants: ["200ml", "500ml"] },
        { name: "Mr Gold Groundnut Oil 1l" },
        { name: "Rice Maharaja Brand 26Kg" },
        { name: "Idly Rice Sri Krishna Brand 26Kg" },
        { baseName: "Atta Aashirvaad", variants: ["5kg", "10Kg"] },
        { name: "White Rava Nalam Brand 500g" },
        { name: "Samba Rava Nalam Brand 500g" },
        { name: "Vermicelli Anil Brand 450g" },
        { baseName: "Sakthi Chili Powder", variants: ["100g", "200g"] },
        { name: "Sakthi Turmeric Powder 100g" },
        { name: "Sakthi Coriander Powder 100g" },
        { baseName: "Sakthi Sambar Powder", variants: ["100g", "200g"] },
        { name: "Sakthi Garam Masala 100g" },
        { baseName: "Mustard Nalam Brand", variants: ["100g", "200g"] },
        { baseName: "Jeera Nalam Brand", variants: ["100g", "200g"] },
        { baseName: "Black Pepper Nalam Brand", variants: ["100g", "200g"] },
        { baseName: "Fenugreek Nalam Brand", variants: ["100g", "200g"] },
        { baseName: "LG Asafoetida", variants: ["50g", "200g"] },
        { name: "Dried Red Chili Nalam Brand 1Kg" },
        { name: "Tamarind Nalam Brand 1Kg" },
        { name: "Dry Masala Mix(clove, cinnamon, elaichi)" }
    ];

    const TOILETRY_ITEMS = [
        { name: "Harpic Red 500ml" },
        { name: "Domex Blue 500ml" },
        { name: "Lizol Floor Cleaner 500ml" },
        { name: "Domex Green 500ml" },
        { name: "Drainex Cleaner 50g" },
        { name: "Napthalene Balls" },
        { name: "Scotch Brite Steel Dishwash Scrub" },
        { name: "Scotch Brite Green Dishwash Scrub" },
        { name: "Surf Excel Powder 500g" },
        { name: "Fab liquid 1l" },
        { name: "Vim Dish wash Liquid 250ml" },
        { name: "Vim Bar 75g" },
        { name: "Surfexcel Soap 250g" },
        { name: "Rin Soap 250g" },
        { name: "Himalaya Almond & Rose Soap" },
        { name: "Dabur Red Toothpaste 100g" },
        { baseName: "Coconut Hair Oil", variants: ["100ml", "200ml"] },
        { name: "Dettol Handwash 500ml" },
        { name: "Dettol Sanitizer - Gel 500ml" },
        { name: "Mask 50Pack" },
        { name: "Odonil Air Freshner 48g" },
        { name: "Odonil Air freshner 48g x 4 Box" },
        { name: "Odonil Room Spray 150ml" },
        { name: "Premier Tissue Box" },
        { name: "Garbage Bag S Size" },
        { name: "Garbage Bag L Size" },
        { name: "Garbage Bag XL Size" },
        { name: "Garbage Bag XXL Size" }
    ];

    const DISINFECTIVE_ITEMS = [
        { baseName: "Dettol Liquid", variants: ["250ml", "500ml"] }
    ];

    /* ==================== STATE ==================== */
    const DRAFT_KEY = 'activeBillDraft';
    let uniqueId = 1;
    let currentMode = 'groceries';
    let billNos = getBillNosByCategory();
    let states = {
        groceries: buildState(GROCERY_ITEMS),
        toiletries: buildState(TOILETRY_ITEMS),
        disinfectives: buildState(DISINFECTIVE_ITEMS)
    };

    let deferredPrompt = null;
    let padContext = null;
    let searchQuery = '';

    const modeDecor = {
        groceries: { icon: 'Basket', accent: '#0f766e' },
        toiletries: { icon: 'Sparkle', accent: '#b45309' },
        disinfectives: { icon: 'Shield', accent: '#1d4ed8' }
    };

    /* ==================== DOM REFS ==================== */
    const itemsPanel = document.getElementById('itemsPanel');
    const totalDisplay = document.getElementById('totalDisplay');
    const pickedCount = document.getElementById('pickedCount');
    const billDateInput = document.getElementById('billDate');
    const billNoInput = document.getElementById('billNo');
    const recipientInput = document.getElementById('recipient');
    const installBtn = document.getElementById('installBtn');
    const itemSearchInput = document.getElementById('itemSearch');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const draftBadge = document.getElementById('draftBadge');
    const backToTopBtn = document.getElementById('backToTopBtn');

    const numericPad = document.getElementById('numericPad');
    const padTitle = document.getElementById('padTitle');
    const padValue = document.getElementById('padValue');
    const padGrid = document.getElementById('padGrid');

    /* ==================== INIT ==================== */
    billDateInput.value = new Date().toISOString().slice(0, 10);
    billNoInput.value = billNos[currentMode];
    hydrateDraftState();
    initNumberPad();
    wireInstallPrompt();
    renderCategoryTabs();
    syncActiveCategoryTab();
    wireWorkbench();
    renderItems();
    updateSummary();

    /* ==================== STORAGE HELPERS ==================== */
    function getDefaultRates() {
        try {
            return JSON.parse(localStorage.getItem('defaultRates') || '{}');
        } catch {
            return {};
        }
    }

    function saveDefaultRate(name, rate) {
        const rates = getDefaultRates();
        rates[name] = rate;
        localStorage.setItem('defaultRates', JSON.stringify(rates));
    }

    function getBillNosByCategory() {
        const defaults = { groceries: '92', toiletries: '93', disinfectives: '94' };
        try {
            const saved = JSON.parse(localStorage.getItem('billNosByCategory') || '{}');
            return {
                groceries: String(saved.groceries || defaults.groceries),
                toiletries: String(saved.toiletries || defaults.toiletries),
                disinfectives: String(saved.disinfectives || defaults.disinfectives)
            };
        } catch {
            return defaults;
        }
    }

    function persistBillNosByCategory() {
        localStorage.setItem('billNosByCategory', JSON.stringify(billNos));
    }

    function persistDraftState() {
        const draft = {
            version: 1,
            currentMode,
            billDate: billDateInput.value,
            recipient: recipientInput.value,
            billNos,
            states: {
                groceries: states.groceries.map(i => ({ displayName: i.displayName, rate: i.rate, qty: i.qty, isCustom: i.isCustom })),
                toiletries: states.toiletries.map(i => ({ displayName: i.displayName, rate: i.rate, qty: i.qty, isCustom: i.isCustom })),
                disinfectives: states.disinfectives.map(i => ({ displayName: i.displayName, rate: i.rate, qty: i.qty, isCustom: i.isCustom }))
            }
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        showDraftBadge('Auto-saved at ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }

    function hydrateDraftState() {
        try {
            const raw = localStorage.getItem(DRAFT_KEY);
            if (!raw) return;
            const draft = JSON.parse(raw);
            if (!draft || typeof draft !== 'object') return;

            if (draft.billNos && typeof draft.billNos === 'object') {
                billNos = {
                    groceries: String(draft.billNos.groceries || billNos.groceries),
                    toiletries: String(draft.billNos.toiletries || billNos.toiletries),
                    disinfectives: String(draft.billNos.disinfectives || billNos.disinfectives)
                };
                persistBillNosByCategory();
            }

            if (draft.states && typeof draft.states === 'object') {
                if (Array.isArray(draft.states.groceries)) states.groceries = normalizeLoadedItems(draft.states.groceries);
                if (Array.isArray(draft.states.toiletries)) states.toiletries = normalizeLoadedItems(draft.states.toiletries);
                if (Array.isArray(draft.states.disinfectives)) states.disinfectives = normalizeLoadedItems(draft.states.disinfectives);
            }

            if (draft.currentMode && ['groceries', 'toiletries', 'disinfectives'].includes(draft.currentMode)) {
                currentMode = draft.currentMode;
            }
            if (typeof draft.billDate === 'string' && draft.billDate) billDateInput.value = draft.billDate;
            if (typeof draft.recipient === 'string' && draft.recipient) recipientInput.value = draft.recipient;
            billNoInput.value = billNos[currentMode];
        } catch {
            // Ignore malformed draft and continue with defaults.
        }
    }

    function buildState(itemsList) {
        const defaults = getDefaultRates();
        return itemsList.map(item => {
            if (item.variants) {
                return item.variants.map(v => {
                    const displayName = item.baseName + ' ' + v;
                    return createItem(displayName, defaults[displayName] || 0, 0, false);
                });
            }
            const displayName = item.name;
            return [createItem(displayName, defaults[displayName] || 0, 0, false)];
        }).flat();
    }

    function createItem(displayName, rate, qty, isCustom) {
        return {
            id: uniqueId++,
            displayName,
            rate: Math.max(0, Math.round(Number(rate) || 0)),
            qty: Number(qty) || 0,
            amount: Math.max(0, Math.round(Number(rate) || 0)) * (Number(qty) || 0),
            isCustom: Boolean(isCustom)
        };
    }

    function getCurrentState() {
        return states[currentMode];
    }

    function normalizeLoadedItems(items) {
        return (items || []).map(i => createItem(i.displayName || 'Custom Item', i.rate || 0, i.qty || 0, i.isCustom));
    }

    /* ==================== RENDERING ==================== */
    function renderCategoryTabs() {
        document.querySelectorAll('.cat-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.dataset.mode === currentMode) return;
                billNos[currentMode] = billNoInput.value.trim() || billNos[currentMode];
                persistBillNosByCategory();
                currentMode = btn.dataset.mode;
                billNoInput.value = billNos[currentMode];
                syncActiveCategoryTab();
                renderItems();
                updateSummary();
                pulseModeAccent();
                persistDraftState();
            });
        });
    }

    function syncActiveCategoryTab() {
        document.querySelectorAll('.cat-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.mode === currentMode));
    }

    function renderItems() {
        const items = getCurrentState();
        const filteredItems = items.filter(item => {
            const passesSearch = !searchQuery || item.displayName.toLowerCase().includes(searchQuery);
            return passesSearch;
        });
        const accent = modeDecor[currentMode].accent;
        itemsPanel.style.setProperty('--mode-accent', accent);
        itemsPanel.innerHTML = '';

        if (filteredItems.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-state';
            empty.textContent = 'No items match this search. Try a shorter word or tap Clear Search.';
            itemsPanel.appendChild(empty);
            return;
        }

        filteredItems.forEach(item => {
            const card = document.createElement('article');
            card.className = 'item-card' + (item.qty > 0 ? ' active' : '') + (item.isCustom ? ' custom' : '');
            card.dataset.id = String(item.id);

            const top = document.createElement('div');
            top.className = 'item-top';

            const label = document.createElement('button');
            label.className = 'item-name';
            label.type = 'button';
            label.textContent = item.displayName;
            label.title = 'Tap to hear name';
            label.addEventListener('click', () => speak(item.displayName));

            const amount = document.createElement('div');
            amount.className = 'item-amount';
            amount.textContent = 'Rs.' + item.amount.toFixed(2);

            top.appendChild(label);
            top.appendChild(amount);

            const controls = document.createElement('div');
            controls.className = 'item-controls';

            controls.appendChild(buildStepper('Qty', item.qty, () => updateQty(item, item.qty - 1), () => updateQty(item, item.qty + 1), () => openPadForItem(item, 'qty')));
            controls.appendChild(buildStepper('Rate', item.rate, () => updateRate(item, item.rate - 5), () => updateRate(item, item.rate + 5), () => openPadForItem(item, 'rate')));

            if (item.isCustom) {
                const remove = document.createElement('button');
                remove.type = 'button';
                remove.className = 'remove-custom';
                remove.textContent = 'Remove custom item';
                remove.addEventListener('click', () => removeCustomItem(item.id));
                card.appendChild(remove);
            }

            card.appendChild(top);
            card.appendChild(controls);
            itemsPanel.appendChild(card);
        });
    }

    function buildStepper(labelText, valueText, onMinus, onPlus, onCenterTap) {
        const wrap = document.createElement('div');
        wrap.className = 'stepper';

        const label = document.createElement('span');
        label.className = 'stepper-label';
        label.textContent = labelText;

        const row = document.createElement('div');
        row.className = 'stepper-row';

        const minus = document.createElement('button');
        minus.type = 'button';
        minus.className = 'step-btn';
        minus.textContent = '-';
        minus.addEventListener('click', onMinus);

        const value = document.createElement('button');
        value.type = 'button';
        value.className = 'step-value';
        value.textContent = valueText;
        value.addEventListener('click', onCenterTap);

        const plus = document.createElement('button');
        plus.type = 'button';
        plus.className = 'step-btn';
        plus.textContent = '+';
        plus.addEventListener('click', onPlus);

        row.appendChild(minus);
        row.appendChild(value);
        row.appendChild(plus);

        wrap.appendChild(label);
        wrap.appendChild(row);
        return wrap;
    }

    function refreshItemCard(item) {
        const card = itemsPanel.querySelector('[data-id="' + item.id + '"]');
        if (!card) {
            if (searchQuery) renderItems();
            return;
        }
        card.querySelector('.item-amount').textContent = 'Rs.' + item.amount.toFixed(2);
        const values = card.querySelectorAll('.step-value');
        values[0].textContent = String(item.qty);
        values[1].textContent = String(item.rate);
        card.classList.toggle('active', item.qty > 0);
    }

    function pulseModeAccent() {
        document.body.classList.remove('pulse');
        void document.body.offsetWidth;
        document.body.classList.add('pulse');
    }

    function showDraftBadge(text) {
        if (!draftBadge) return;
        draftBadge.textContent = text;
    }

    function wireWorkbench() {
        showDraftBadge('Auto-save is on');

        const syncSearchControls = () => {
            const hasQuery = Boolean(searchQuery);
            if (!clearSearchBtn) return;
            clearSearchBtn.disabled = !hasQuery;
            clearSearchBtn.classList.toggle('is-disabled', !hasQuery);
        };

        itemSearchInput?.addEventListener('input', () => {
            searchQuery = itemSearchInput.value.trim().toLowerCase();
            syncSearchControls();
            renderItems();
        });

        clearSearchBtn?.addEventListener('click', () => {
            searchQuery = '';
            if (itemSearchInput) itemSearchInput.value = '';
            syncSearchControls();
            renderItems();
            itemSearchInput?.focus();
        });

        const onScrollUI = () => {
            const scrolled = window.scrollY || document.documentElement.scrollTop;
            document.body.classList.toggle('compact-top', scrolled > 70);
            if (backToTopBtn) backToTopBtn.classList.toggle('hidden', scrolled < 360);
        };
        window.addEventListener('scroll', onScrollUI, { passive: true });
        onScrollUI();

        backToTopBtn?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        syncSearchControls();
    }

    /* ==================== ITEM ACTIONS ==================== */
    function updateQty(item, nextQty) {
        item.qty = Math.max(0, Math.round(nextQty));
        item.amount = item.qty * item.rate;
        refreshItemCard(item);
        updateSummary();
        maybeCelebrate(item);
        persistDraftState();
    }

    function updateRate(item, nextRate) {
        item.rate = Math.max(0, Math.round(Number(nextRate) || 0));
        item.amount = item.qty * item.rate;
        if (item.rate > 0) saveDefaultRate(item.displayName, item.rate);
        refreshItemCard(item);
        updateSummary();
        persistDraftState();
    }

    function updateSummary() {
        const items = getCurrentState();
        const picked = items.filter(i => i.qty > 0 && i.rate > 0);
        const total = picked.reduce((sum, i) => sum + i.amount, 0);
        pickedCount.textContent = String(picked.length);
        totalDisplay.textContent = total.toFixed(2);
    }

    function removeCustomItem(id) {
        const items = getCurrentState();
        const idx = items.findIndex(i => i.id === id);
        if (idx >= 0) {
            items.splice(idx, 1);
            renderItems();
            updateSummary();
            persistDraftState();
        }
    }

    function maybeCelebrate(item) {
        if (item.qty === 1 && item.rate > 0) {
            softVibrate();
            flashToast('Added ' + item.displayName, 'success', 900);
        }
    }

    /* ==================== NUMBER PAD ==================== */
    function initNumberPad() {
        padGrid.innerHTML = '';
        const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];
        keys.forEach(k => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'pad-key';
            btn.textContent = k;
            btn.addEventListener('click', () => {
                if (!padContext) return;
                if (k === '.' && padContext.integerOnly) return;
                if (k === '.' && padContext.value.includes('.')) return;
                if (padContext.value === '0' && k !== '.') padContext.value = k;
                else padContext.value += k;
                syncPadValue();
            });
            padGrid.appendChild(btn);
        });

        const doubleZero = document.createElement('button');
        doubleZero.type = 'button';
        doubleZero.className = 'pad-key';
        doubleZero.textContent = '00';
        doubleZero.addEventListener('click', () => {
            if (!padContext) return;
            padContext.value = padContext.value === '0' ? '0' : padContext.value + '00';
            syncPadValue();
        });
        padGrid.appendChild(doubleZero);

        document.getElementById('padClear').addEventListener('click', () => {
            if (!padContext) return;
            padContext.value = '0';
            syncPadValue();
        });

        document.getElementById('padBack').addEventListener('click', () => {
            if (!padContext) return;
            padContext.value = padContext.value.length <= 1 ? '0' : padContext.value.slice(0, -1);
            syncPadValue();
        });

        document.getElementById('padOk').addEventListener('click', () => {
            if (!padContext) return;
            const parsed = padContext.integerOnly ? parseInt(padContext.value, 10) : parseFloat(padContext.value);
            padContext.apply(Number.isFinite(parsed) ? parsed : 0);
            closePad();
        });

        document.getElementById('closePad').addEventListener('click', closePad);
        document.querySelector('[data-close-sheet="true"]')?.addEventListener('click', closePad);
    }

    function openPadForItem(item, field) {
        const isQty = field === 'qty';
        padContext = {
            integerOnly: true,
            value: isQty ? String(item.qty) : String(item.rate),
            apply: value => {
                if (isQty) updateQty(item, value);
                else updateRate(item, value);
            }
        };
        padTitle.textContent = isQty
            ? 'Set Quantity for ' + item.displayName
            : 'Set Rate (Rs.) for ' + item.displayName;
        if (!padContext.value || Number(padContext.value) === 0) {
            padContext.value = '0';
        }
        syncPadValue();
        numericPad.classList.remove('hidden');
    }

    function syncPadValue() {
        if (!padContext) return;
        padValue.textContent = padContext.value;
    }

    function closePad() {
        numericPad.classList.add('hidden');
        padContext = null;
    }

    /* ==================== PDF GENERATION (LAYOUT KEPT) ==================== */
    function generatePDF() {
        const items = getCurrentState().filter(i => i.qty > 0 && i.rate > 0);
        if (items.length === 0) {
            showToast('No items with rate and quantity to print', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        // Page constants
        const PW = 210, PH = 297, M = 15;
        const LEFT = M, RIGHT = PW - M;

        // Column positions (left-edge of each column)
        const C = { sno: LEFT, item: LEFT + 12, rate: LEFT + 110, qty: LEFT + 132, amt: LEFT + 150 };

        // Vertical layout
        const HEADER_Y = 18;
        const META_LINE_Y = 35;
        const COL_HDR_Y = 47;
        const DATA_START_Y = 52;
        const ROW_H = 8;
        const FOOTER_Y = PH - M - 3;
        const GRAND_TOTAL_H = 10;

        // Rows per page
        const maxRows = Math.floor((FOOTER_Y - DATA_START_Y - GRAND_TOTAL_H) / ROW_H);
        let rowsPerPage = Math.min(maxRows, 30);

        // Smart fit: avoid <=2 orphan items on last page
        let totalPages = Math.ceil(items.length / rowsPerPage);
        if (totalPages > 1) {
            const lastCount = items.length - (totalPages - 1) * rowsPerPage;
            if (lastCount <= 2) {
                rowsPerPage = Math.ceil(items.length / totalPages);
            }
        }
        totalPages = Math.ceil(items.length / rowsPerPage);

        // Bill info
        const billNo = billNoInput.value || '-';
        const recipient = recipientInput.value || 'Access Life Assistance';
        const dateStr = formatDateForPDF(billDateInput.value);
        const catLabel = { groceries: 'Groceries', toiletries: 'Toiletries', disinfectives: 'Disinfectives' }[currentMode];
        const grandTotal = items.reduce((s, i) => s + i.amount, 0);

        let sNo = 1;

        for (let pg = 0; pg < totalPages; pg++) {
            if (pg > 0) doc.addPage();

            // HEADER
            doc.setFontSize(9); doc.setFont('helvetica', 'normal');
            doc.text('From', LEFT, HEADER_Y);
            doc.text('To', RIGHT, HEADER_Y, { align: 'right' });

            doc.setFontSize(15); doc.setFont('helvetica', 'bold');
            doc.text('Mahalakshmi Stores', LEFT, HEADER_Y + 5);

            doc.setFontSize(11.5); doc.setFont('helvetica', 'bold');
            doc.text(recipient, RIGHT, HEADER_Y + 5, { align: 'right' });

            doc.setFontSize(9.5); doc.setFont('helvetica', 'normal');
            doc.text('4 Bunglow Building, Nanjundapuram Road', LEFT, HEADER_Y + 9);
            doc.text('Coimbatore - 641036', LEFT, HEADER_Y + 13);
            doc.text('Coimbatore - 641036', RIGHT, HEADER_Y + 9, { align: 'right' });

            // BILL META
            doc.setLineWidth(0.4);
            doc.line(LEFT, META_LINE_Y, RIGHT, META_LINE_Y);
            doc.setFontSize(10.5); doc.setFont('helvetica', 'bold');
            doc.text('Bill No: ' + billNo + ' (' + catLabel + ')', LEFT, META_LINE_Y + 4.5);
            doc.text(dateStr, RIGHT, META_LINE_Y + 4.5, { align: 'right' });
            doc.line(LEFT, META_LINE_Y + 7, RIGHT, META_LINE_Y + 7);

            // COLUMN HEADERS
            doc.setFontSize(10.5); doc.setFont('helvetica', 'bold');
            doc.text('S.No', C.sno + 6, COL_HDR_Y, { align: 'center' });
            doc.text('Item', C.item, COL_HDR_Y);
            doc.text('Rate(Rs.)', C.rate + 12, COL_HDR_Y, { align: 'right' });
            doc.text('Qty', C.qty + 10, COL_HDR_Y, { align: 'center' });
            doc.text('Amount(Rs.)', RIGHT, COL_HDR_Y, { align: 'right' });

            doc.setLineWidth(0.2);
            doc.line(LEFT, COL_HDR_Y + 2, RIGHT, COL_HDR_Y + 2);

            // DATA ROWS
            let y = DATA_START_Y;
            const start = pg * rowsPerPage;
            const end = Math.min(start + rowsPerPage, items.length);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10.5);

            for (let i = start; i < end; i++) {
                const it = items[i];
                doc.text(String(sNo), C.sno + 6, y, { align: 'center' });
                doc.text(it.displayName, C.item, y);
                doc.text(String(Math.round(it.rate)), C.rate + 12, y, { align: 'right' });
                doc.text(String(it.qty) + ' Pcs', C.qty + 10, y, { align: 'center' });
                doc.text(it.amount.toFixed(2), RIGHT, y, { align: 'right' });
                sNo++;
                y += ROW_H;
            }

            // GRAND TOTAL (last page)
            if (pg === totalPages - 1) {
                y += 2;
                doc.setLineWidth(0.4);
                doc.line(LEFT, y, RIGHT, y);
                y += 5;
                doc.setFontSize(11); doc.setFont('helvetica', 'bold');
                doc.text('Grand Total', C.amt - 3, y, { align: 'right' });
                doc.text('Rs.' + grandTotal.toFixed(2), RIGHT, y, { align: 'right' });
                y += 2;
                doc.line(LEFT, y, RIGHT, y);
            }

            // FOOTER
            doc.setFontSize(7.5); doc.setFont('helvetica', 'normal');
            doc.text('Page ' + (pg + 1) + ' of ' + totalPages, RIGHT, FOOTER_Y, { align: 'right' });
        }

        const filename = 'Invoice_' + billNo + '_' + catLabel + '.pdf';
        doc.save(filename);
        showToast('PDF downloaded: ' + filename);
    }

    /* ==================== SAVE / LOAD ==================== */
    function saveBill() {
        const billNo = billNoInput.value.trim();
        if (!billNo) {
            showToast('Enter a bill number first', 'error');
            return;
        }

        const catLabel = { groceries: 'Groceries', toiletries: 'Toiletries', disinfectives: 'Disinfectives' }[currentMode];
        const key = 'bill_' + billNo + '_' + catLabel;
        const data = {
            billNo,
            category: currentMode,
            catLabel,
            date: billDateInput.value,
            recipient: recipientInput.value,
            items: getCurrentState().map(i => ({
                displayName: i.displayName,
                rate: i.rate,
                qty: i.qty,
                amount: i.amount,
                isCustom: i.isCustom
            })),
            total: getCurrentState().reduce((s, i) => s + i.amount, 0),
            savedAt: new Date().toISOString()
        };

        localStorage.setItem(key, JSON.stringify(data));
        showToast('Bill saved');
        softVibrate();
    }

    function loadBill(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            if (!data) return;

            currentMode = data.category || 'groceries';
            syncActiveCategoryTab();

            billNoInput.value = data.billNo || '';
            billNos[currentMode] = billNoInput.value || billNos[currentMode];
            persistBillNosByCategory();
            billDateInput.value = data.date || new Date().toISOString().slice(0, 10);
            recipientInput.value = data.recipient || 'Access Life Assistance';

            states[currentMode] = normalizeLoadedItems(data.items);
            renderItems();
            updateSummary();
            persistDraftState();
            closeLoadModal();
            showToast('Loaded bill #' + (data.billNo || ''));
        } catch {
            showToast('Failed to load bill', 'error');
        }
    }

    function showLoadModal() {
        const list = document.getElementById('billList');
        const keys = [];

        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith('bill_')) keys.push(k);
        }

        if (keys.length === 0) {
            list.innerHTML = '<div class="bill-list-empty">No saved bills yet</div>';
        } else {
            const bills = keys.map(k => {
                try {
                    return { key: k, ...JSON.parse(localStorage.getItem(k)) };
                } catch {
                    return null;
                }
            }).filter(Boolean);

            bills.sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));

            list.innerHTML = bills.map(b => {
                const itemCount = Array.isArray(b.items) ? b.items.filter(i => (i.qty || 0) > 0).length : 0;
                return '<article class="bill-card">' +
                    '<div class="bill-main">' +
                    '<strong>Bill #' + (b.billNo || '-') + ' (' + (b.catLabel || b.category || '-') + ')</strong>' +
                    '<span>' + (b.date || '') + ' | ' + itemCount + ' items</span>' +
                    '</div>' +
                    '<div class="bill-actions">' +
                    '<strong>Rs.' + ((b.total || 0).toFixed(2)) + '</strong>' +
                    '<button class="btn-load-bill" data-key="' + b.key + '">Load</button>' +
                    '<button class="btn-delete-bill" data-key="' + b.key + '">Delete</button>' +
                    '</div>' +
                    '</article>';
            }).join('');

            list.querySelectorAll('.btn-load-bill').forEach(btn => {
                btn.addEventListener('click', () => loadBill(btn.dataset.key));
            });

            list.querySelectorAll('.btn-delete-bill').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (!confirm('Delete this saved bill?')) return;
                    localStorage.removeItem(btn.dataset.key);
                    showLoadModal();
                });
            });
        }

        document.getElementById('loadModal').classList.remove('hidden');
    }

    function closeLoadModal() {
        document.getElementById('loadModal').classList.add('hidden');
    }

    /* ==================== CSV EXPORT ==================== */
    function exportCSV() {
        const items = getCurrentState().filter(i => i.qty > 0 && i.rate > 0);
        if (items.length === 0) {
            showToast('No items to export', 'error');
            return;
        }

        const catLabel = { groceries: 'Groceries', toiletries: 'Toiletries', disinfectives: 'Disinfectives' }[currentMode];
        let csv = 'S.No,Item,Rate,Qty,Amount\n';

        items.forEach((it, i) => {
            csv += (i + 1) + ',"' + it.displayName.replace(/"/g, '""') + '",' + Math.round(it.rate) + ',' + it.qty + ',' + it.amount.toFixed(2) + '\n';
        });

        const total = items.reduce((s, i) => s + i.amount, 0);
        csv += ',,,,\n';
        csv += ',Grand Total,,,' + total.toFixed(2) + '\n';

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Invoice_' + (billNoInput.value || 'export') + '_' + catLabel + '.csv';
        a.click();
        URL.revokeObjectURL(url);
        showToast('CSV exported');
    }

    /* ==================== AUX ACTIONS ==================== */
    function addCustomItem() {
        const name = prompt('Enter custom item name');
        if (!name || !name.trim()) return;
        getCurrentState().push(createItem(name.trim(), 0, 0, true));
        renderItems();
        persistDraftState();
    }

    function resetCurrentBill() {
        if (!confirm('Clear rates and quantities for this category?')) return;
        getCurrentState().forEach(item => {
            item.qty = 0;
            item.rate = item.isCustom ? 0 : item.rate;
            item.amount = 0;
        });
        states[currentMode] = states[currentMode].filter(item => !item.isCustom);
        renderItems();
        updateSummary();
        persistDraftState();
        showToast('Category reset');
    }

    function formatDateForPDF(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr + 'T00:00:00');
        const day = String(d.getDate()).padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return day + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    }

    function showToast(msg, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.className = 'toast ' + type;
        clearTimeout(showToast._timer);
        showToast._timer = setTimeout(() => toast.classList.add('hidden'), 2200);
    }

    function flashToast(msg, type = 'success', timeout = 1200) {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.className = 'toast ' + type;
        clearTimeout(showToast._timer);
        showToast._timer = setTimeout(() => toast.classList.add('hidden'), timeout);
    }

    function softVibrate() {
        if (navigator.vibrate) navigator.vibrate(18);
    }

    function speak(text) {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 1;
        utter.pitch = 1;
        window.speechSynthesis.speak(utter);
    }

    function wireInstallPrompt() {
        window.addEventListener('beforeinstallprompt', e => {
            e.preventDefault();
            deferredPrompt = e;
            installBtn.classList.remove('hidden');
        });

        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
            installBtn.classList.add('hidden');
        });

        window.addEventListener('appinstalled', () => {
            showToast('App installed');
            installBtn.classList.add('hidden');
        });
    }

    /* ==================== WIRE BUTTONS ==================== */
    document.getElementById('pdfBtn').addEventListener('click', generatePDF);
    document.getElementById('saveBtn').addEventListener('click', saveBill);
    document.getElementById('loadBtn').addEventListener('click', showLoadModal);
    document.getElementById('csvBtn').addEventListener('click', exportCSV);
    document.getElementById('addItemBtn').addEventListener('click', addCustomItem);
    document.getElementById('resetBtn').addEventListener('click', resetCurrentBill);
    document.getElementById('closeModal').addEventListener('click', closeLoadModal);
    document.querySelector('[data-close-load="true"]')?.addEventListener('click', closeLoadModal);
    billNoInput.addEventListener('input', () => {
        billNos[currentMode] = billNoInput.value.trim() || billNos[currentMode];
        persistBillNosByCategory();
        persistDraftState();
    });
    billDateInput.addEventListener('input', persistDraftState);
    recipientInput.addEventListener('input', persistDraftState);
});
