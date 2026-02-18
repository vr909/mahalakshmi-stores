/* ================================================================
   MAHALAKSHMI STORES — BILLING APP v2
   Programmatic PDF via jsPDF (device-independent)
================================================================ */
document.addEventListener('DOMContentLoaded', () => {

    /* ==================== ITEM DATA ==================== */
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
        { name: "Odonil Room Spray 50ml" },
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
    let currentMode = 'groceries';
    let states = {
        groceries: buildState(GROCERY_ITEMS),
        toiletries: buildState(TOILETRY_ITEMS),
        disinfectives: buildState(DISINFECTIVE_ITEMS)
    };

    /* ==================== DOM REFS ==================== */
    const tableBody = document.getElementById('tableBody');
    const totalDisplay = document.getElementById('totalDisplay');
    const billDateInput = document.getElementById('billDate');
    const billNoInput = document.getElementById('billNo');
    const recipientInput = document.getElementById('recipient');

    // Set today's date
    billDateInput.value = new Date().toISOString().slice(0, 10);

    /* ==================== DEFAULT RATES ==================== */
    function getDefaultRates() {
        try { return JSON.parse(localStorage.getItem('defaultRates') || '{}'); }
        catch { return {}; }
    }
    function saveDefaultRate(name, rate) {
        const rates = getDefaultRates();
        rates[name] = rate;
        localStorage.setItem('defaultRates', JSON.stringify(rates));
    }

    /* ==================== STATE BUILDERS ==================== */
    function buildState(itemsList) {
        const defaults = getDefaultRates();
        return itemsList.map(item => {
            if (item.variants) {
                return item.variants.map(v => {
                    const displayName = item.baseName + ' ' + v;
                    return { displayName, rate: defaults[displayName] || 0, qty: 0, amount: 0, isCustom: false };
                });
            }
            const displayName = item.name;
            return [{ displayName, rate: defaults[displayName] || 0, qty: 0, amount: 0, isCustom: false }];
        }).flat();
    }

    function getCurrentState() { return states[currentMode]; }

    /* ==================== RENDER TABLE ==================== */
    function renderTable() {
        const items = getCurrentState();
        tableBody.innerHTML = '';

        items.forEach((item, idx) => {
            const tr = document.createElement('tr');
            if (item.isCustom) tr.className = 'custom-row';

            // Item name
            const tdName = document.createElement('td');
            tdName.textContent = item.displayName;
            if (item.isCustom) {
                const del = document.createElement('button');
                del.className = 'btn-delete-row';
                del.textContent = '✕';
                del.onclick = () => { items.splice(idx, 1); renderTable(); updateTotal(); };
                tdName.appendChild(del);
            }
            tr.appendChild(tdName);

            // Rate
            const tdRate = document.createElement('td');
            tdRate.className = 'td-rate';
            const rateInput = document.createElement('input');
            rateInput.type = 'number';
            rateInput.min = '0';
            rateInput.step = '0.01';
            rateInput.value = item.rate || '';
            rateInput.placeholder = '0';
            rateInput.style.textAlign = 'right';
            rateInput.addEventListener('input', () => {
                item.rate = parseFloat(rateInput.value) || 0;
                item.amount = item.rate * item.qty;
                amtCell.textContent = item.amount ? '₹' + item.amount.toFixed(2) : '';
                updateTotal();
                if (item.rate > 0) saveDefaultRate(item.displayName, item.rate);
            });
            tdRate.appendChild(rateInput);
            tr.appendChild(tdRate);

            // Qty
            const tdQty = document.createElement('td');
            tdQty.className = 'td-qty';
            const qtyInput = document.createElement('input');
            qtyInput.type = 'number';
            qtyInput.min = '0';
            qtyInput.step = '1';
            qtyInput.value = item.qty || '';
            qtyInput.placeholder = '0';
            qtyInput.style.textAlign = 'center';
            qtyInput.addEventListener('input', () => {
                item.qty = parseInt(qtyInput.value) || 0;
                item.amount = item.rate * item.qty;
                amtCell.textContent = item.amount ? '₹' + item.amount.toFixed(2) : '';
                updateTotal();
            });
            tdQty.appendChild(qtyInput);
            tr.appendChild(tdQty);

            // Amount (read-only)
            const tdAmt = document.createElement('td');
            tdAmt.className = 'td-amt';
            const amtCell = tdAmt;
            tdAmt.textContent = item.amount ? '₹' + item.amount.toFixed(2) : '';
            tr.appendChild(tdAmt);

            tableBody.appendChild(tr);
        });
    }

    function updateTotal() {
        const total = getCurrentState().reduce((s, i) => s + i.amount, 0);
        totalDisplay.textContent = total.toFixed(2);
    }

    /* ==================== TAB SWITCHING ==================== */
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelector('.tab.active').classList.remove('active');
            tab.classList.add('active');
            currentMode = tab.dataset.mode;
            renderTable();
            updateTotal();
        });
    });

    /* ==================== ADD CUSTOM ITEM ==================== */
    document.getElementById('addItemBtn').addEventListener('click', () => {
        const name = prompt('Enter item name:');
        if (!name || !name.trim()) return;
        getCurrentState().push({ displayName: name.trim(), rate: 0, qty: 0, amount: 0, isCustom: true });
        renderTable();
    });

    /* ==================== PDF GENERATION (jsPDF) ==================== */
    function generatePDF() {
        const items = getCurrentState().filter(i => i.qty > 0 && i.rate > 0);
        if (items.length === 0) { showToast('No items with rate & quantity to print', 'error'); return; }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        // Page constants
        const PW = 210, PH = 297, M = 15;
        const LEFT = M, RIGHT = PW - M;
        const CONTENT_W = RIGHT - LEFT; // 180mm

        // Column positions (left-edge of each column)
        const C = { sno: LEFT, item: LEFT + 12, rate: LEFT + 110, qty: LEFT + 132, amt: LEFT + 150 };

        // Vertical layout
        const HEADER_Y = 18;           // start of header text
        const META_LINE_Y = 35;        // horizontal rule above bill meta
        const COL_HDR_Y = 47;          // column header text
        const DATA_START_Y = 52;       // first data row
        const ROW_H = 8;
        const FOOTER_Y = PH - M - 3;  // 279mm
        const GRAND_TOTAL_H = 10;

        // Rows per page
        const maxRows = Math.floor((FOOTER_Y - DATA_START_Y - GRAND_TOTAL_H) / ROW_H);
        let rowsPerPage = Math.min(maxRows, 30);

        // Smart fit: avoid ≤2 orphan items on last page
        let totalPages = Math.ceil(items.length / rowsPerPage);
        if (totalPages > 1) {
            const lastCount = items.length - (totalPages - 1) * rowsPerPage;
            if (lastCount <= 2) {
                rowsPerPage = Math.ceil(items.length / totalPages);
            }
        }
        totalPages = Math.ceil(items.length / rowsPerPage);

        // Bill info
        const billNo = billNoInput.value || '—';
        const recipient = recipientInput.value || 'Access Life Assistance';
        const dateStr = formatDateForPDF(billDateInput.value);
        const catLabel = { groceries: 'Groceries', toiletries: 'Toiletries', disinfectives: 'Disinfectives' }[currentMode];
        const grandTotal = items.reduce((s, i) => s + i.amount, 0);

        let sNo = 1;

        for (let pg = 0; pg < totalPages; pg++) {
            if (pg > 0) doc.addPage();

            // ── HEADER ──
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

            // ── BILL META ──
            doc.setLineWidth(0.4);
            doc.line(LEFT, META_LINE_Y, RIGHT, META_LINE_Y);
            doc.setFontSize(10.5); doc.setFont('helvetica', 'bold');
            doc.text('Bill No: ' + billNo + ' (' + catLabel + ')', LEFT, META_LINE_Y + 4.5);
            doc.text(dateStr, RIGHT, META_LINE_Y + 4.5, { align: 'right' });
            doc.line(LEFT, META_LINE_Y + 7, RIGHT, META_LINE_Y + 7);

            // ── COLUMN HEADERS ──
            doc.setFontSize(10.5); doc.setFont('helvetica', 'bold');
            doc.text('S.No', C.sno + 6, COL_HDR_Y, { align: 'center' });
            doc.text('Item', C.item, COL_HDR_Y);
            doc.text('Rate(Rs.)', C.rate + 12, COL_HDR_Y, { align: 'right' });
            doc.text('Qty', C.qty + 10, COL_HDR_Y, { align: 'center' });
            doc.text('Amount(Rs.)', RIGHT, COL_HDR_Y, { align: 'right' });

            doc.setLineWidth(0.2);
            doc.line(LEFT, COL_HDR_Y + 2, RIGHT, COL_HDR_Y + 2);

            // ── DATA ROWS ──
            let y = DATA_START_Y;
            const start = pg * rowsPerPage;
            const end = Math.min(start + rowsPerPage, items.length);

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10.5);

            for (let i = start; i < end; i++) {
                const it = items[i];
                doc.text(String(sNo), C.sno + 6, y, { align: 'center' });
                doc.text(it.displayName, C.item, y);
                doc.text(it.rate.toFixed(2), C.rate + 12, y, { align: 'right' });
                doc.text(String(it.qty) + ' Pcs', C.qty + 10, y, { align: 'center' });
                doc.text(it.amount.toFixed(2), RIGHT, y, { align: 'right' });
                sNo++;
                y += ROW_H;
            }

            // ── GRAND TOTAL (last page) ──
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

            // ── FOOTER ──
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
        if (!billNo) { showToast('Enter a bill number first', 'error'); return; }
        const catLabel = { groceries: 'Groceries', toiletries: 'Toiletries', disinfectives: 'Disinfectives' }[currentMode];
        const key = 'bill_' + billNo + '_' + catLabel;
        const data = {
            billNo, category: currentMode, catLabel,
            date: billDateInput.value,
            recipient: recipientInput.value,
            items: getCurrentState().map(i => ({ displayName: i.displayName, rate: i.rate, qty: i.qty, amount: i.amount, isCustom: i.isCustom })),
            total: getCurrentState().reduce((s, i) => s + i.amount, 0),
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(key, JSON.stringify(data));
        showToast('Bill saved: ' + key);
    }

    function loadBill(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key));
            if (!data) return;
            // Switch to the right category
            currentMode = data.category;
            document.querySelectorAll('.tab').forEach(t => {
                t.classList.toggle('active', t.dataset.mode === currentMode);
            });
            // Restore bill info
            billNoInput.value = data.billNo || '';
            billDateInput.value = data.date || '';
            recipientInput.value = data.recipient || 'Access Life Assistance';
            // Restore state
            states[currentMode] = data.items;
            renderTable();
            updateTotal();
            closeModal();
            showToast('Loaded: Bill #' + data.billNo + ' (' + data.catLabel + ')');
        } catch (e) { showToast('Failed to load bill', 'error'); }
    }

    function showLoadModal() {
        const list = document.getElementById('billList');
        const keys = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k.startsWith('bill_')) keys.push(k);
        }

        if (keys.length === 0) {
            list.innerHTML = '<div class="bill-list-empty">No saved bills</div>';
        } else {
            // Sort by savedAt descending
            const bills = keys.map(k => { try { return { key: k, ...JSON.parse(localStorage.getItem(k)) }; } catch { return null; } }).filter(Boolean);
            bills.sort((a, b) => (b.savedAt || '').localeCompare(a.savedAt || ''));

            list.innerHTML = bills.map(b => `
            <div class="bill-card">
                <div class="bill-card-info">
                    <span class="bill-card-title">Bill #${b.billNo} (${b.catLabel || b.category})</span>
                    <span class="bill-card-meta">${b.date || ''} &middot; ${b.items ? b.items.filter(i => i.qty > 0).length : 0} items</span>
                </div>
                <div class="bill-card-actions">
                    <span class="bill-card-total">₹${(b.total || 0).toFixed(2)}</span>
                    <button class="btn-load-bill" data-key="${b.key}">Load</button>
                    <button class="btn-delete-bill" data-key="${b.key}">🗑</button>
                </div>
            </div>
        `).join('');

            list.querySelectorAll('.btn-load-bill').forEach(btn => btn.addEventListener('click', () => loadBill(btn.dataset.key)));
            list.querySelectorAll('.btn-delete-bill').forEach(btn => btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Delete this bill?')) {
                    localStorage.removeItem(btn.dataset.key);
                    showLoadModal();
                }
            }));
        }

        document.getElementById('loadModal').classList.remove('hidden');
    }

    function closeModal() { document.getElementById('loadModal').classList.add('hidden'); }

    /* ==================== CSV EXPORT ==================== */
    function exportCSV() {
        const items = getCurrentState().filter(i => i.qty > 0 && i.rate > 0);
        if (items.length === 0) { showToast('No items to export', 'error'); return; }
        const catLabel = { groceries: 'Groceries', toiletries: 'Toiletries', disinfectives: 'Disinfectives' }[currentMode];

        let csv = 'S.No,Item,Rate,Qty,Amount\n';
        items.forEach((it, i) => {
            csv += (i + 1) + ',"' + it.displayName.replace(/"/g, '""') + '",' + it.rate.toFixed(2) + ',' + it.qty + ',' + it.amount.toFixed(2) + '\n';
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

    /* ==================== HELPERS ==================== */
    function formatDateForPDF(dateStr) {
        if (!dateStr) return '—';
        const d = new Date(dateStr + 'T00:00:00');
        const day = String(d.getDate()).padStart(2, '0');
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return day + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
    }

    function showToast(msg, type) {
        const t = document.getElementById('toast');
        t.textContent = msg;
        t.className = 'toast' + (type === 'error' ? ' error' : '');
        setTimeout(() => t.classList.add('hidden'), 2500);
    }

    /* ==================== WIRE UP BUTTONS ==================== */
    document.getElementById('pdfBtn').addEventListener('click', generatePDF);
    document.getElementById('saveBtn').addEventListener('click', saveBill);
    document.getElementById('loadBtn').addEventListener('click', showLoadModal);
    document.getElementById('csvBtn').addEventListener('click', exportCSV);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);

    /* ==================== INIT ==================== */
    renderTable();

}); // end DOMContentLoaded
