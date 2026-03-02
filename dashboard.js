const firebaseConfig = {
    apiKey: "AIzaSyDIzwGsBDqLQRdvpD2He9sCWkL1BAGgQqI",
    authDomain: "price-d178c.firebaseapp.com",
    databaseURL: "https://price-d178c-default-rtdb.firebaseio.com",
    projectId: "price-d178c",
    storageBucket: "price-d178c.firebasestorage.app",
    messagingSenderId: "1037469586124",
    appId: "1:1037469586124:web:5ff1ed04d1680bece0e869",
    measurementId: "G-R9B1BFXTYX"
};

let app, auth, db, dbRef;
if (typeof firebase !== 'undefined') {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.database();
    dbRef = db.ref('price123_database');
}

let database = [];
const rowsPerPage = 20;
let currentPage = 1;
const totalColumns = 29;

function saveData() {
    try {
        localStorage.setItem('price123_database', JSON.stringify(database));
    } catch (e) { }

    if (dbRef && Array.isArray(database)) {
        dbRef.set(database);
    }
}

function updateFromDatabase() {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;

    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, database.length);
    if (tbody.children.length !== (endIdx - startIdx)) {
        renderTable();
        return;
    }

    for (let r = startIdx, i = 0; r < endIdx; r++, i++) {
        const tr = tbody.children[i];
        if (!database[r] || !Array.isArray(database[r])) continue;

        for (let c = 0; c < totalColumns; c++) {
            if (c === 0) {
                if (tr.children[c].textContent != database[r][c]) {
                    tr.children[c].textContent = database[r][c];
                }
            } else {
                const td = tr.children[c];
                if (!td) continue;
                const input = td.querySelector('input');
                if (input && document.activeElement !== input) {
                    if (input.value !== (database[r][c] || '')) {
                        input.value = database[r][c] || '';
                    }
                }
            }
        }
    }
}

function init() {
    const savedData = localStorage.getItem('price123_database');
    let shouldWipe = false;

    if (savedData) {
        try {
            database = JSON.parse(savedData);
            if (!Array.isArray(database)) {
                shouldWipe = true;
            } else {
                for (let i = 0; i < database.length; i++) {
                    if (!Array.isArray(database[i])) {
                        shouldWipe = true;
                        break;
                    }
                }
            }
        } catch (e) {
            shouldWipe = true;
        }
    } else {
        shouldWipe = true;
    }

    if (shouldWipe) {
        database = [];
    }

    if (database.length === 0) {
        addRows(20);
    } else {
        renderTable();
    }

    if (auth && dbRef) {
        auth.signInAnonymously().then(() => {
            dbRef.on('value', (snapshot) => {
                const val = snapshot.val();
                if (val && Array.isArray(val)) {
                    database = val;
                    updateFromDatabase();
                } else if (!val && database.length > 0) {
                    saveData();
                }
            });
        }).catch((err) => {
            console.error(err);
        });
    }
}

function addRows(count) {
    for (let i = 0; i < count; i++) {
        const row = new Array(totalColumns).fill('');
        database.push(row);
    }
    updateSerialNumbers();
    renderTable();

    if (count === 50) {
        currentPage = Math.ceil(database.length / rowsPerPage);
        renderTable();
        alert(`50 rows added successfully!`);
    }
    saveData();
}

function updateSerialNumbers() {
    for (let i = 0; i < database.length; i++) {
        database[i][0] = i + 1;
    }
}

function deleteAll() {
    if (confirm("Are you sure you want to delete ALL data? This action cannot be undone.")) {
        database = [];
        currentPage = 1;
        saveData();
        addRows(20);
        alert("All data deleted!");
    }
}

function updateCell(rowIndex, colIndex, value) {
    database[rowIndex][colIndex] = value;
    saveData();
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = Math.min(startIdx + rowsPerPage, database.length);

    const dateColumns = [1, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28];

    for (let r = startIdx; r < endIdx; r++) {
        const tr = document.createElement('tr');

        for (let c = 0; c < totalColumns; c++) {
            const td = document.createElement('td');

            if (c === 0) {
                td.textContent = database[r][c];
                td.classList.add('readonly-cell');
            } else {
                const input = document.createElement('input');

                if (dateColumns.includes(c)) {
                    input.type = 'date';
                } else {
                    input.type = 'text';
                }

                input.value = database[r][c] || '';
                input.oninput = (e) => updateCell(r, c, e.target.value);

                td.appendChild(input);
            }
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }

    updatePaginationControls();
}

function updatePaginationControls() {
    const totalPages = Math.ceil(database.length / rowsPerPage);
    const pageInfo = document.getElementById('page-info');
    if (pageInfo) pageInfo.textContent = `Page ${currentPage} of ${totalPages || 1}`;

    const prevBtn = document.getElementById('prev-btn');
    if (prevBtn) prevBtn.disabled = currentPage === 1;

    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTable();
    }
}

function nextPage() {
    const totalPages = Math.ceil(database.length / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        renderTable();
    }
}

function logout() {
    window.location.href = 'index.html';
}

function switchTab(tab) {
    document.getElementById('data-entry-view').style.display = 'none';
    document.getElementById('report-view').style.display = 'none';
    const liveDesignView = document.getElementById('live-design-view');
    if (liveDesignView) liveDesignView.style.display = 'none';
    const notLiveDesignView = document.getElementById('not-live-design-view');
    if (notLiveDesignView) notLiveDesignView.style.display = 'none';

    document.getElementById('nav-data-entry').classList.remove('active');
    document.getElementById('nav-report').classList.remove('active');
    const liveDesignNav = document.getElementById('nav-live-design');
    if (liveDesignNav) liveDesignNav.classList.remove('active');
    const notLiveDesignNav = document.getElementById('nav-not-live-design');
    if (notLiveDesignNav) notLiveDesignNav.classList.remove('active');

    if (tab === 'data-entry') {
        document.getElementById('data-entry-view').style.display = 'flex';
        document.getElementById('nav-data-entry').classList.add('active');
        renderTable();
    } else if (tab === 'report') {
        document.getElementById('report-view').style.display = 'flex';
        document.getElementById('nav-report').classList.add('active');
        const reportContainer = document.querySelector('#report-view .table-container');
        if (reportContainer) reportContainer.style.display = 'none';
    } else if (tab === 'live-design') {
        if (liveDesignView) liveDesignView.style.display = 'flex';
        if (liveDesignNav) liveDesignNav.classList.add('active');
        const liveContainer = document.querySelector('#live-design-view .table-container');
        if (liveContainer) liveContainer.style.display = 'none';
    } else if (tab === 'not-live-design') {
        if (notLiveDesignView) notLiveDesignView.style.display = 'flex';
        if (notLiveDesignNav) notLiveDesignNav.classList.add('active');
        const notLiveContainer = document.querySelector('#not-live-design-view .table-container');
        if (notLiveContainer) notLiveContainer.style.display = 'none';
    }
}

function generateReport() {
    const startStr = document.getElementById('report-start').value;
    const endStr = document.getElementById('report-end').value;

    if (!startStr || !endStr) {
        alert("Please select both Start Date and End Date to generate the report.");
        return;
    }

    const reportContainer = document.querySelector('#report-view .table-container');
    if (reportContainer) reportContainer.style.display = 'block';

    const startObj = new Date(startStr);
    const endObj = new Date(endStr);

    startObj.setHours(0, 0, 0, 0);
    endObj.setHours(23, 59, 59, 999);

    const reportData = [];

    const platforms = [
        { index: 3, name: 'AJIO' },
        { index: 5, name: 'AJIO DE' },
        { index: 7, name: 'AJIO TANUKA' },
        { index: 9, name: 'AMZONE' },
        { index: 11, name: 'MY DE' },
        { index: 13, name: 'MY JIHU' },
        { index: 15, name: 'T CENTER' },
        { index: 17, name: 'WEBSITE HONEST' },
        { index: 19, name: 'RTW' },
        { index: 21, name: 'MS' },
        { index: 23, name: 'BB' },
        { index: 25, name: 'DREAM' },
        { index: 27, name: 'TRENDY CLUTURE' }
    ];

    database.forEach(row => {
        const rowDateStr = row[1]; // Column index 1 is 'DATE'
        const designNo = row[2] ? String(row[2]).trim() : '';

        if (!designNo) return;

        let includeRow = true;
        if (startObj || endObj) {
            if (!rowDateStr) {
                includeRow = false;
            } else {
                const rowDate = new Date(rowDateStr);
                if (startObj && rowDate < startObj) includeRow = false;
                if (endObj && rowDate > endObj) includeRow = false;
            }
        }

        if (includeRow) {
            const rowArr = Array(platforms.length).fill(0);

            platforms.forEach((p, i) => {
                const val = row[p.index] !== undefined ? String(row[p.index]).trim() : '';
                if (val !== '') {
                    rowArr[i] = 1;
                }
            });
            reportData.push({ designNo: designNo, data: rowArr });
        }
    });

    renderReportTable(reportData, platforms);
}

function generateLiveDesign() {
    const startStr = document.getElementById('live-design-start').value;
    const endStr = document.getElementById('live-design-end').value;

    if (!startStr || !endStr) {
        alert("Please select both Start Date and End Date to generate the Live Design report.");
        return;
    }

    const reportContainer = document.querySelector('#live-design-view .table-container');
    if (reportContainer) reportContainer.style.display = 'block';

    const startObj = new Date(startStr);
    const endObj = new Date(endStr);

    startObj.setHours(0, 0, 0, 0);
    endObj.setHours(23, 59, 59, 999);

    const reportData = [];

    const platforms = [
        { index: 3, dateIndex: 4, name: 'AJIO' },
        { index: 5, dateIndex: 6, name: 'AJIO DE' },
        { index: 7, dateIndex: 8, name: 'AJIO TANUKA' },
        { index: 9, dateIndex: 10, name: 'AMZONE' },
        { index: 11, dateIndex: 12, name: 'MY DE' },
        { index: 13, dateIndex: 14, name: 'MY JIHU' },
        { index: 15, dateIndex: 16, name: 'T CENTER' },
        { index: 17, dateIndex: 18, name: 'WEBSITE HONEST' },
        { index: 19, dateIndex: 20, name: 'RTW' },
        { index: 21, dateIndex: 22, name: 'MS' },
        { index: 23, dateIndex: 24, name: 'BB' },
        { index: 25, dateIndex: 26, name: 'DREAM' },
        { index: 27, dateIndex: 28, name: 'TRENDY CLUTURE' }
    ];

    database.forEach(row => {
        const designNo = row[2] ? String(row[2]).trim() : '';

        if (!designNo) return;

        let hasDataInRange = false;
        const rowArr = [];

        platforms.forEach((p) => {
            const val = row[p.index] !== undefined ? String(row[p.index]).trim() : '';
            const dateVal = row[p.dateIndex] !== undefined ? String(row[p.dateIndex]).trim() : '';

            let inRange = false;
            if (dateVal) {
                const pDate = new Date(dateVal);
                if (pDate >= startObj && pDate <= endObj) {
                    inRange = true;
                }
            }

            if (val !== '' && inRange) {
                rowArr.push({ val: 1, date: dateVal });
                hasDataInRange = true;
            } else {
                rowArr.push({ val: 0, date: val !== '' ? dateVal : '' });
            }
        });

        if (hasDataInRange) {
            reportData.push({ designNo: designNo, data: rowArr });
        }
    });

    renderLiveDesignTable(reportData, platforms, 'live-design-table-body', 'live-design-table-foot');
}

function generateNotLiveDesign() {
    const startStr = document.getElementById('not-live-design-start').value;
    const endStr = document.getElementById('not-live-design-end').value;

    if (!startStr || !endStr) {
        alert("Please select both Start Date and End Date to generate the Not Live Design report.");
        return;
    }

    const reportContainer = document.querySelector('#not-live-design-view .table-container');
    if (reportContainer) reportContainer.style.display = 'block';

    const startObj = new Date(startStr);
    const endObj = new Date(endStr);

    startObj.setHours(0, 0, 0, 0);
    endObj.setHours(23, 59, 59, 999);

    const reportData = [];

    const platforms = [
        { index: 3, dateIndex: 4, name: 'AJIO' },
        { index: 5, dateIndex: 6, name: 'AJIO DE' },
        { index: 7, dateIndex: 8, name: 'AJIO TANUKA' },
        { index: 9, dateIndex: 10, name: 'AMZONE' },
        { index: 11, dateIndex: 12, name: 'MY DE' },
        { index: 13, dateIndex: 14, name: 'MY JIHU' },
        { index: 15, dateIndex: 16, name: 'T CENTER' },
        { index: 17, dateIndex: 18, name: 'WEBSITE HONEST' },
        { index: 19, dateIndex: 20, name: 'RTW' },
        { index: 21, dateIndex: 22, name: 'MS' },
        { index: 23, dateIndex: 24, name: 'BB' },
        { index: 25, dateIndex: 26, name: 'DREAM' },
        { index: 27, dateIndex: 28, name: 'TRENDY CLUTURE' }
    ];

    database.forEach(row => {
        const rowDateStr = row[1]; // Filter by MAIN DATE column 1
        const designNo = row[2] ? String(row[2]).trim() : '';

        if (!designNo) return;

        let includeRow = true;
        if (startObj || endObj) {
            if (!rowDateStr) {
                includeRow = false;
            } else {
                const rowDate = new Date(rowDateStr);
                if (startObj && rowDate < startObj) includeRow = false;
                if (endObj && rowDate > endObj) includeRow = false;
            }
        }

        if (includeRow) {
            let hasNotLive = false;
            const rowArr = [];

            platforms.forEach((p) => {
                const val = row[p.index] !== undefined ? String(row[p.index]).trim() : '';
                const dateVal = row[p.dateIndex] !== undefined ? String(row[p.dateIndex]).trim() : '';

                if (val === '') {
                    // It is NOT live
                    rowArr.push({ val: 1, date: '' });
                    hasNotLive = true;
                } else {
                    // It IS live
                    rowArr.push({ val: 0, date: dateVal });
                }
            });

            if (hasNotLive) {
                reportData.push({ designNo: designNo, data: rowArr });
            }
        }
    });

    renderLiveDesignTable(reportData, platforms, 'not-live-design-table-body', 'not-live-design-table-foot');
}

function renderReportTable(reportData, platforms, tbodyId = 'report-table-body', tfootId = 'report-table-foot') {
    const tbody = document.getElementById(tbodyId);
    const tfoot = document.getElementById(tfootId);

    tbody.innerHTML = '';
    tfoot.innerHTML = '';

    const grandTotals = Array(platforms.length).fill(0);
    let finalGrandTotal = 0;

    let rowsToRender = [];
    if (Array.isArray(reportData)) {
        rowsToRender = reportData;
    } else {
        const designNumbers = Object.keys(reportData);
        designNumbers.forEach(designNo => {
            rowsToRender.push({ designNo: designNo, data: reportData[designNo] });
        });
    }

    if (rowsToRender.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = platforms.length + 2;
        td.textContent = 'No matching data found for the selected dates.';
        td.style.textAlign = 'center';
        td.style.padding = '2rem';
        td.style.color = 'var(--text-muted)';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    rowsToRender.forEach(rowObj => {
        const designNo = rowObj.designNo;
        const tr = document.createElement('tr');

        const tdDesign = document.createElement('td');
        tdDesign.textContent = designNo;
        tdDesign.style.fontWeight = '600';
        tdDesign.style.color = 'var(--text-dark)';
        tdDesign.style.background = 'var(--bg-surface)';
        tr.appendChild(tdDesign);

        let rowTotal = 0;

        rowObj.data.forEach((val, i) => {
            const td = document.createElement('td');
            td.textContent = val === 1 ? '1' : '0';
            if (val === 1) {
                td.style.color = '#16a34a'; // nice green
                td.style.fontWeight = '700';
                td.style.backgroundColor = 'rgba(34, 197, 94, 0.08)';
            } else {
                td.style.color = '#dc2626'; // clean red
                td.style.fontWeight = '600';
                td.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
            }
            td.style.textAlign = 'center';
            tr.appendChild(td);

            rowTotal += val;
            grandTotals[i] += val;
        });

        const tdTotal = document.createElement('td');
        tdTotal.textContent = rowTotal > 0 ? rowTotal : '-';
        tdTotal.style.fontWeight = '700';
        tdTotal.style.color = 'var(--text-blue)';
        tdTotal.style.background = 'rgba(59, 130, 246, 0.05)';
        tr.appendChild(tdTotal);

        finalGrandTotal += rowTotal;
        tbody.appendChild(tr);
    });

    const trFoot = document.createElement('tr');

    const tdTitle = document.createElement('td');
    tdTitle.textContent = 'GRAND TOTAL';
    tdTitle.style.background = '#f1f5f9';
    tdTitle.style.color = 'var(--text-dark)';
    tdTitle.style.position = 'sticky';
    tdTitle.style.left = '0';
    trFoot.appendChild(tdTitle);

    grandTotals.forEach(val => {
        const td = document.createElement('td');
        td.textContent = val;
        td.style.background = '#f1f5f9';
        td.style.color = 'var(--text-dark)';
        td.style.textAlign = 'center';
        trFoot.appendChild(td);
    });

    const tdFinal = document.createElement('td');
    tdFinal.textContent = finalGrandTotal > 0 ? finalGrandTotal : '-';
    tdFinal.style.background = 'var(--primary-color)';
    tdFinal.style.color = 'white';
    tdFinal.style.fontSize = '1.1rem';
    trFoot.appendChild(tdFinal);

    tfoot.appendChild(trFoot);
}
function renderLiveDesignTable(reportData, platforms, tbodyId = 'live-design-table-body', tfootId = 'live-design-table-foot') {
    const tbody = document.getElementById(tbodyId);
    const tfoot = document.getElementById(tfootId);

    tbody.innerHTML = '';
    tfoot.innerHTML = '';

    const grandTotals = Array(platforms.length).fill(0);
    let finalGrandTotal = 0;

    let rowsToRender = reportData;

    if (rowsToRender.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = (platforms.length * 2) + 2;
        td.textContent = 'No matching data found for the selected dates.';
        td.style.textAlign = 'center';
        td.style.padding = '2rem';
        td.style.color = 'var(--text-muted)';
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    rowsToRender.forEach(rowObj => {
        const tr = document.createElement('tr');

        const tdDesign = document.createElement('td');
        tdDesign.textContent = rowObj.designNo;
        tdDesign.style.fontWeight = '600';
        tdDesign.style.color = 'var(--text-dark)';
        tdDesign.style.background = 'var(--bg-surface)';
        tr.appendChild(tdDesign);

        let rowTotal = 0;

        rowObj.data.forEach((item, i) => {
            const tdVal = document.createElement('td');
            tdVal.textContent = item.val === 1 ? '1' : '0';
            if (item.val === 1) {
                tdVal.style.color = '#16a34a';
                tdVal.style.fontWeight = '700';
                tdVal.style.backgroundColor = 'rgba(34, 197, 94, 0.08)';
            } else {
                tdVal.style.color = '#dc2626';
                tdVal.style.fontWeight = '600';
                tdVal.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
            }
            tdVal.style.textAlign = 'center';
            tr.appendChild(tdVal);

            const tdDate = document.createElement('td');
            if (item.val === 1 && item.date) {
                const dParts = item.date.split('-');
                if (dParts.length === 3) {
                    tdDate.textContent = `${dParts[2]}-${dParts[1]}-${dParts[0]}`;
                } else {
                    tdDate.textContent = item.date;
                }
            } else {
                tdDate.textContent = '-';
            }
            tdDate.style.textAlign = 'center';
            tdDate.style.color = 'var(--text-muted)';
            tdDate.style.fontSize = '0.75rem';
            tr.appendChild(tdDate);

            rowTotal += item.val;
            grandTotals[i] += item.val;
        });

        const tdTotal = document.createElement('td');
        tdTotal.textContent = rowTotal > 0 ? rowTotal : '-';
        tdTotal.style.fontWeight = '700';
        tdTotal.style.color = 'var(--text-blue)';
        tdTotal.style.background = 'rgba(59, 130, 246, 0.05)';
        tr.appendChild(tdTotal);

        finalGrandTotal += rowTotal;
        tbody.appendChild(tr);
    });

    const trFoot = document.createElement('tr');

    const tdTitle = document.createElement('td');
    tdTitle.textContent = 'GRAND TOTAL';
    tdTitle.style.background = '#f1f5f9';
    tdTitle.style.color = 'var(--text-dark)';
    tdTitle.style.position = 'sticky';
    tdTitle.style.left = '0';
    trFoot.appendChild(tdTitle);

    grandTotals.forEach(val => {
        const tdVal = document.createElement('td');
        tdVal.textContent = val;
        tdVal.style.background = '#f1f5f9';
        tdVal.style.color = 'var(--text-dark)';
        tdVal.style.textAlign = 'center';
        trFoot.appendChild(tdVal);

        const tdDate = document.createElement('td');
        tdDate.textContent = '';
        tdDate.style.background = '#f1f5f9';
        trFoot.appendChild(tdDate);
    });

    const tdFinal = document.createElement('td');
    tdFinal.textContent = finalGrandTotal > 0 ? finalGrandTotal : '-';
    tdFinal.style.background = 'var(--primary-color)';
    tdFinal.style.color = 'white';
    tdFinal.style.fontSize = '1.1rem';
    trFoot.appendChild(tdFinal);

    tfoot.appendChild(trFoot);
}

window.onload = init;
