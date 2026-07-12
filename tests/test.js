import { reduceText } from '../tools/20-off/20-off.js';
import { makeNorinori } from '../tools/norinori-note/norinori-note.js';
import { sliceText } from '../tools/slice-drop/slice-drop.js';
import { checkWeight } from '../tools/weight-over/weight-over.js';
import {
    parseHeadings,
    adjustHeadingLevels,
    formatCopyText,
    extractText,
    changeHeadingLevelAtLine,
    changeHeadingLevelSingleAtLine,
    moveSection,
    jumpToHeading,
    checkStructureIssues,
} from '../js/lib/markdown-headings.js';

const suites = [];
let currentSuite = null;

function describe(name, fn) {
    currentSuite = { name, cases: [] };
    suites.push(currentSuite);
    fn();
}

function it(name, fn) {
    currentSuite.cases.push({ name, fn });
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
describe('20% Off (reduceText)', () => {
    it('空テキストは空文字を返すこと', () => {
        assertEquals(reduceText('', 20), '');
    });

    it('先頭1文字は削られないこと', () => {
        const text = '吾輩';
        // 50%削る場合、2文字なら1文字削るが、先頭の「吾」は削らず「輩」が削られるはず
        const result = reduceText(text, 50);
        assertEquals(result, '吾');
    });

    it('割合に応じて文字が削られること', () => {
        const text = 'あいうえおかきくけこ'; // 10文字
        // 30%削減 -> 3文字削減されるはず
        const result = reduceText(text, 30);
        const chars = Array.from(result);
        assertEquals(chars.length, 7);
        assertEquals(chars[0], 'あ'); // 先頭は残る
    });
});

// === 2. ノリノリ音符 テスト ===
describe('ノリノリ音符 (makeNorinori)', () => {
    it('空テキストは空文字を返すこと', () => {
        assertEquals(makeNorinori(''), '');
    });

    it('各行の末尾に指定された音符のいずれかが付与され、改行が除去され1行になること', () => {
        const text = 'こんにちは\nさようなら';
        const notes = ['♪', '♫', '♬'];
        const result = makeNorinori(text, notes);

        // 改行は含まれない
        assert(!result.includes('\n'), '結果に改行が含まれています');

        // 元の行は 'こんにちは' と 'さようなら'
        // 結果は 'こんにちは[音符]さようなら[音符]' になるはず
        assert(result.startsWith('こんにちは'), '始まりが不正です');
        
        const middleChar = result[5]; // 'こんにちは'の次の文字
        assert(notes.includes(middleChar), '1行目の末尾に音符がありません');
        
        const lastChar = result[result.length - 1];
        assert(notes.includes(lastChar), '2行目の末尾に音符がありません');
    });
});

// === 3. スライスドロップ テスト ===
describe('スライスドロップ (sliceText)', () => {
    it('空テキストは空の配列を返すこと', () => {
        const result = sliceText('', 140, false);
        assertEquals(result.length, 0);
    });

    it('指定文字数で正しく分割されること (プレフィックスなし)', () => {
        const text = 'あいうえおかきくけこ'; // 10文字
        // 4文字ずつに分割
        const result = sliceText(text, 4, false);
        assertEquals(result.length, 3);
        assertEquals(result[0], 'あいうえ');
        assertEquals(result[1], 'おかきく');
        assertEquals(result[2], 'けこ');
    });

    it('サロゲートペア（絵文字など）を正しく分割できること', () => {
        const text = '🍎🍊🍋🍉🍇'; // 各5文字
        // 上限4文字（サロゲートペアは1文字あたり長さ2としてカウントされる）
        // よって、1ページあたり2つの絵文字が入るはず (2+2 = 4)。
        const result = sliceText(text, 4, false);
        assertEquals(result.length, 3);
        assertEquals(result[0], '🍎🍊');
        assertEquals(result[1], '🍋🍉');
        assertEquals(result[2], '🍇');
    });

    it('プレフィックスありで正しくページ番号が付与されること', () => {
        const text = 'あいうえおかき'; // 7文字
        // 上限を10にする。プレフィックス "1/2\n\n" の長さは5文字（1/2が3文字、\n\nが2文字）。
        // 有効上限は 10 - 5 = 5文字。
        // 'あいうえおかき' (7文字) を分割すると、
        // 1ページ目: 5文字 ('あいうえお')、2ページ目: 2文字 ('かき')
        const result = sliceText(text, 10, true);
        assertEquals(result.length, 2);
        assertEquals(result[0], '1/2\n\nあいうえお');
        assertEquals(result[1], '2/2\n\nかき');
    });
});

// === 4. ウエイトオーバー テスト ===
describe('ウエイトオーバー (checkWeight)', () => {
    it('上限以下では通常状態であること', () => {
        const text = 'あいうえお'; // 5文字
        const result = checkWeight(text, 10);
        assertEquals(result.count, 5);
        assertEquals(result.status, 'normal');
    });

    it('上限の95%超えで警告状態になること', () => {
        const text = 'あいうえおかきくけこ'; // 10文字
        // 10文字、上限 10 の 95% = 9.5文字。10文字は95%を超える。
        const result = checkWeight(text, 10);
        assertEquals(result.count, 10);
        assertEquals(result.status, 'warning');
    });

    it('上限を超えるとオーバー状態になること', () => {
        const text = 'あいうえおかきくけこさ'; // 11文字
        const result = checkWeight(text, 10);
        assertEquals(result.count, 11);
        assertEquals(result.status, 'over');
    });

    it('サロゲートペア（絵文字など）を2文字としてカウントすること', () => {
        const text = '🍎🍊🍋🍉🍇'; // 5つの絵文字 = 10文字分
        const result = checkWeight(text, 10);
        assertEquals(result.count, 10);
        assertEquals(result.status, 'warning'); // 10文字は上限10の95%超えなのでwarning
    });
});

// === 5. アウトライン・スタジオ テスト ===
describe('アウトライン・スタジオ (markdown-headings)', () => {
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
        assertEquals(result.sourceName, 'ノート全文');
        assertEquals(result.text, 'abc\ndef');
    });

    it('引用形式で各行に > を付与すること', () => {
        const result = formatCopyText('あ\n\nい', 'quote');
        assertEquals(result, '> あ\n>\n> い');
    });

    it('見出しレベルを相対調整すること', () => {
        const text = '## A\n### B';
        const result = adjustHeadingLevels(text);
        assertEquals(result, '# A\n## B');
    });

    it('見出しレベルを上下できること', () => {
        const text = '## 見出し';
        assertEquals(changeHeadingLevelSingleAtLine(text, 0, -1), '# 見出し');
        assertEquals(changeHeadingLevelSingleAtLine(text, 0, +1), '### 見出し');
    });

    it('単体レベル変更では子見出しが変わらないこと', () => {
        const text = '## A\n\n### B';
        assertEquals(changeHeadingLevelSingleAtLine(text, 0, -1), '# A\n\n### B');
    });

    it('レベル変更時に子見出しも追従すること', () => {
        const text = '## A\n\n### B\n\n#### C\n\n## D';
        const expected = '# A\n\n## B\n\n### C\n\n## D';
        const result = changeHeadingLevelAtLine(text, 0, -1);
        assertEquals(result, expected);
    });

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

    it('前後の見出しへジャンプできること', () => {
        const text = '# A\n\n## B\n\n# C';
        const prev = jumpToHeading(text, 2, 'prev');
        const next = jumpToHeading(text, 2, 'next');
        assertEquals(prev.text, 'A');
        assertEquals(next.text, 'C');
    });

    it('見出しレベルの飛ばしを検出すること', () => {
        const text = '# A\n\n### C';
        const issues = checkStructureIssues(text);
        assert(issues.length > 0, '構造の問題が検出されませんでした');
    });
});

// === テスト実行と結果描画 ===
window.addEventListener('DOMContentLoaded', () => {
    const resultsContainer = document.getElementById('test-results');
    const totalCountEl = document.getElementById('total-count');
    const passedCountEl = document.getElementById('passed-count');
    const failedCountEl = document.getElementById('failed-count');

    let totalCount = 0;
    let passedCount = 0;
    let failedCount = 0;

    suites.forEach(suite => {
        const suiteEl = document.createElement('div');
        suiteEl.className = 'test-suite';

        const titleEl = document.createElement('div');
        titleEl.className = 'suite-title';
        titleEl.textContent = suite.name;
        suiteEl.appendChild(titleEl);

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

        resultsContainer.appendChild(suiteEl);
    });

    totalCountEl.textContent = totalCount;
    passedCountEl.textContent = passedCount;
    failedCountEl.textContent = failedCount;
});