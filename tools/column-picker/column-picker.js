import { copyToClipboard } from '../../js/lib/storage.js';
import { t, onLanguageChange, applyTranslations } from '../../js/lib/i18n.js';

export function parseHtmlTable(html) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        // 最初のテーブルを対象にする
        const table = doc.querySelector('table');
        if (!table) return null;

        const rows = Array.from(table.querySelectorAll('tr'));
        if (rows.length === 0) return null;

        const data = rows.map(row => {
            const cells = Array.from(row.querySelectorAll('td, th'));
            return cells.map(cell => {
                const clone = cell.cloneNode(true);
                // セル内の <br> タグを改行に変換
                const brs = clone.querySelectorAll('br');
                brs.forEach(br => br.replaceWith('\n'));
                return clone.textContent.trim().replace(/\r\n/g, '\n');
            });
        });

        // 最大列数を計算
        const maxCols = Math.max(...data.map(r => r.length));
        if (maxCols === 0) return null;

        // 列ごとに配列を組み替える (転置)
        const columns = [];
        for (let i = 0; i < maxCols; i++) {
            const colData = [];
            for (let j = 0; j < data.length; j++) {
                colData.push(data[j][i] || '');
            }
            columns.push(colData);
        }

        return columns;
    } catch (e) {
        console.error(e);
        return null;
    }
}

export function parseTsv(text) {
    if (!text.includes('\t')) return null;
    const lines = text.split(/\r?\n/);
    const data = lines.map(line => line.split('\t'));

    const maxCols = Math.max(...data.map(r => r.length));
    if (maxCols <= 1) return null;

    const columns = [];
    for (let i = 0; i < maxCols; i++) {
        const colData = [];
        for (let j = 0; j < data.length; j++) {
            colData.push(data[j][i] || '');
        }
        columns.push(colData);
    }
    return columns;
}

export default function init() {
    const section = document.getElementById('tool-column-picker');
    const inputEl = document.getElementById('cp-input');
    const resultsArea = document.getElementById('cp-results');
    const container = document.getElementById('cp-columns-container');
    const btnClear = document.getElementById('cp-btn-clear');

    if (!inputEl) return;

    inputEl.addEventListener('paste', (e) => {
        let html = '';
        let text = '';

        if (e.clipboardData) {
            html = e.clipboardData.getData('text/html');
            text = e.clipboardData.getData('text/plain');
        }

        let columns = null;

        // まずHTML形式が含まれているかチェックし、テーブル構造を維持してパース
        if (html) {
            columns = parseHtmlTable(html);
        }

        // HTMLが取れない、またはテーブルが含まれていない場合はTSV形式をチェック
        if (!columns && text) {
            columns = parseTsv(text);
        }

        if (columns) {
            e.preventDefault(); // デフォルトのペーストをキャンセル
            inputEl.value = t('tool.columnPicker.successMsg');
            renderColumns(columns);
        }
    });

    function renderColumns(columns) {
        container.innerHTML = '';
        resultsArea.hidden = false;

        columns.forEach((colData, idx) => {
            // ヘッダー行をタイトルとして利用
            const headerText = colData[0] ? colData[0].replace(/\s+/g, ' ').trim() : `Column ${idx + 1}`;
            
            // 空のセルをスキップして有効なデータだけを抽出
            const validCells = colData.map(cell => cell.trim()).filter(cell => cell !== '');
            
            // セル内に改行を含むデータ（複数行のテキストブロックなど）が1つでもあるか判定
            const hasMultilineCell = validCells.some(cell => cell.includes('\n'));
            
            // 単一行のリストなら改行1つ、複数行ブロックを含むなら空行を挟む（改行2つ）
            const separator = hasMultilineCell ? '\n\n' : '\n';
            const bodyText = validCells.join(separator);

            const card = document.createElement('div');
            card.className = 'cp-column-card';

            const header = document.createElement('div');
            header.className = 'cp-column-header';

            const title = document.createElement('span');
            title.textContent = headerText;
            title.className = 'cp-column-title';

            const btnCopy = document.createElement('button');
            btnCopy.className = 'btn small primary';
            btnCopy.textContent = t('common.copy');

            header.appendChild(title);
            header.appendChild(btnCopy);

            const body = document.createElement('div');
            body.className = 'cp-column-body';

            // コピー前に微調整できるようテキストエリアを用意
            const textarea = document.createElement('textarea');
            textarea.value = bodyText;
            textarea.spellcheck = false;

            body.appendChild(textarea);

            card.appendChild(header);
            card.appendChild(body);
            container.appendChild(card);

            btnCopy.addEventListener('click', () => {
                copyToClipboard(textarea.value, btnCopy);
            });
        });
    }

    btnClear.addEventListener('click', () => {
        inputEl.value = '';
        resultsArea.hidden = true;
        container.innerHTML = '';
    });

    onLanguageChange(() => {
        if (section) applyTranslations(section);
        if (inputEl.value === t('tool.columnPicker.successMsg', [], getLanguage() === 'ja' ? 'en' : 'ja')) {
            inputEl.value = t('tool.columnPicker.successMsg');
        }
    });
}