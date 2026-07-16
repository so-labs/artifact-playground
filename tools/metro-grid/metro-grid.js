// Tool: メトロ・グリッド (Metro Grid)
import { createToolStorage, copyToClipboard } from '../../js/lib/storage.js';

// --- コアロジック（テスト可能） ---

export function parseMarkdownTable(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length < 2) return null;
    
    const isTable = lines[1].includes('|') && /[-:]/.test(lines[1]);
    if (!isTable) return null;

    const extractCells = (line) => {
        let trimmed = line.trim();
        if (trimmed.startsWith('|')) trimmed = trimmed.substring(1);
        if (trimmed.endsWith('|')) trimmed = trimmed.substring(0, trimmed.length - 1);
        return trimmed.split('|').map(c => c.trim());
    };

    const headers = extractCells(lines[0]);
    const alignCells = extractCells(lines[1]);
    
    // 区切り行の構造チェック
    const isAlignRow = alignCells.every(c => /^[:\s-]*$/.test(c) && c.includes('-'));
    if (!isAlignRow) return null;
    
    const alignments = alignCells.map(c => {
        const left = c.startsWith(':');
        const right = c.endsWith(':');
        if (left && right) return 'center';
        if (left) return 'left';
        if (right) return 'right';
        return 'none';
    });

    while (alignments.length < headers.length) alignments.push('none');

    const rows = [];
    for (let i = 2; i < lines.length; i++) {
        const cells = extractCells(lines[i]);
        while(cells.length < headers.length) cells.push('');
        rows.push(cells.slice(0, headers.length));
    }

    return { headers, alignments, rows };
}

export function parseTSV(text) {
    const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
    if (lines.length === 0) return null;
    if (!lines.some(l => l.includes('\t'))) return null;
    
    const headers = lines[0].split('\t');
    const alignments = headers.map(() => 'none');
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split('\t');
        while(cells.length < headers.length) cells.push('');
        rows.push(cells.slice(0, headers.length));
    }
    
    return { headers, alignments, rows };
}

export function parseData(text) {
    if (!text.trim()) return { type: 'none', headers: [], alignments: [], rows: [] };
    
    if (text.includes('|') && /[-:]/.test(text)) {
        const md = parseMarkdownTable(text);
        if (md) return { type: 'md', ...md };
    }
    
    const tsv = parseTSV(text);
    if (tsv) return { type: 'tsv', ...tsv };
    
    return { type: 'none', headers: [], alignments: [], rows: [] };
}

export function getStringWidth(str) {
    let width = 0;
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i);
        if ((code >= 0x20 && code <= 0x7e) || (code >= 0xff61 && code <= 0xff9f)) {
            width += 1;
        } else {
            width += 2;
        }
    }
    return width;
}

export function padString(str, width, align, padChar = ' ') {
    const strWidth = getStringWidth(str);
    const padding = Math.max(0, width - strWidth);
    
    if (align === 'left') {
        return str + padChar.repeat(padding);
    } else if (align === 'right') {
        return padChar.repeat(padding) + str;
    } else if (align === 'center') {
        const left = Math.floor(padding / 2);
        const right = padding - left;
        return padChar.repeat(left) + str + padChar.repeat(right);
    } else {
        return str + padChar.repeat(padding);
    }
}

export function toMarkdown(data, pad = false) {
    if (!data.headers || data.headers.length === 0) return '';
    
    let colWidths = data.headers.map(() => 0);
    
    if (pad) {
        colWidths = data.headers.map((h, i) => {
            let max = getStringWidth(h);
            data.rows.forEach(r => {
                const w = getStringWidth(r[i] || '');
                if (w > max) max = w;
            });
            return Math.max(3, max);
        });
    }

    const buildRow = (cells, isHeader = false) => {
        if (!pad) {
            return '|' + cells.join('|') + '|';
        } else {
            const padded = cells.map((c, i) => {
                const align = data.alignments[i] === 'none' ? 'left' : data.alignments[i];
                return padString(c, colWidths[i], align);
            });
            return '| ' + padded.join(' | ') + ' |';
        }
    };

    const buildAlignRow = () => {
        if (!pad) {
            return '|' + data.alignments.map(a => {
                if (a === 'left') return ':---';
                if (a === 'center') return ':---:';
                if (a === 'right') return '---:';
                return '---';
            }).join('|') + '|';
        } else {
            return '| ' + data.alignments.map((a, i) => {
                const w = colWidths[i];
                if (a === 'left') return ':' + '-'.repeat(Math.max(1, w - 1));
                if (a === 'center') return ':' + '-'.repeat(Math.max(1, w - 2)) + ':';
                if (a === 'right') return '-'.repeat(Math.max(1, w - 1)) + ':';
                return '-'.repeat(Math.max(3, w));
            }).join(' | ') + ' |';
        }
    };

    let result = buildRow(data.headers, true) + '\n';
    result += buildAlignRow() + '\n';
    data.rows.forEach(r => {
        result += buildRow(r, false) + '\n';
    });
    
    return result.trim();
}

export function toTSV(data) {
    if (!data.headers || data.headers.length === 0) return '';
    let result = data.headers.join('\t') + '\n';
    data.rows.forEach(r => {
        result += r.join('\t') + '\n';
    });
    return result.trim();
}

export function sortGridData(data, colIndex, order) {
    const isNum = (val) => {
        if (!val) return false;
        const v = val.replace(/,/g, '').trim();
        return v !== '' && !isNaN(Number(v));
    };

    data.rows.sort((a, b) => {
        const valA = a[colIndex] || '';
        const valB = b[colIndex] || '';
        
        const numA = isNum(valA);
        const numB = isNum(valB);
        
        let cmp = 0;
        if (numA && numB) {
            cmp = Number(valA.replace(/,/g, '')) - Number(valB.replace(/,/g, ''));
        } else {
            cmp = valA.localeCompare(valB, undefined, { numeric: true });
        }
        
        return order === 'asc' ? cmp : -cmp;
    });
}

// --- UIコントローラー ---

export default function init() {
    const inputEl = document.getElementById('mg-input');
    const outputEl = document.getElementById('mg-output');
    const theadEl = document.getElementById('mg-thead');
    const tbodyEl = document.getElementById('mg-tbody');
    const tableEl = document.getElementById('mg-table');
    const emptyMsgEl = document.querySelector('.mg-empty-msg');
    const gridInfoEl = document.getElementById('mg-grid-info');
    
    const btnClear = document.getElementById('mg-btn-clear');
    const btnCopyMd = document.getElementById('mg-btn-copy-md');
    const btnCopyTsv = document.getElementById('mg-btn-copy-tsv');
    const optPadding = document.getElementById('mg-opt-padding');
    
    if (!inputEl) return;

    const storage = createToolStorage('metro-grid');
    
    let currentData = { type: 'none', headers: [], alignments: [], rows: [] };
    let originalRows = [];
    let sortState = { colIndex: -1, order: 'none' };
    let isPad = false;
    
    function escapeHtml(str) {
        return (str || '').toString().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    
    function getAlignStyle(align, isHeader) {
        if (align === 'none') {
            return isHeader ? 'center' : 'left';
        }
        return align;
    }

    function getAlignIcon(align) {
        switch(align) {
            case 'left':
                return '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="12" x2="14" y2="12"></line><line x1="4" y1="18" x2="18" y2="18"></line></svg>';
            case 'center':
                return '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="5" y1="18" x2="19" y2="18"></line></svg>';
            case 'right':
                return '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"><line x1="4" y1="6" x2="20" y2="6"></line><line x1="10" y1="12" x2="20" y2="12"></line><line x1="6" y1="18" x2="20" y2="18"></line></svg>';
            case 'none':
            default:
                return '<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"><line x1="4" y1="12" x2="20" y2="12"></line></svg>';
        }
    }

    function editCell(rowIdx, colIdx, tdEl) {
        const val = currentData.rows[rowIdx][colIdx];
        const input = document.createElement('input');
        input.type = 'text';
        input.value = val;
        input.className = 'mg-cell-input';
        
        const save = () => {
            currentData.rows[rowIdx][colIdx] = input.value;
            originalRows = JSON.parse(JSON.stringify(currentData.rows));
            sortState = { colIndex: -1, order: 'none' };
            renderGrid();
            updateOutput();
        };
        
        input.addEventListener('blur', save);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') renderGrid();
        });
        
        tdEl.innerHTML = '';
        tdEl.appendChild(input);
        input.focus();
    }

    function renderGrid() {
        if (!currentData.headers || currentData.headers.length === 0) {
            tableEl.hidden = true;
            emptyMsgEl.hidden = false;
            gridInfoEl.textContent = '0 行 × 0 列';
            return;
        }
        
        tableEl.hidden = false;
        emptyMsgEl.hidden = true;
        gridInfoEl.textContent = `${currentData.rows.length} 行 × ${currentData.headers.length} 列`;
        
        theadEl.innerHTML = '';
        const trHead = document.createElement('tr');
        currentData.headers.forEach((h, i) => {
            const th = document.createElement('th');
            const align = getAlignStyle(currentData.alignments[i], true);
            th.style.textAlign = align;
            
            const content = document.createElement('div');
            content.className = 'mg-th-content';
            
            const textWrap = document.createElement('div');
            textWrap.className = 'mg-th-text';
            textWrap.title = 'クリックでソート';
            
            if (align === 'center') textWrap.style.justifyContent = 'center';
            else if (align === 'right') textWrap.style.justifyContent = 'flex-end';
            else textWrap.style.justifyContent = 'flex-start';
            
            let sortIcon = '－';
            if (sortState.colIndex === i) {
                if (sortState.order === 'asc') sortIcon = '▲';
                else if (sortState.order === 'desc') sortIcon = '▼';
            }
            
            textWrap.innerHTML = `<span>${escapeHtml(h)}</span><span class="mg-sort-icon">${sortIcon}</span>`;
            textWrap.addEventListener('click', () => {
                if (sortState.colIndex === i) {
                    if (sortState.order === 'asc') sortState.order = 'desc';
                    else if (sortState.order === 'desc') sortState.order = 'none';
                    else sortState.order = 'asc';
                } else {
                    sortState.colIndex = i;
                    sortState.order = 'asc';
                }
                
                if (sortState.order === 'none') {
                    currentData.rows = JSON.parse(JSON.stringify(originalRows));
                } else {
                    sortGridData(currentData, i, sortState.order);
                }
                renderGrid();
                updateOutput();
            });
            
            const actions = document.createElement('div');
            actions.className = 'mg-th-actions';
            
            const alignBtn = document.createElement('button');
            alignBtn.className = 'mg-btn-icon';
            alignBtn.title = '配置を変更';
            alignBtn.innerHTML = getAlignIcon(currentData.alignments[i]);
            alignBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const aligns = ['none', 'left', 'center', 'right'];
                const cur = currentData.alignments[i];
                const nextIdx = (aligns.indexOf(cur) + 1) % aligns.length;
                currentData.alignments[i] = aligns[nextIdx];
                renderGrid();
                updateOutput();
            });

            const delBtn = document.createElement('button');
            delBtn.className = 'mg-btn-icon delete';
            delBtn.title = '列を削除';
            delBtn.innerHTML = '×';
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                currentData.headers.splice(i, 1);
                currentData.alignments.splice(i, 1);
                currentData.rows.forEach(r => r.splice(i, 1));
                originalRows.forEach(r => r.splice(i, 1));
                if (sortState.colIndex === i) {
                    sortState = { colIndex: -1, order: 'none' };
                } else if (sortState.colIndex > i) {
                    sortState.colIndex--;
                }
                renderGrid();
                updateOutput();
            });
            
            actions.appendChild(alignBtn);
            actions.appendChild(delBtn);
            
            content.appendChild(textWrap);
            content.appendChild(actions);
            th.appendChild(content);
            trHead.appendChild(th);
        });
        theadEl.appendChild(trHead);
        
        tbodyEl.innerHTML = '';
        currentData.rows.forEach((r, rowIdx) => {
            const tr = document.createElement('tr');
            currentData.headers.forEach((_, colIdx) => {
                const td = document.createElement('td');
                td.style.textAlign = getAlignStyle(currentData.alignments[colIdx], false);
                td.textContent = r[colIdx] || '';
                td.addEventListener('dblclick', () => editCell(rowIdx, colIdx, td));
                tr.appendChild(td);
            });
            tbodyEl.appendChild(tr);
        });
    }

    function updateOutput() {
        if (!currentData.headers || currentData.headers.length === 0) {
            outputEl.value = '';
            return;
        }
        outputEl.value = toMarkdown(currentData, isPad);
    }

    // イベントリスナー登録
    inputEl.addEventListener('input', () => {
        const text = inputEl.value;
        currentData = parseData(text);
        originalRows = JSON.parse(JSON.stringify(currentData.rows));
        sortState = { colIndex: -1, order: 'none' };
        renderGrid();
        updateOutput();
        storage.set('text', text);
    });

    btnClear.addEventListener('click', () => {
        inputEl.value = '';
        currentData = { type: 'none', headers: [], alignments: [], rows: [] };
        originalRows = [];
        sortState = { colIndex: -1, order: 'none' };
        renderGrid();
        updateOutput();
        storage.remove('text');
    });

    optPadding.addEventListener('click', () => {
        isPad = !isPad;
        optPadding.setAttribute('aria-checked', isPad ? 'true' : 'false');
        updateOutput();
        storage.set('pad', isPad);
    });

    btnCopyMd.addEventListener('click', () => {
        copyToClipboard(toMarkdown(currentData, isPad), btnCopyMd);
    });

    btnCopyTsv.addEventListener('click', () => {
        copyToClipboard(toTSV(currentData), btnCopyTsv);
    });

    // 初期化（LocalStorage復元、なければHTML上のデフォルト例文を使用）
    const savedText = storage.get('text');
    if (savedText) {
        inputEl.value = savedText;
    }
    
    // 現在の入力（復元データ、またはHTMLの初期例文）を元にデータを解析
    if (inputEl.value.trim()) {
        currentData = parseData(inputEl.value);
        originalRows = JSON.parse(JSON.stringify(currentData.rows));
    }
    
    const savedPad = storage.get('pad');
    if (savedPad === 'true') {
        isPad = true;
    }
    optPadding.setAttribute('aria-checked', isPad ? 'true' : 'false');
    
    renderGrid();
    updateOutput();
}