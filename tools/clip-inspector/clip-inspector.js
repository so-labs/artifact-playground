import { t, onLanguageChange, applyTranslations } from '../../js/lib/i18n.js';
import { copyToClipboard } from '../../js/lib/storage.js';

const HEX_DUMP_LIMIT = 512;
const BTN_RESET_MS = 1200;
const CUSTOM_FORMAT = 'web application/x-artifact-playground-kibidango';

const BADGE_KEYS = {
    text: 'badgeText',
    html: 'badgeHtml',
    image: 'badgeImage',
    custom: 'badgeCustom',
    other: 'badgeOther'
};

const KIND_KEYS = {
    string: 'kindString',
    file: 'kindFile',
    blob: 'kindBlob'
};

// ============================
// 純粋関数（テスト対象）
// ============================

/**
 * バイト数を人間が読みやすい文字列に変換する
 * @param {number|string} bytes バイト数
 * @returns {string} 例: "0 B" / "512 B" / "1.5 KB" / "1 MB"
 */
export function formatBytes(bytes) {
    const n = Number(bytes);
    if (!Number.isFinite(n) || n < 0) return '—';
    if (n === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    let value = n;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
        value /= 1024;
        unitIndex++;
    }
    const text = unitIndex === 0 ? String(value) : String(Math.round(value * 10) / 10);
    return `${text} ${units[unitIndex]}`;
}

/**
 * 文字列をUTF-8エンコードした場合のバイト数を数える
 * @param {string} text 対象文字列
 * @returns {number} バイト数
 */
export function countUtf8Bytes(text) {
    if (typeof text !== 'string') return 0;
    if (typeof TextEncoder !== 'undefined') {
        return new TextEncoder().encode(text).length;
    }
    // レガシー環境向けフォールバック
    return unescape(encodeURIComponent(text)).length;
}

/**
 * バイト列をHEXダンプ文字列（hexdump -C 形式）に変換する
 * @param {Uint8Array|Array} bytes 対象バイト列
 * @param {number} limit 表示する最大バイト数
 * @returns {string} HEXダンプ文字列（16バイト/行）
 */
export function toHexDump(bytes, limit = HEX_DUMP_LIMIT) {
    if (!bytes || typeof bytes.length !== 'number' || bytes.length === 0) return '';
    const total = Math.min(bytes.length, limit);
    const lines = [];
    for (let offset = 0; offset < total; offset += 16) {
        const chunk = [];
        for (let i = offset; i < Math.min(offset + 16, total); i++) {
            chunk.push(bytes[i]);
        }
        const hexParts = chunk.map(b => b.toString(16).padStart(2, '0'));
        if (hexParts.length > 8) hexParts.splice(8, 0, ' ');
        const hex = hexParts.join(' ').padEnd(47, ' ');
        const ascii = chunk
            .map(b => (b >= 0x20 && b <= 0x7e) ? String.fromCharCode(b) : '.')
            .join('')
            .padEnd(16, '.');
        lines.push(`${offset.toString(16).padStart(8, '0')}  ${hex}  |${ascii}|`);
    }
    return lines.join('\n');
}

/**
 * MIMEタイプを表示用カテゴリに分類する
 * @param {string} type MIMEタイプ
 * @returns {'text'|'html'|'image'|'custom'|'other'}
 */
export function categorizeFormat(type) {
    const raw = String(type || '').trim();
    if (raw.toLowerCase().startsWith('web ')) return 'custom';
    const normalized = raw.toLowerCase();
    if (normalized === 'text/plain') return 'text';
    if (normalized === 'text/html') return 'html';
    if (normalized.startsWith('image/')) return 'image';
    return 'other';
}

/**
 * テキストとして読めるタイプかどうかを判定する
 * @param {string} type MIMEタイプ
 * @returns {boolean}
 */
export function isTextLikeType(type) {
    const normalized = String(type || '').trim().toLowerCase().replace(/^web\s+/, '');
    if (!normalized) return true; // タイプ不明の文字列データはテキスト扱い
    return normalized.startsWith('text/') ||
        normalized === 'application/json' ||
        normalized.startsWith('application/xml') ||
        normalized === 'application/xhtml+xml';
}

/**
 * 文字列が「テキストらしい」かどうか（制御文字の割合で判定）
 * @param {string} str 対象文字列
 * @returns {boolean}
 */
export function looksLikeText(str) {
    if (typeof str !== 'string') return false;
    if (str.length === 0) return true;
    const checkLength = Math.min(str.length, 4096);
    let suspicious = 0;
    for (let i = 0; i < checkLength; i++) {
        const code = str.charCodeAt(i);
        if (code === 9 || code === 10 || code === 13) continue;
        if (code < 32 || code === 0xFFFD) suspicious++;
    }
    return suspicious / checkLength < 0.1;
}

// ============================
// サンプルデータ（桃太郎・浦島太郎・きびだんご）
// ============================

function makeBlob(text, type) {
    return new Blob([text], { type });
}

/**
 * 桃のPNG画像をcanvasで生成する
 * @returns {Promise<Blob>}
 */
function createPeachPngBlob() {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 320;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error('Canvas 2D context is not available'));
            return;
        }

        // 背景グラデーション
        const grad = ctx.createLinearGradient(0, 0, 320, 320);
        grad.addColorStop(0, '#fef3c7');
        grad.addColorStop(1, '#fecaca');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 320, 320);

        // 桃の実
        ctx.fillStyle = '#f9a8d4';
        ctx.beginPath();
        ctx.ellipse(160, 195, 95, 105, 0, 0, Math.PI * 2);
        ctx.fill();
        // 中央の溝
        ctx.strokeStyle = '#db2777';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(160, 95);
        ctx.quadraticCurveTo(138, 175, 160, 295);
        ctx.stroke();
        // 葉っぱ
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.ellipse(192, 98, 42, 18, -0.55, 0, Math.PI * 2);
        ctx.fill();
        // 目
        ctx.fillStyle = '#1f2937';
        ctx.beginPath();
        ctx.arc(126, 175, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(194, 175, 8, 0, Math.PI * 2);
        ctx.fill();
        // 笑顔
        ctx.strokeStyle = '#1f2937';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(160, 210, 24, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        // キャプション
        ctx.fillStyle = '#374151';
        ctx.font = 'bold 26px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('桃太郎が生まれた桃', 160, 42);

        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
            } else {
                reject(new Error('Failed to encode PNG blob'));
            }
        }, 'image/png');
    });
}

/**
 * サンプルの種類に応じて、クリップボードへ書き込むマルチフォーマットデータを組み立てる
 * @param {'text'|'rich'|'custom'|'image'} kind
 * @returns {Promise<Object<string, Blob>>}
 */
async function buildSampleData(kind) {
    if (kind === 'text') {
        return {
            'text/plain': makeBlob(t('tool.clipInspector.sampleText'), 'text/plain')
        };
    }
    if (kind === 'rich') {
        return {
            'text/plain': makeBlob(t('tool.clipInspector.sampleRichText'), 'text/plain'),
            'text/html': makeBlob(t('tool.clipInspector.sampleRichHtml'), 'text/html')
        };
    }
    if (kind === 'custom') {
        const data = {
            'text/plain': makeBlob(t('tool.clipInspector.sampleCustomPlain'), 'text/plain')
        };
        if (window.ClipboardItem && ClipboardItem.supports && ClipboardItem.supports(CUSTOM_FORMAT)) {
            data[CUSTOM_FORMAT] = makeBlob(t('tool.clipInspector.sampleCustomJson'), CUSTOM_FORMAT);
        }
        return data;
    }
    if (kind === 'image') {
        const blob = await createPeachPngBlob();
        return { 'image/png': blob };
    }
    return null;
}

// ============================
// 表示構築
// ============================

let renderToggleCounter = 0;

/**
 * 1エントリの内容を解析し、表示モードとデータを決定する
 */
async function resolveEntryContent(entry, urlSink) {
    if (entry.kind === 'string') {
        const text = entry.text || '';
        return { size: countUtf8Bytes(text), mode: text ? 'text' : 'empty', text };
    }

    const blob = entry.blob || entry.file || null;
    if (!blob) return { size: 0, mode: 'empty' };

    if (categorizeFormat(entry.type) === 'image') {
        const url = URL.createObjectURL(blob);
        if (urlSink) urlSink.push(url);
        return { size: blob.size, mode: 'image', objectUrl: url };
    }

    try {
        const bytes = new Uint8Array(await blob.arrayBuffer());
        const text = new TextDecoder('utf-8').decode(bytes);
        if (isTextLikeType(entry.type) || looksLikeText(text)) {
            return { size: blob.size, mode: text ? 'text' : 'empty', text };
        }
        return { size: blob.size, mode: 'hex', bytes };
    } catch (e) {
        return { size: blob.size, mode: 'unavailable' };
    }
}

/**
 * text/html の内容に「HTMLプレビュー」トグルとサンドボックス化されたiframeを追加する
 */
function createHtmlPreview(html) {
    const wrap = document.createElement('div');
    wrap.className = 'ci-html-preview';

    const row = document.createElement('div');
    row.className = 'ci-render-row';

    const toggleId = `ci-render-toggle-${++renderToggleCounter}`;
    const label = document.createElement('label');
    label.setAttribute('for', toggleId);
    label.setAttribute('data-i18n', 'tool.clipInspector.htmlRenderToggle');
    label.textContent = t('tool.clipInspector.htmlRenderToggle');

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.id = toggleId;
    toggle.className = 'toggle-switch';
    toggle.setAttribute('role', 'switch');
    toggle.setAttribute('aria-checked', 'false');
    toggle.setAttribute('data-i18n-aria', 'tool.clipInspector.htmlRenderToggleAria');
    toggle.setAttribute('aria-label', t('tool.clipInspector.htmlRenderToggleAria'));
    const thumb = document.createElement('span');
    thumb.className = 'toggle-thumb';
    toggle.appendChild(thumb);

    // スクリプト等を一切実行させないため sandbox 属性を空で付与
    const iframe = document.createElement('iframe');
    iframe.className = 'ci-html-frame';
    iframe.setAttribute('sandbox', '');
    iframe.hidden = true;
    iframe.srcdoc = html;

    toggle.addEventListener('click', () => {
        const next = toggle.getAttribute('aria-checked') !== 'true';
        toggle.setAttribute('aria-checked', String(next));
        iframe.hidden = !next;
    });

    row.appendChild(label);
    row.appendChild(toggle);
    wrap.appendChild(row);
    wrap.appendChild(iframe);
    return wrap;
}

/**
 * 1フォーマット分のカード要素を構築する
 */
async function createFormatCard(entry, urlSink) {
    const category = categorizeFormat(entry.type);
    const content = await resolveEntryContent(entry, urlSink);

    const card = document.createElement('div');
    card.className = 'ci-card';

    // --- ヘッダー（種別バッジ + MIME名 + メタ情報） ---
    const header = document.createElement('div');
    header.className = 'ci-card-header';

    const badge = document.createElement('span');
    badge.className = `ci-badge ci-badge-${category}`;
    badge.textContent = t(`tool.clipInspector.${BADGE_KEYS[category]}`);

    const nameEl = document.createElement('code');
    nameEl.className = 'ci-card-name';
    nameEl.textContent = entry.type || '(no type)';

    const meta = document.createElement('span');
    meta.className = 'ci-card-meta';
    meta.textContent = `${t(`tool.clipInspector.${KIND_KEYS[entry.kind]}`)} ・ ${formatBytes(content.size)}`;

    header.appendChild(badge);
    header.appendChild(nameEl);
    header.appendChild(meta);

    // --- ボディ（プレビュー） ---
    const body = document.createElement('div');
    body.className = 'ci-card-body';

    if (content.mode === 'text') {
        const textarea = document.createElement('textarea');
        textarea.className = 'ci-text-content';
        textarea.value = content.text;
        textarea.spellcheck = false;
        textarea.setAttribute('data-i18n-aria', 'tool.clipInspector.previewAria');
        textarea.setAttribute('aria-label', t('tool.clipInspector.previewAria'));

        const actions = document.createElement('div');
        actions.className = 'ci-card-actions';
        const btnCopy = document.createElement('button');
        btnCopy.className = 'btn small primary';
        btnCopy.textContent = t('common.copy');
        btnCopy.addEventListener('click', () => copyToClipboard(textarea.value, btnCopy));
        actions.appendChild(btnCopy);

        body.appendChild(textarea);
        body.appendChild(actions);

        if (category === 'html') {
            body.appendChild(createHtmlPreview(content.text));
        }
    } else if (content.mode === 'image') {
        const img = document.createElement('img');
        img.className = 'ci-image-preview';
        img.src = content.objectUrl;
        img.alt = t('tool.clipInspector.imageAlt');
        body.appendChild(img);
    } else if (content.mode === 'hex') {
        const pre = document.createElement('pre');
        pre.className = 'ci-hex';
        pre.textContent = toHexDump(content.bytes, HEX_DUMP_LIMIT);
        body.appendChild(pre);

        if (content.size > HEX_DUMP_LIMIT) {
            const note = document.createElement('div');
            note.className = 'ci-note';
            note.textContent = t('tool.clipInspector.truncatedNote', [HEX_DUMP_LIMIT, formatBytes(content.size)]);
            body.appendChild(note);
        }
    } else if (content.mode === 'empty') {
        const empty = document.createElement('div');
        empty.className = 'ci-empty';
        empty.textContent = t('tool.clipInspector.emptyContent');
        body.appendChild(empty);
    } else {
        const unavailable = document.createElement('div');
        unavailable.className = 'ci-empty';
        unavailable.textContent = t('tool.clipInspector.noContent');
        body.appendChild(unavailable);
    }

    card.appendChild(header);
    card.appendChild(body);
    return card;
}

// ============================
// 初期化
// ============================

export default function init() {
    const section = document.getElementById('tool-clip-inspector');
    if (!section) return;

    const btnInvestigate = document.getElementById('ci-btn-investigate');
    const resultsArea = document.getElementById('ci-results');
    const cardsContainer = document.getElementById('ci-cards');
    const summaryEl = document.getElementById('ci-summary');
    const sourceEl = document.getElementById('ci-source');
    const btnClear = document.getElementById('ci-btn-clear');
    const sampleNote = document.getElementById('ci-sample-note');
    const sampleButtons = Array.from(section.querySelectorAll('[data-ci-sample]'));

    if (!btnInvestigate || !cardsContainer) return;

    let objectUrls = [];
    let lastReport = null;

    function releaseObjectUrls() {
        objectUrls.forEach((url) => URL.revokeObjectURL(url));
        objectUrls = [];
    }

    function showSampleNote(message) {
        if (!sampleNote) return;
        if (message) {
            sampleNote.textContent = message;
            sampleNote.hidden = false;
        } else {
            sampleNote.textContent = '';
            sampleNote.hidden = true;
        }
    }

    function flashButton(btn) {
        const originalLabel = btn.textContent;
        btn.textContent = t('common.copied');
        setTimeout(() => {
            btn.textContent = originalLabel;
        }, BTN_RESET_MS);
    }

    async function renderReport(entries, source) {
        releaseObjectUrls();
        cardsContainer.innerHTML = '';
        resultsArea.hidden = false;
        summaryEl.textContent = t('tool.clipInspector.formatCount', [entries.length]);
        sourceEl.textContent = source === 'api'
            ? t('tool.clipInspector.sourceApi')
            : t('tool.clipInspector.sourcePaste');
        lastReport = { entries, source };

        if (!entries.length) {
            const empty = document.createElement('div');
            empty.className = 'ci-empty';
            empty.textContent = t('tool.clipInspector.noContent');
            cardsContainer.appendChild(empty);
            return;
        }

        for (const entry of entries) {
            cardsContainer.appendChild(await createFormatCard(entry, objectUrls));
        }
    }

    async function extractFromClipboardApi() {
        if (!navigator.clipboard || typeof navigator.clipboard.read !== 'function') {
            const err = new Error('Clipboard API read() is not supported');
            err.name = 'NotSupportedError';
            throw err;
        }
        const items = await navigator.clipboard.read();
        const entries = [];
        const seen = new Set();
        for (const clipboardItem of items) {
            for (const type of clipboardItem.types) {
                if (seen.has(type)) continue;
                seen.add(type);
                try {
                    const blob = await clipboardItem.getType(type);
                    if (blob) entries.push({ type, kind: 'blob', blob });
                } catch (e) {
                    // 取得できない形式はスキップ
                }
            }
        }
        return entries;
    }

    async function copySample(kind, btn) {
        try {
            if (!navigator.clipboard || !window.ClipboardItem) {
                // ClipboardItem 非対応環境はテキストのみでフォールバック
                const fallbackText = kind === 'text'
                    ? t('tool.clipInspector.sampleText')
                    : kind === 'rich'
                        ? t('tool.clipInspector.sampleRichText')
                        : kind === 'custom'
                            ? t('tool.clipInspector.sampleCustomJson')
                            : '';
                if (!fallbackText) {
                    alert(t('common.copyFailed'));
                    return;
                }
                await navigator.clipboard.writeText(fallbackText);
                showSampleNote(t('tool.clipInspector.sampleNoItemSupport'));
                flashButton(btn);
                return;
            }

            const data = await buildSampleData(kind);
            if (!data) {
                alert(t('common.copyFailed'));
                return;
            }
            await navigator.clipboard.write([new ClipboardItem(data)]);

            if (kind === 'custom' && !data[CUSTOM_FORMAT]) {
                showSampleNote(t('tool.clipInspector.sampleCustomUnsupported'));
            } else {
                showSampleNote('');
            }
            flashButton(btn);
        } catch (err) {
            console.error('Failed to copy sample:', err);
            alert(t('common.copyFailed'));
        }
    }

    // --- イベント接続 ---

    btnInvestigate.addEventListener('click', async () => {
        try {
            const entries = await extractFromClipboardApi();
            await renderReport(entries, 'api');
        } catch (err) {
            console.error('Clipboard API read failed:', err);
            alert(t('tool.clipInspector.readFailedApi'));
        }
    });

    btnClear.addEventListener('click', () => {
        resultsArea.hidden = true;
        cardsContainer.innerHTML = '';
        releaseObjectUrls();
        lastReport = null;
    });

    sampleButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            copySample(btn.getAttribute('data-ci-sample'), btn);
        });
    });

    onLanguageChange(() => {
        applyTranslations(section);
        if (lastReport) {
            summaryEl.textContent = t('tool.clipInspector.formatCount', [lastReport.entries.length]);
            sourceEl.textContent = lastReport.source === 'api'
                ? t('tool.clipInspector.sourceApi')
                : t('tool.clipInspector.sourcePaste');
        }
    });
}
