import { getAppVersion } from '../../js/lib/version.js';

let reduceText, makeNorinori, sliceText, canCopyAll, getReversedChunks, checkWeight, parseData, toMarkdown, sortGridData;
let parseHeadings, adjustHeadingLevels, formatCopyText, extractText, changeHeadingLevelAtLine, changeHeadingLevelSingleAtLine, moveSection, jumpToHeading, checkStructureIssues;
let parseHtmlTable, parseTsv;
let formatBytes, countUtf8Bytes, toHexDump, categorizeFormat, isTextLikeType, looksLikeText;
let createToolStorage, isTempMode, setTempMode, copyToClipboard, pasteFromClipboard;
let getLanguage, setLanguage, detectBrowserLanguage, t, onLanguageChange, applyTranslations;
let calculateStepValue;

const suites = [];
let currentSuite = null;

function describe(name, fn) {
    const parentSuite = currentSuite;
    const suite = { name, cases: [], suites: [] };

    if (parentSuite) {
        parentSuite.suites.push(suite);
    } else {
        suites.push(suite);
    }

    currentSuite = suite;
    fn();
    currentSuite = parentSuite;
}

function it(name, fn) {
    if (currentSuite) {
        currentSuite.cases.push({ name, fn });
    }
}

function assert(condition, message = 'Assertion failed') {
    if (!condition) {
        throw new Error(message);
    }
}

function assertEquals(actual, expected, message = '') {
    if (actual !== expected) {
        throw new Error(message || `Expected "${expected}", but got "${actual}"`);
    }
}

// === 1. 20% Off テスト ===
describe('20% Off', () => {
    describe('reduceText [tools/20-off/20-off.js]', () => {
        it('空テキストは空文字を返すこと', () => {
            assertEquals(reduceText('', 20), '');
        });

        it('先頭1文字は削られないこと', () => {
            const text = '吾輩';
            const result = reduceText(text, 50);
            assertEquals(result, '吾');
        });

        it('割合に応じて文字が削られること', () => {
            const text = 'あいうえおかきくけこ';
            const result = reduceText(text, 30);
            const chars = Array.from(result);
            assertEquals(chars.length, 7);
            assertEquals(chars[0], 'あ');
        });
    });
});

// === 2. ノリノリ音符 テスト ===
describe('ノリノリ音符', () => {
    describe('makeNorinori [tools/norinori-note/norinori-note.js]', () => {
        it('空テキストは空文字を返すこと', () => {
            assertEquals(makeNorinori(''), '');
        });

        it('各行の末尾に指定された音符のいずれかが付与され、改行が除去され1行になること', () => {
            const text = 'こんにちは\nさようなら';
            const notes = ['♪', '♫', '♬'];
            const result = makeNorinori(text, notes);

            assert(!result.includes('\n'), '結果に改行が含まれています');
            assert(result.startsWith('こんにちは'), '始まりが不正です');

            const middleChar = result[5];
            assert(notes.includes(middleChar), '1行目の末尾に音符がありません');

            const lastChar = result[result.length - 1];
            assert(notes.includes(lastChar), '2行目の末尾に音符がありません');
        });
    });
});

// === 3. スライスドロップ テスト ===
describe('スライスドロップ', () => {
    describe('sliceText [tools/slice-drop/slice-drop.js]', () => {
        it('空テキストは空の配列を返すこと', () => {
            const result = sliceText('', 140, false);
            assertEquals(result.length, 0);
        });

        it('指定文字数で正しく分割されること (プレフィックスなし)', () => {
            const text = 'あいうえおかきくけこ';
            const result = sliceText(text, 4, false);
            assertEquals(result.length, 3);
            assertEquals(result[0], 'あいうえ');
            assertEquals(result[1], 'おかきく');
            assertEquals(result[2], 'けこ');
        });

        it('サロゲートペア（絵文字など）を正しく分割できること', () => {
            const text = '🍎🍊🍋🍉🍇';
            const result = sliceText(text, 4, false);
            assertEquals(result.length, 3);
            assertEquals(result[0], '🍎🍊');
            assertEquals(result[1], '🍋🍉');
            assertEquals(result[2], '🍇');
        });

        it('プレフィックスありで正しくページ番号が付与されること', () => {
            const text = 'あいうえおかき';
            const result = sliceText(text, 10, true);
            assertEquals(result.length, 2);
            assertEquals(result[0], '1/2\n\nあいうえお');
            assertEquals(result[1], '2/2\n\nかき');
        });
    });

    describe('getReversedChunks [tools/slice-drop/slice-drop.js]', () => {
        it('空の配列は空の配列を返すこと', () => {
            const result = getReversedChunks([]);
            assertEquals(result.length, 0);
        });

        it('配列を破壊せずに逆順の配列を返すこと', () => {
            const original = ['①', '②', '③'];
            const reversed = getReversedChunks(original);
            assertEquals(reversed.length, 3);
            assertEquals(reversed[0], '③');
            assertEquals(reversed[1], '②');
            assertEquals(reversed[2], '①');
            assertEquals(original[0], '①');
        });
    });

    describe('canCopyAll [tools/slice-drop/slice-drop.js]', () => {
        it('空配列の場合はfalseを返すこと', () => {
            assertEquals(canCopyAll([]), false);
        });

        it('20件以下の場合はtrueを返すこと', () => {
            const items = new Array(20).fill('テスト');
            assertEquals(canCopyAll(items), true);
        });

        it('20件を超える場合はfalseを返すこと', () => {
            const items = new Array(21).fill('テスト');
            assertEquals(canCopyAll(items), false);
        });
    });
});

// === 4. ウエイトオーバー テスト ===
describe('ウエイトオーバー', () => {
    describe('checkWeight [tools/weight-over/weight-over.js]', () => {
        it('上限以下では通常状態であること', () => {
            const text = 'あいうえお';
            const result = checkWeight(text, 10);
            assertEquals(result.count, 5);
            assertEquals(result.status, 'normal');
        });

        it('上限の95%超えで警告状態になること', () => {
            const text = 'あいうえおかきくけこ';
            const result = checkWeight(text, 10);
            assertEquals(result.count, 10);
            assertEquals(result.status, 'warning');
        });

        it('上限を超えるとオーバー状態になること', () => {
            const text = 'あいうえおかきくけこさ';
            const result = checkWeight(text, 10);
            assertEquals(result.count, 11);
            assertEquals(result.status, 'over');
        });

        it('サロゲートペア（絵文字など）を2文字としてカウントすること', () => {
            const text = '🍎🍊🍋🍉🍇';
            const result = checkWeight(text, 10);
            assertEquals(result.count, 10);
            assertEquals(result.status, 'warning');
        });
    });
});

// === 5. アウトライン・スタジオ テスト ===
describe('アウトライン・スタジオ', () => {
    const sample = `---
title: test
---

# タイトル

本文です。

## セクションA

内容A

### サブA-1

詳細

## セクションB

内容B
`;

    describe('parseHeadings [js/lib/markdown-headings.js]', () => {
        it('見出しを正しく解析すること', () => {
            const headings = parseHeadings(sample);
            assertEquals(headings.length, 4);
            assertEquals(headings[0].text, 'タイトル');
            assertEquals(headings[0].level, 1);
            assertEquals(headings[1].text, 'セクションA');
        });

        it('コードブロック内の # は見出しとして扱わないこと', () => {
            const text = '## 見出し\n\n```\n# コード内\n```\n';
            const headings = parseHeadings(text);
            assertEquals(headings.length, 1);
            assertEquals(headings[0].text, '見出し');
        });
    });

    describe('extractText [js/lib/markdown-headings.js]', () => {
        it('セクション抽出で見出しレベルを正規化すること', () => {
            const result = extractText(sample, { scope: 'section', cursorLine: 8 });
            assert(result.text.includes('# セクションA'), '正規化後の見出しが含まれていません');
            assert(result.text.includes('## サブA-1'), 'サブ見出しが含まれていません');
            assert(!result.text.includes('セクションB'), '次のセクションが混入しています');
        });

        it('エリア抽出で見出し行を含まないこと', () => {
            const result = extractText(sample, { scope: 'area', cursorLine: 8 });
            assert(!result.text.startsWith('##'), 'エリアに見出し行が含まれています');
            assert(result.text.includes('内容A'), 'エリアの本文が含まれていません');
        });

        it('全文コピーでは選択範囲より全文を優先すること', () => {
            const result = extractText('abc\ndef', { scope: 'full', selection: 'abc' });
            const expectedSource = (typeof t === 'function') ? t('tool.outlineStudio.sourceFull') : 'ノート全文';
            assertEquals(result.sourceName, expectedSource);
            assertEquals(result.text, 'abc\ndef');
        });
    });

    describe('formatCopyText [js/lib/markdown-headings.js]', () => {
        it('引用形式で各行に > を付与すること', () => {
            const result = formatCopyText('あ\n\nい', 'quote');
            assertEquals(result, '> あ\n>\n> い');
        });
    });

    describe('adjustHeadingLevels [js/lib/markdown-headings.js]', () => {
        it('見出しレベルを相対調整すること', () => {
            const text = '## A\n### B';
            const result = adjustHeadingLevels(text);
            assertEquals(result, '# A\n## B');
        });
    });

    describe('changeHeadingLevelSingleAtLine [js/lib/markdown-headings.js]', () => {
        it('見出しレベルを上下できること', () => {
            const text = '## 見出し';
            assertEquals(changeHeadingLevelSingleAtLine(text, 0, -1), '# 見出し');
            assertEquals(changeHeadingLevelSingleAtLine(text, 0, +1), '### 見出し');
        });

        it('単体レベル変更では子見出しが変わらないこと', () => {
            const text = '## A\n\n### B';
            assertEquals(changeHeadingLevelSingleAtLine(text, 0, -1), '# A\n\n### B');
        });
    });

    describe('changeHeadingLevelAtLine [js/lib/markdown-headings.js]', () => {
        it('レベル変更時に子見出しも追従すること', () => {
            const text = '## A\n\n### B\n\n#### C\n\n## D';
            const expected = '# A\n\n## B\n\n### C\n\n## D';
            const result = changeHeadingLevelAtLine(text, 0, -1);
            assertEquals(result, expected);
        });
    });

    describe('moveSection [js/lib/markdown-headings.js]', () => {
        it('同レベルのセクションを上に移動できること', () => {
            const text = '## A\na\n\n## B\nb';
            const result = moveSection(text, 3, 'up', 'full');
            assertEquals(result.moved, true, '移動されていません');
            assertEquals(result.text, '## B\nb\n\n## A\na');
            assertEquals(result.headingLine, 0);
        });

        it('単体移動では子見出しを残すこと', () => {
            const text = '## A\nparaA\n### subA\n\n## B\nparaB';
            const result = moveSection(text, 5, 'up', 'single');
            assertEquals(result.moved, true);
            assertEquals(result.text, '## B\nparaB\n### subA\n\n## A\nparaA');
        });
    });

    describe('jumpToHeading [js/lib/markdown-headings.js]', () => {
        it('前後の見出しへジャンプできること', () => {
            const text = '# A\n\n## B\n\n# C';
            const prev = jumpToHeading(text, 2, 'prev');
            const next = jumpToHeading(text, 2, 'next');
            assertEquals(prev.text, 'A');
            assertEquals(next.text, 'C');
        });
    });

    describe('checkStructureIssues [js/lib/markdown-headings.js]', () => {
        it('見出しレベルの飛ばしを検出すること', () => {
            const text = '# A\n\n### C';
            const issues = checkStructureIssues(text);
            assert(issues.length > 0, '構造の問題が検出されませんでした');
        });
    });
});

// === 6. メトロ・グリッド テスト ===
describe('メトロ・グリッド', () => {
    describe('parseData [tools/metro-grid/metro-grid.js]', () => {
        it('Markdownテーブルをパースできること', () => {
            const text = `
| A | B |
|:---|---:|
| 1 | 2 |
`;
            const data = parseData(text);
            assertEquals(data.type, 'md');
            assertEquals(data.headers.length, 2);
            assertEquals(data.alignments[0], 'left');
            assertEquals(data.alignments[1], 'right');
            assertEquals(data.rows[0][0], '1');
        });

        it('TSVデータをパースできること', () => {
            const text = `A\tB\n1\t2`;
            const data = parseData(text);
            assertEquals(data.type, 'tsv');
            assertEquals(data.headers[0], 'A');
            assertEquals(data.alignments[0], 'none');
            assertEquals(data.rows[0][1], '2');
        });
    });

    describe('sortGridData [tools/metro-grid/metro-grid.js]', () => {
        it('数値と文字列の混在を正しくソートできること', () => {
            const data = {
                rows: [['a', '10'], ['b', '2'], ['c', 'abc']]
            };
            sortGridData(data, 1, 'asc');
            assertEquals(data.rows[0][1], '2');
            assertEquals(data.rows[1][1], '10');
            assertEquals(data.rows[2][1], 'abc');
        });
    });

    describe('toMarkdown [tools/metro-grid/metro-grid.js]', () => {
        it('等幅Markdownを出力できること', () => {
            const data = {
                headers: ['Name', 'Age'],
                alignments: ['left', 'right'],
                rows: [['Alice', '20'], ['Bob', '1000']]
            };
            const md = toMarkdown(data, true);
            const lines = md.split('\n');
            assertEquals(lines[0], '| Name  |  Age |');
            assertEquals(lines[1], '| :---- | ---: |');
            assertEquals(lines[2], '| Alice |   20 |');
            assertEquals(lines[3], '| Bob   | 1000 |');
        });
    });
});

// === 7. カラム・ピッカー テスト ===
describe('カラム・ピッカー', () => {
    describe('parseHtmlTable [tools/column-picker/column-picker.js]', () => {
        it('HTMLテーブルを正しく列ごとにパースできること', () => {
            const html = `<table><tr><td>A</td><td>B</td></tr><tr><td>1</td><td>2</td></tr></table>`;
            const cols = parseHtmlTable(html);
            assertEquals(cols.length, 2);
            assertEquals(cols[0][0], 'A');
            assertEquals(cols[0][1], '1');
            assertEquals(cols[1][0], 'B');
            assertEquals(cols[1][1], '2');
        });

        it('<br>が改行に変換されること', () => {
            const html = `<table><tr><td>A<br>B</td></tr></table>`;
            const cols = parseHtmlTable(html);
            assertEquals(cols[0][0], 'A\nB');
        });

        it('テーブルがない場合はnullを返すこと', () => {
            const html = `<div><p>No table here</p></div>`;
            const cols = parseHtmlTable(html);
            assertEquals(cols, null);
        });
    });

    describe('parseTsv [tools/column-picker/column-picker.js]', () => {
        it('TSVデータを正しく列ごとにパースできること', () => {
            const tsv = `A\tB\n1\t2`;
            const cols = parseTsv(tsv);
            assertEquals(cols.length, 2);
            assertEquals(cols[0][0], 'A');
            assertEquals(cols[1][1], '2');
        });

        it('タブが含まれない場合はnullを返すこと', () => {
            const text = `A B\n1 2`;
            const cols = parseTsv(text);
            assertEquals(cols, null);
        });
    });
});

// === 8. ストレージ共通機能 テスト ===
describe('ストレージ共通機能', () => {
    describe('createToolStorage [js/lib/storage.js]', () => {
        it('通常モードでデータを保存・取得・削除できること', () => {
            setTempMode(false);
            const storage = createToolStorage('test-tool');
            storage.set('key1', 'value1');
            assertEquals(storage.get('key1'), 'value1');
            storage.set('key2', '100');
            assertEquals(storage.getNumber('key2'), 100);
            storage.remove('key1');
            assertEquals(storage.get('key1'), null);
            storage.remove('key2');
        });

        it('一時モード有効時はlocalStorageに保存されずメモリに保持されること', () => {
            setTempMode(true);
            const storage = createToolStorage('test-tool');
            storage.set('tempKey', 'tempValue');
            assertEquals(storage.get('tempKey'), 'tempValue');
            assertEquals(localStorage.getItem('test-tool-tempKey'), null);
            storage.remove('tempKey');
            assertEquals(storage.get('tempKey'), null);
            setTempMode(false);
        });
    });

    describe('copyToClipboard [js/lib/storage.js]', () => {
        it('copyToClipboard 関数が正しく定義されていること', () => {
            assert(typeof copyToClipboard === 'function', 'copyToClipboard が関数ではありません');
        });
    });

    describe('pasteFromClipboard [js/lib/storage.js]', () => {
        it('pasteFromClipboard 関数が正しく定義されていること', () => {
            assert(typeof pasteFromClipboard === 'function', 'pasteFromClipboard が関数ではありません');
        });
    });
});

// === 9. 国際化 (i18n) テスト ===
describe('国際化 (i18n)', () => {
    describe('detectBrowserLanguage [js/lib/i18n.js]', () => {
        it('日本語ロケール（ja, ja-JP）は ja を判定すること', () => {
            assertEquals(detectBrowserLanguage(['ja']), 'ja');
            assertEquals(detectBrowserLanguage(['ja-JP', 'en-US']), 'ja');
            assertEquals(detectBrowserLanguage(['JA']), 'ja');
        });

        it('日本語以外のロケール（en, fr, zh等）は en を判定すること', () => {
            assertEquals(detectBrowserLanguage(['en']), 'en');
            assertEquals(detectBrowserLanguage(['en-US', 'ja']), 'en');
            assertEquals(detectBrowserLanguage(['fr-FR']), 'en');
            assertEquals(detectBrowserLanguage([]), 'en');
        });
    });

    describe('getLanguage / setLanguage [js/lib/i18n.js]', () => {
        it('言語設定を保存および取得できること', () => {
            const original = localStorage.getItem('app-lang');
            try {
                setLanguage('en');
                assertEquals(getLanguage(), 'en');
                assertEquals(localStorage.getItem('app-lang'), 'en');

                setLanguage('ja');
                assertEquals(getLanguage(), 'ja');
                assertEquals(localStorage.getItem('app-lang'), 'ja');
            } finally {
                if (original) {
                    localStorage.setItem('app-lang', original);
                } else {
                    localStorage.removeItem('app-lang');
                }
            }
        });

        it('言語設定は一時モードの影響を受けずにlocalStorageに保存されること', () => {
            const original = localStorage.getItem('app-lang');
            try {
                setTempMode(true);
                setLanguage('en');
                // 一時モードが有効でも直接localStorageに保存される
                assertEquals(localStorage.getItem('app-lang'), 'en');
                assertEquals(getLanguage(), 'en');
                setTempMode(false);
            } finally {
                setTempMode(false);
                if (original) {
                    localStorage.setItem('app-lang', original);
                } else {
                    localStorage.removeItem('app-lang');
                }
            }
        });
    });

    describe('t [js/lib/i18n.js]', () => {
        it('日本語・英語の辞書から正しい文字列を取得できること', () => {
            assertEquals(t('common.clear', {}, 'ja'), 'クリア');
            assertEquals(t('common.clear', {}, 'en'), 'Clear');
            assertEquals(t('common.copy', {}, 'ja'), 'コピー');
            assertEquals(t('common.copy', {}, 'en'), 'Copy');
            assertEquals(t('common.paste', {}, 'ja'), '貼り付け');
            assertEquals(t('common.paste', {}, 'en'), 'Paste');
        });

        it('パラメータ置換（{0}, {1}など）が正しく行われること', () => {
            assertEquals(t('tool.20off.btn', [20], 'ja'), '20%削る');
            assertEquals(t('tool.20off.btn', [20], 'en'), 'Shave 20%');
            assertEquals(t('tool.sliceDrop.pageInfo', [1, 5], 'ja'), 'ページ 1 / 5');
            assertEquals(t('tool.sliceDrop.pageInfo', [1, 5], 'en'), 'Page 1 / 5');
        });

        it('未登録のキーはキー文字列をそのまま返すこと', () => {
            assertEquals(t('unknown.key.test', {}, 'ja'), 'unknown.key.test');
        });
    });

    describe('onLanguageChange [js/lib/i18n.js]', () => {
        it('言語変更時にリスナーが呼び出されること', () => {
            const original = localStorage.getItem('app-lang');
            let calledLang = null;
            const unsubscribe = onLanguageChange((lang) => {
                calledLang = lang;
            });
            try {
                setLanguage('en');
                assertEquals(calledLang, 'en');
                setLanguage('ja');
                assertEquals(calledLang, 'ja');
            } finally {
                unsubscribe();
                if (original) {
                    localStorage.setItem('app-lang', original);
                } else {
                    localStorage.removeItem('app-lang');
                }
            }
        });
    });
});

// === 上限コントロール テスト ===
describe('上限コントロール (Limit Controls)', () => {
    describe('calculateStepValue [js/lib/limit-controls.js]', () => {
        it('正のステップ値（+10, +100）が正しく加算されること', () => {
            assertEquals(calculateStepValue(140, 10, 10, 50000), 150);
            assertEquals(calculateStepValue(140, 100, 10, 50000), 240);
        });

        it('負のステップ値（-10, -100）が正しく減算されること', () => {
            assertEquals(calculateStepValue(140, -10, 10, 50000), 130);
            assertEquals(calculateStepValue(140, -100, 10, 50000), 40);
        });

        it('文字列型の現在値やステップ値でも正しく計算できること', () => {
            assertEquals(calculateStepValue('1000', '10', 1, 50000), 1010);
            assertEquals(calculateStepValue('1000', '-100', 1, 50000), 900);
        });

        it('最大値（max）を超えないように制限されること', () => {
            assertEquals(calculateStepValue(49950, 100, 10, 50000), 50000);
        });

        it('最小値（min）を下回らないように制限されること', () => {
            assertEquals(calculateStepValue(50, -100, 10, 50000), 10);
            assertEquals(calculateStepValue(5, -10, 1, 50000), 1);
        });

        it('入力値が無効（空文字など）の場合は最小値を基準に加減算されること', () => {
            assertEquals(calculateStepValue('', 10, 10, 50000), 20);
            assertEquals(calculateStepValue('abc', -10, 10, 50000), 10);
        });
    });
});

// === 10. クリップ・インスペクター テスト ===
describe('クリップ・インスペクター', () => {
    describe('formatBytes [tools/clip-inspector/clip-inspector.js]', () => {
        it('0バイトは「0 B」を返すこと', () => {
            assertEquals(formatBytes(0), '0 B');
        });

        it('1KB未満はバイト単位で表示すること', () => {
            assertEquals(formatBytes(512), '512 B');
        });

        it('1024バイトは「1 KB」に変換すること', () => {
            assertEquals(formatBytes(1024), '1 KB');
        });

        it('小数第1位で四捨五入すること', () => {
            assertEquals(formatBytes(1536), '1.5 KB');
        });

        it('1MB以上は「MB」に変換すること', () => {
            assertEquals(formatBytes(1048576), '1 MB');
        });

        it('無効な値は「—」を返すこと', () => {
            assertEquals(formatBytes(-1), '—');
            assertEquals(formatBytes('abc'), '—');
        });
    });

    describe('countUtf8Bytes [tools/clip-inspector/clip-inspector.js]', () => {
        it('ASCII文字列は1文字1バイトで数えること', () => {
            assertEquals(countUtf8Bytes('abc'), 3);
        });

        it('日本語は1文字3バイトで数えること', () => {
            assertEquals(countUtf8Bytes('桃'), 3);
        });

        it('絵文字（サロゲートペア）は4バイトで数えること', () => {
            assertEquals(countUtf8Bytes('🍎'), 4);
        });

        it('空文字列は0バイトを返すこと', () => {
            assertEquals(countUtf8Bytes(''), 0);
        });

        it('文字列以外は0バイトを返すこと', () => {
            assertEquals(countUtf8Bytes(null), 0);
            assertEquals(countUtf8Bytes(undefined), 0);
        });
    });

    describe('toHexDump [tools/clip-inspector/clip-inspector.js]', () => {
        it('空データは空文字を返すこと', () => {
            assertEquals(toHexDump(new Uint8Array(0)), '');
            assertEquals(toHexDump(null), '');
        });

        it('16バイト未満のデータを1行のHEXダンプに変換すること', () => {
            const dump = toHexDump(new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]));
            assert(dump.startsWith('00000000'), 'オフセットが先頭にありません');
            assert(dump.includes('48 65 6c 6c 6f'), 'HEX部分が不正です');
            assert(dump.includes('|Hello'), 'ASCII部分が不正です');
        });

        it('limitを超えるバイトは表示しないこと', () => {
            const bytes = new Uint8Array(32);
            bytes[16] = 0xff;
            const dump = toHexDump(bytes, 16);
            assertEquals(dump.split('\n').length, 1);
            assert(!dump.includes('ff'), 'limit以降のバイトが表示されています');
        });

        it('非印字文字は「.」で表示すること', () => {
            const dump = toHexDump(new Uint8Array([0x00]));
            assert(dump.includes('|.'), '制御文字が「.」に置き換えられていません');
        });
    });

    describe('categorizeFormat [tools/clip-inspector/clip-inspector.js]', () => {
        it('text/plain は「text」に分類すること', () => {
            assertEquals(categorizeFormat('text/plain'), 'text');
        });

        it('text/html は「html」に分類すること', () => {
            assertEquals(categorizeFormat('text/html'), 'html');
        });

        it('image/png は「image」に分類すること', () => {
            assertEquals(categorizeFormat('image/png'), 'image');
        });

        it('「web 」プレフィックス付きは「custom」に分類すること', () => {
            assertEquals(categorizeFormat('web application/x-test'), 'custom');
        });

        it('未知のタイプは「other」に分類すること', () => {
            assertEquals(categorizeFormat('application/octet-stream'), 'other');
        });

        it('空のタイプは「other」に分類すること', () => {
            assertEquals(categorizeFormat(''), 'other');
        });
    });

    describe('isTextLikeType [tools/clip-inspector/clip-inspector.js]', () => {
        it('text系・JSON・XMLはテキスト扱いすること', () => {
            assert(isTextLikeType('text/plain'));
            assert(isTextLikeType('text/html'));
            assert(isTextLikeType('application/json'));
            assert(isTextLikeType('application/xml'));
        });

        it('「web 」プレフィックス付きテキストもテキスト扱いすること', () => {
            assert(isTextLikeType('web text/html'));
        });

        it('画像やバイナリはテキスト扱いしないこと', () => {
            assert(!isTextLikeType('image/png'));
            assert(!isTextLikeType('application/octet-stream'));
        });

        it('空のタイプはテキスト扱いすること', () => {
            assert(isTextLikeType(''));
        });
    });

    describe('looksLikeText [tools/clip-inspector/clip-inspector.js]', () => {
        it('通常のテキストはtrueを返すこと', () => {
            assert(looksLikeText('こんにちは、世界'));
        });

        it('改行やタブを含むテキストはtrueを返すこと', () => {
            assert(looksLikeText('1行目\n2行目\t3行目'));
        });

        it('制御文字が多い文字列はfalseを返すこと', () => {
            assert(!looksLikeText('\x00\x01\x02\x03\x04\x05'));
        });

        it('空文字列はtrueを返すこと', () => {
            assert(looksLikeText(''));
        });

        it('文字列以外はfalseを返すこと', () => {
            assert(!looksLikeText(null));
        });
    });
});

// === テスト実行と結果描画 ===
let hasRun = false;

export default async function initTestRunner() {
    if (hasRun) return;
    hasRun = true;

    // テスト対象モジュールの安全な動的インポート
    try {
        const mod20Off = await import('../20-off/20-off.js');
        reduceText = mod20Off.reduceText;
    } catch (e) { console.warn('Failed to import 20-off:', e); }

    try {
        const modNorinori = await import('../norinori-note/norinori-note.js');
        makeNorinori = modNorinori.makeNorinori;
    } catch (e) { console.warn('Failed to import norinori-note:', e); }

    try {
        const modSlice = await import('../slice-drop/slice-drop.js');
        sliceText = modSlice.sliceText;
        canCopyAll = modSlice.canCopyAll;
        getReversedChunks = modSlice.getReversedChunks;
    } catch (e) { console.warn('Failed to import slice-drop:', e); }

    try {
        const modWeight = await import('../weight-over/weight-over.js');
        checkWeight = modWeight.checkWeight;
    } catch (e) { console.warn('Failed to import weight-over:', e); }

    try {
        const modMetro = await import('../metro-grid/metro-grid.js');
        parseData = modMetro.parseData;
        toMarkdown = modMetro.toMarkdown;
        sortGridData = modMetro.sortGridData;
    } catch (e) { console.warn('Failed to import metro-grid:', e); }

    try {
        const modCp = await import('../column-picker/column-picker.js');
        parseHtmlTable = modCp.parseHtmlTable;
        parseTsv = modCp.parseTsv;
    } catch (e) { console.warn('Failed to import column-picker:', e); }

    try {
        const modCbi = await import('../clip-inspector/clip-inspector.js');
        formatBytes = modCbi.formatBytes;
        countUtf8Bytes = modCbi.countUtf8Bytes;
        toHexDump = modCbi.toHexDump;
        categorizeFormat = modCbi.categorizeFormat;
        isTextLikeType = modCbi.isTextLikeType;
        looksLikeText = modCbi.looksLikeText;
    } catch (e) { console.warn('Failed to import clip-inspector:', e); }

    try {
        const modMd = await import('../../js/lib/markdown-headings.js');
        parseHeadings = modMd.parseHeadings;
        adjustHeadingLevels = modMd.adjustHeadingLevels;
        formatCopyText = modMd.formatCopyText;
        extractText = modMd.extractText;
        changeHeadingLevelAtLine = modMd.changeHeadingLevelAtLine;
        changeHeadingLevelSingleAtLine = modMd.changeHeadingLevelSingleAtLine;
        moveSection = modMd.moveSection;
        jumpToHeading = modMd.jumpToHeading;
        checkStructureIssues = modMd.checkStructureIssues;
    } catch (e) { console.warn('Failed to import markdown-headings:', e); }

    try {
        const modStorage = await import('../../js/lib/storage.js');
        createToolStorage = modStorage.createToolStorage;
        isTempMode = modStorage.isTempMode;
        setTempMode = modStorage.setTempMode;
        copyToClipboard = modStorage.copyToClipboard;
        pasteFromClipboard = modStorage.pasteFromClipboard;
    } catch (e) { console.warn('Failed to import storage:', e); }

    try {
        const modI18n = await import('../../js/lib/i18n.js');
        getLanguage = modI18n.getLanguage;
        setLanguage = modI18n.setLanguage;
        detectBrowserLanguage = modI18n.detectBrowserLanguage;
        t = modI18n.t;
        onLanguageChange = modI18n.onLanguageChange;
        applyTranslations = modI18n.applyTranslations;
    } catch (e) { console.warn('Failed to import i18n:', e); }

    try {
        const modLimit = await import('../../js/lib/limit-controls.js');
        calculateStepValue = modLimit.calculateStepValue;
    } catch (e) { console.warn('Failed to import limit-controls:', e); }

    const section = document.getElementById('tool-test-runner');
    if (section && applyTranslations) {
        applyTranslations(section);
        if (onLanguageChange) {
            onLanguageChange(() => applyTranslations(section));
        }
    }

    const versionDisplay = document.getElementById('test-app-version-display');
    if (versionDisplay) {
        getAppVersion('./sw.js').then(version => {
            versionDisplay.textContent = `v${version}`;
        });
    }

    const resultsContainer = document.getElementById('test-results');
    const totalCountEl = document.getElementById('total-count');
    const passedCountEl = document.getElementById('passed-count');
    const failedCountEl = document.getElementById('failed-count');

    if (!resultsContainer) return;

    resultsContainer.innerHTML = '';
    let totalCount = 0;
    let passedCount = 0;
    let failedCount = 0;

    function renderSuite(suite, level = 1) {
        const suiteEl = document.createElement('div');
        suiteEl.className = level === 1 ? 'test-suite' : 'test-subsuite';

        if (suite.name) {
            const titleEl = document.createElement('div');
            titleEl.className = level === 1 ? 'suite-title' : 'subsuite-title';
            titleEl.textContent = suite.name;
            suiteEl.appendChild(titleEl);
        }

        suite.cases.forEach(c => {
            totalCount++;
            const caseEl = document.createElement('div');
            caseEl.className = 'test-case';

            const flexCol = document.createElement('div');
            flexCol.className = 'flex-col';

            const nameEl = document.createElement('div');
            nameEl.className = 'test-name';
            nameEl.textContent = c.name;
            flexCol.appendChild(nameEl);

            const statusEl = document.createElement('div');
            statusEl.className = 'test-status';

            try {
                c.fn();
                statusEl.textContent = 'PASS';
                statusEl.classList.add('pass');
                passedCount++;
            } catch (err) {
                statusEl.textContent = 'FAIL';
                statusEl.classList.add('fail');
                failedCount++;

                const errorEl = document.createElement('div');
                errorEl.className = 'error-message';
                errorEl.textContent = err.stack || err.message;
                flexCol.appendChild(errorEl);
            }

            caseEl.appendChild(flexCol);
            caseEl.appendChild(statusEl);
            suiteEl.appendChild(caseEl);
        });

        suite.suites.forEach(sub => {
            suiteEl.appendChild(renderSuite(sub, level + 1));
        });

        return suiteEl;
    }

    suites.forEach(suite => {
        resultsContainer.appendChild(renderSuite(suite, 1));
    });

    totalCountEl.textContent = totalCount;
    passedCountEl.textContent = passedCount;
    failedCountEl.textContent = failedCount;
}