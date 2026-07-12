// Tool: アウトライン・スタジオ
import { createToolStorage, copyToClipboard } from '../../js/lib/storage.js';
import {
    parseHeadings,
    formatCopyText,
    extractText,
    changeHeadingLevelSingleAtLine,
    changeHeadingLevelAtLine,
    moveSection,
    findHeadingLineAtCursor,
    checkStructureIssues,
    getLineNumberFromPosition,
    getLineStartPosition,
} from '../../js/lib/markdown-headings.js';

const PENDING_FILE_KEY = 'os-pending-file';

let fileHandle = null;
let scrollMirror = null;

function getScope() {
    const el = document.querySelector('input[name="os-scope"]:checked');
    return el ? el.value : 'section';
}

function getFormat() {
    const el = document.querySelector('input[name="os-format"]:checked');
    return el ? el.value : 'normal';
}

function getSelectionText(textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return '';
    return textarea.value.slice(start, end);
}

function getScrollMirror() {
    if (!scrollMirror) {
        scrollMirror = document.createElement('div');
        scrollMirror.setAttribute('aria-hidden', 'true');
        scrollMirror.style.cssText = [
            'position:absolute',
            'top:-9999px',
            'left:-9999px',
            'visibility:hidden',
            'white-space:pre-wrap',
            'word-wrap:break-word',
            'overflow:hidden',
            'pointer-events:none',
        ].join(';');
        document.body.appendChild(scrollMirror);
    }
    return scrollMirror;
}

function getLineScrollTop(textarea, lineIndex) {
    const mirror = getScrollMirror();
    const style = getComputedStyle(textarea);
    mirror.style.font = style.font;
    mirror.style.padding = style.padding;
    mirror.style.border = style.border;
    mirror.style.boxSizing = style.boxSizing;
    mirror.style.width = `${textarea.clientWidth}px`;
    mirror.style.lineHeight = style.lineHeight;
    mirror.style.letterSpacing = style.letterSpacing;
    mirror.style.tabSize = style.tabSize;

    const lines = textarea.value.split('\n');
    mirror.textContent = lineIndex > 0 ? lines.slice(0, lineIndex).join('\n') : '';

    const paddingTop = parseFloat(style.paddingTop) || 0;
    return Math.max(0, mirror.scrollHeight - paddingTop);
}

function focusLineAtTop(textarea, lineIndex, { refresh = true } = {}) {
    const pos = getLineStartPosition(textarea.value, lineIndex);
    const targetScroll = getLineScrollTop(textarea, lineIndex);

    try {
        textarea.focus({ preventScroll: true });
    } catch {
        textarea.focus();
    }
    textarea.setSelectionRange(pos, pos);
    textarea.scrollTop = targetScroll;

    requestAnimationFrame(() => {
        textarea.scrollTop = targetScroll;
        if (refresh) {
            textarea.dispatchEvent(new Event('input'));
        }
    });
}

function updateUI(state) {
    const {
        inputEl, previewEl, outlineEl, cursorInfoEl, issuesEl,
        sourceLabelEl, saveBtn, fileNameEl,
    } = state;

    const text = inputEl.value;
    const cursorLine = getLineNumberFromPosition(text, inputEl.selectionStart);
    const activeHeadingLine = findHeadingLineAtCursor(text, cursorLine);
    const headings = parseHeadings(text);

    cursorInfoEl.textContent = `行 ${cursorLine + 1}`;

    renderOutline(outlineEl, headings, activeHeadingLine, (line) => {
        focusLineAtTop(inputEl, line);
    });

    const issues = checkStructureIssues(text);
    if (issues.length > 0) {
        issuesEl.hidden = false;
        issuesEl.textContent = `⚠ ${issues[0].message}`;
        issuesEl.title = issues.map(i => `行 ${i.line + 1}: ${i.message}`).join('\n');
    } else {
        issuesEl.hidden = true;
        issuesEl.textContent = '';
        issuesEl.title = '';
    }

    const scope = getScope();
    const format = getFormat();
    const selection = getSelectionText(inputEl);
    const { text: extracted, sourceName } = extractText(text, {
        scope,
        cursorLine,
        selection,
    });
    const formatted = formatCopyText(extracted, format);

    previewEl.value = formatted;
    sourceLabelEl.textContent = formatted ? sourceName : '';

    const hasText = text.trim().length > 0;
    if (fileHandle) {
        saveBtn.disabled = false;
        saveBtn.textContent = '保存';
        fileNameEl.hidden = false;
        fileNameEl.textContent = fileHandle.name;
    } else {
        saveBtn.disabled = !hasText;
        saveBtn.textContent = 'ダウンロード';
    }
}

function renderOutline(container, headings, activeLine, onClick) {
    container.innerHTML = '';

    if (headings.length === 0) {
        container.innerHTML = '<p class="os-empty">見出しがありません</p>';
        return;
    }

    const ul = document.createElement('ul');
    ul.className = 'os-outline-list';

    headings.forEach((h) => {
        const li = document.createElement('li');
        li.className = 'os-outline-item';

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'os-outline-btn';
        if (h.line === activeLine) btn.classList.add('active');
        btn.style.paddingLeft = `${0.4 + (h.level - 1) * 0.6}rem`;
        btn.innerHTML = `<span class="os-level">H${h.level}</span>${escapeHtml(h.text)}`;
        btn.addEventListener('click', () => onClick(h.line));

        li.appendChild(btn);
        ul.appendChild(li);
    });

    container.appendChild(ul);
}

function escapeHtml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function applyTextChange(state, newText, focusLine) {
    const { inputEl, storage } = state;
    inputEl.value = newText;
    storage.set('text', newText);
    focusLineAtTop(inputEl, focusLine);
}

async function openFileWithPicker(state) {
    if ('showOpenFilePicker' in window) {
        try {
            const [handle] = await window.showOpenFilePicker({
                types: [{
                    description: 'Markdown / テキスト',
                    accept: {
                        'text/markdown': ['.md', '.markdown', '.mdown'],
                        'text/plain': ['.txt'],
                    },
                }],
            });
            const file = await handle.getFile();
            await loadFileContent(state, file, handle);
        } catch (err) {
            if (err.name !== 'AbortError') console.error(err);
        }
        return;
    }

    state.fileInputEl.click();
}

async function loadFileContent(state, file, handle = null) {
    const text = await file.text();
    state.inputEl.value = text;
    state.storage.set('text', text);
    fileHandle = handle;
    state.fileNameEl.textContent = file.name;
    state.fileNameEl.hidden = false;
    state.inputEl.dispatchEvent(new Event('input'));
}

async function saveFile(state) {
    if (fileHandle && ('createWritable' in fileHandle)) {
        // 直接上書き保存
        try {
            const writable = await fileHandle.createWritable();
            await writable.write(state.inputEl.value);
            await writable.close();
            state.saveBtn.textContent = '保存完了！';
            setTimeout(() => { updateUI(state); }, 1200);
        } catch (err) {
            console.error(err);
            alert('ファイルの保存に失敗しました。');
        }
    } else {
        // ダウンロード（書き出し）
        try {
            const blob = new Blob([state.inputEl.value], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const currentName = state.fileNameEl.textContent;
            a.download = currentName && currentName.trim() !== '' ? currentName : 'note.md';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            state.saveBtn.textContent = 'ダウンロード完了！';
            setTimeout(() => { updateUI(state); }, 1200);
        } catch (err) {
            console.error(err);
            alert('ファイルのダウンロードに失敗しました。');
        }
    }
}

function consumePendingFile(state) {
    try {
        const raw = sessionStorage.getItem(PENDING_FILE_KEY);
        if (!raw) return;
        sessionStorage.removeItem(PENDING_FILE_KEY);
        const { name, content } = JSON.parse(raw);
        state.inputEl.value = content;
        state.storage.set('text', content);
        state.fileNameEl.textContent = name;
        state.fileNameEl.hidden = false;
        fileHandle = null;
        state.inputEl.dispatchEvent(new Event('input'));
    } catch (e) {
        console.error(e);
    }
}

export default function init() {
    const inputEl = document.getElementById('os-input');
    const previewEl = document.getElementById('os-preview');
    const outlineEl = document.getElementById('os-outline');
    const cursorInfoEl = document.getElementById('os-cursor-info');
    const issuesEl = document.getElementById('os-issues');
    const sourceLabelEl = document.getElementById('os-source-label');
    const fileNameEl = document.getElementById('os-file-name');
    const saveBtn = document.getElementById('os-btn-save');
    const fileInputEl = document.getElementById('os-file-input');

    if (!inputEl) return;

    const storage = createToolStorage('os');
    const state = {
        inputEl, previewEl, outlineEl, cursorInfoEl, issuesEl,
        sourceLabelEl, saveBtn, fileNameEl, fileInputEl, storage,
    };

    const savedText = storage.get('text');
    if (savedText) inputEl.value = savedText;

    const refresh = () => updateUI(state);

    inputEl.addEventListener('input', () => {
        storage.set('text', inputEl.value);
        refresh();
    });

    inputEl.addEventListener('click', refresh);
    inputEl.addEventListener('keyup', refresh);
    inputEl.addEventListener('select', refresh);

    document.querySelectorAll('input[name="os-scope"], input[name="os-format"]').forEach(el => {
        el.addEventListener('change', refresh);
    });

    document.getElementById('os-btn-open')?.addEventListener('click', () => openFileWithPicker(state));

    fileInputEl?.addEventListener('change', async (e) => {
        const file = e.target.files?.[0];
        if (file) await loadFileContent(state, file);
        e.target.value = '';
    });

    inputEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        inputEl.classList.add('drag-over');
    });
    inputEl.addEventListener('dragleave', () => inputEl.classList.remove('drag-over'));
    inputEl.addEventListener('drop', async (e) => {
        e.preventDefault();
        inputEl.classList.remove('drag-over');
        const file = e.dataTransfer?.files?.[0];
        if (file) await loadFileContent(state, file);
    });

    saveBtn?.addEventListener('click', () => saveFile(state));

    document.getElementById('os-btn-clear')?.addEventListener('click', () => {
        inputEl.value = '';
        storage.remove('text');
        fileHandle = null;
        fileNameEl.hidden = true;
        fileNameEl.textContent = '';
        refresh();
    });

    document.getElementById('os-btn-copy')?.addEventListener('click', () => {
        copyToClipboard(previewEl.value, document.getElementById('os-btn-copy'));
    });

    const bindLevelChange = (id, fn) => {
        document.getElementById(id)?.addEventListener('click', () => {
            const line = findHeadingLineAtCursor(inputEl.value, getLineNumberFromPosition(inputEl.value, inputEl.selectionStart));
            if (line === null) return;
            applyTextChange(state, fn(inputEl.value, line), line);
        });
    };

    bindLevelChange('os-btn-level-single-up', (text, line) => changeHeadingLevelSingleAtLine(text, line, -1));
    bindLevelChange('os-btn-level-single-down', (text, line) => changeHeadingLevelSingleAtLine(text, line, +1));
    bindLevelChange('os-btn-level-group-up', (text, line) => changeHeadingLevelAtLine(text, line, -1));
    bindLevelChange('os-btn-level-group-down', (text, line) => changeHeadingLevelAtLine(text, line, +1));

    const bindSectionMove = (id, direction, mode) => {
        document.getElementById(id)?.addEventListener('click', () => {
            const cursorLine = getLineNumberFromPosition(inputEl.value, inputEl.selectionStart);
            const result = moveSection(inputEl.value, cursorLine, direction, mode);
            if (!result.moved) return;
            applyTextChange(state, result.text, result.headingLine);
        });
    };

    bindSectionMove('os-btn-move-group-up', 'up', 'full');
    bindSectionMove('os-btn-move-group-down', 'down', 'full');

    consumePendingFile(state);
    window.addEventListener('os-pending-file', () => consumePendingFile(state));
    refresh();
}
