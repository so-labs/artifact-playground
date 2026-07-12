// Markdown 見出し解析・操作の共通ライブラリ

export function splitLines(text) {
    return text.split(/\r?\n/);
}

export function getLineNumberFromPosition(text, position) {
    const before = text.slice(0, position);
    return (before.match(/\n/g) || []).length;
}

export function getLineStartPosition(text, lineIndex) {
    const lines = splitLines(text);
    let pos = 0;
    for (let i = 0; i < lineIndex && i < lines.length; i++) {
        pos += lines[i].length + 1;
    }
    return pos;
}

function createContext() {
    return { isInCodeBlock: false, codeBlockDelimiter: null, isInFrontMatter: false };
}

function resetContext(ctx) {
    ctx.isInCodeBlock = false;
    ctx.codeBlockDelimiter = null;
    ctx.isInFrontMatter = false;
}

function updateContext(ctx, line, index) {
    const trimmed = line.trim();

    if (index === 0 && trimmed === '---') {
        ctx.isInFrontMatter = true;
        return;
    }
    if (ctx.isInFrontMatter && trimmed === '---') {
        ctx.isInFrontMatter = false;
        return;
    }
    if (ctx.isInFrontMatter) return;

    if (!ctx.isInCodeBlock) {
        const match = trimmed.match(/^(`{3,}|~{3,})/);
        if (match) {
            ctx.isInCodeBlock = true;
            ctx.codeBlockDelimiter = match[1];
        }
    } else if (trimmed.startsWith(ctx.codeBlockDelimiter)) {
        ctx.isInCodeBlock = false;
        ctx.codeBlockDelimiter = null;
    }
}

function isActiveHeadingLine(ctx) {
    return !ctx.isInFrontMatter && !ctx.isInCodeBlock;
}

export function parseHeadings(text) {
    const lines = splitLines(text);
    const ctx = createContext();
    const headings = [];

    lines.forEach((line, i) => {
        updateContext(ctx, line, i);
        if (!isActiveHeadingLine(ctx)) return;

        const match = line.match(/^(#+)\s+(.+)$/);
        if (match) {
            headings.push({
                line: i,
                level: match[1].length,
                text: match[2].trim(),
                raw: line,
            });
        }
    });

    return headings;
}

export function adjustHeadingLevels(text) {
    const lines = splitLines(text);
    let minLevel = Infinity;
    const ctx = createContext();

    lines.forEach((line, i) => {
        updateContext(ctx, line, i);
        if (!isActiveHeadingLine(ctx)) return;

        const headingMatch = line.match(/^(#+)\s/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            if (level < minLevel) minLevel = level;
        }
    });

    if (minLevel === Infinity) return text;

    const offset = minLevel - 1;
    resetContext(ctx);

    return lines.map((line, i) => {
        updateContext(ctx, line, i);
        if (!isActiveHeadingLine(ctx)) return line;

        return line.replace(/^(#+)(\s)/, (_m, hashes, space) => {
            const newLevel = Math.max(1, hashes.length - offset);
            return '#'.repeat(newLevel) + space;
        });
    }).join('\n');
}

export function formatCopyText(text, type = 'normal') {
    if (!text) return '';

    text = text.replace(/^[\r\n]+/, '').replace(/[\r\n]+$/, '');

    if (type === 'quote') {
        const tempText = text.replace(/　/g, ' ');
        return tempText.split(/\r?\n/).map(line => (
            line.trim() === '' ? '>' : `> ${line}`
        )).join('\n');
    }

    if (type === 'code') {
        const matches = text.match(/^[ \t]{0,3}`+/gm) || [];
        const maxTicks = matches.length > 0
            ? Math.max(...matches.map(m => m.replace(/[^`]/g, '').length))
            : 0;
        const tickCount = Math.max(3, maxTicks + 1);
        const fence = '`'.repeat(tickCount);
        return `${fence}markdown\n${text}\n${fence}\n`;
    }

    return text;
}

function trimSectionEnd(lines, startLine, endLine) {
    let actualEndLine = endLine;
    while (actualEndLine > startLine) {
        const lineContent = lines[actualEndLine - 1].trim();
        if (lineContent === '' || lineContent.match(/^[-_*]{3,}$/)) {
            actualEndLine--;
        } else {
            break;
        }
    }
    return actualEndLine;
}

function findHeadingAtOrBefore(headings, cursorLine) {
    let idx = -1;
    for (let i = 0; i < headings.length; i++) {
        if (headings[i].line <= cursorLine) {
            idx = i;
        } else {
            break;
        }
    }
    return idx;
}

function resolveScopeRange(lines, scope, cursorLine) {
    const ctx = createContext();
    let startLine = 0;
    let endLine = lines.length;
    let currentHeadingText = '現在の範囲';
    let currentHeadingLevel = 7;

    for (let i = 0; i < lines.length; i++) {
        updateContext(ctx, lines[i], i);
        if (!isActiveHeadingLine(ctx)) continue;

        const headingMatch = lines[i].match(/^(#+)\s/);
        if (headingMatch) {
            const level = headingMatch[1].length;
            if (i > cursorLine) break;

            startLine = scope === 'area' ? i + 1 : i;
            currentHeadingLevel = level;
            currentHeadingText = lines[i].trim();
        }
    }

    resetContext(ctx);

    for (let i = 0; i < lines.length; i++) {
        updateContext(ctx, lines[i], i);
        if (!isActiveHeadingLine(ctx)) continue;

        if (i <= (scope === 'area' ? cursorLine : startLine)) continue;

        const headingMatch = lines[i].match(/^(#+)\s/);
        if (headingMatch) {
            const level = headingMatch[1].length;

            if (scope === 'area') {
                endLine = i;
                break;
            }
            if (scope === 'section' && level <= currentHeadingLevel) {
                endLine = i;
                break;
            }
        }
    }

    if (startLine > lines.length) startLine = lines.length;

    const actualEndLine = trimSectionEnd(lines, startLine, endLine);
    const sourceName = scope === 'area'
        ? `エリア「${currentHeadingText}」`
        : `セクション「${currentHeadingText}」`;

    return { startLine, endLine: actualEndLine, sourceName, currentHeadingText };
}

export function extractText(text, { scope = 'section', cursorLine = 0, selection = '' } = {}) {
    if (!text) {
        return { text: '', sourceName: '', startLine: 0, endLine: 0 };
    }

    if (scope === 'full') {
        return { text, sourceName: 'ノート全文', startLine: 0, endLine: splitLines(text).length };
    }

    if (selection && selection.trim().length > 0) {
        return { text: selection, sourceName: '選択範囲', startLine: -1, endLine: -1 };
    }

    const lines = splitLines(text);
    const { startLine, endLine, sourceName } = resolveScopeRange(lines, scope, cursorLine);

    if (startLine >= endLine) {
        return { text: '', sourceName, startLine, endLine };
    }

    let result = lines.slice(startLine, endLine).join('\n');

    if (scope === 'section') {
        result = adjustHeadingLevels(result);
    }

    return { text: result, sourceName, startLine, endLine };
}

export function changeHeadingLevelSingleAtLine(text, lineIndex, delta) {
    const lines = splitLines(text);
    if (lineIndex < 0 || lineIndex >= lines.length) return text;

    const line = lines[lineIndex];
    const match = line.match(/^(#+)(\s+)(.*)$/);
    if (!match) return text;

    const newLevel = Math.max(1, Math.min(6, match[1].length + delta));
    lines[lineIndex] = '#'.repeat(newLevel) + match[2] + match[3];
    return lines.join('\n');
}

export function changeHeadingLevelAtLine(text, lineIndex, delta) {
    const lines = splitLines(text);
    if (lineIndex < 0 || lineIndex >= lines.length) return text;

    const headings = parseHeadings(text);
    const current = headings.find(h => h.line === lineIndex);
    if (!current) return text;

    const bounds = getSectionBounds(text, lineIndex);
    if (!bounds) return text;

    const affectedLines = headings
        .filter(h => h.line >= bounds.startLine && h.line < bounds.endLine)
        .filter(h => h.line === lineIndex || h.level > current.level)
        .map(h => h.line);

    affectedLines.forEach((idx) => {
        const line = lines[idx];
        const match = line.match(/^(#+)(\s+)(.*)$/);
        if (!match) return;
        const newLevel = Math.max(1, Math.min(6, match[1].length + delta));
        lines[idx] = '#'.repeat(newLevel) + match[2] + match[3];
    });

    return lines.join('\n');
}

export function getHeadingBlockBounds(text, headingLine, mode = 'full') {
    const lines = splitLines(text);
    const headings = parseHeadings(text);
    const current = headings.find(h => h.line === headingLine);
    if (!current) return null;

    let endLine = lines.length;
    for (const h of headings) {
        if (h.line > headingLine) {
            if (mode === 'single' || h.level <= current.level) {
                endLine = h.line;
                break;
            }
        }
    }

    endLine = trimSectionEnd(lines, headingLine, endLine);
    return { startLine: headingLine, endLine, level: current.level };
}

export function getSectionBounds(text, headingLine) {
    return getHeadingBlockBounds(text, headingLine, 'full');
}

export function moveSection(text, cursorLine, direction, mode = 'full') {
    const headings = parseHeadings(text);
    const currentIdx = findHeadingAtOrBefore(headings, cursorLine);
    if (currentIdx < 0) return { text, headingLine: null, moved: false };

    const current = headings[currentIdx];
    const lines = splitLines(text);
    const currentBounds = getHeadingBlockBounds(text, current.line, mode);
    if (!currentBounds) return { text, headingLine: current.line, moved: false };

    let swapBounds = null;

    if (direction === 'up') {
        for (let i = currentIdx - 1; i >= 0; i--) {
            if (headings[i].level === current.level) {
                swapBounds = getHeadingBlockBounds(text, headings[i].line, mode);
                break;
            }
        }
        if (!swapBounds) return { text, headingLine: current.line, moved: false };

        const before = lines.slice(0, swapBounds.startLine);
        const currentSection = lines.slice(currentBounds.startLine, currentBounds.endLine);
        const between = lines.slice(swapBounds.endLine, currentBounds.startLine);
        const swapSection = lines.slice(swapBounds.startLine, swapBounds.endLine);
        const after = lines.slice(currentBounds.endLine);

        return {
            text: [...before, ...currentSection, ...between, ...swapSection, ...after].join('\n'),
            headingLine: swapBounds.startLine,
            moved: true,
        };
    }

    for (let i = currentIdx + 1; i < headings.length; i++) {
        if (headings[i].level === current.level) {
            swapBounds = getHeadingBlockBounds(text, headings[i].line, mode);
            break;
        }
    }
    if (!swapBounds) return { text, headingLine: current.line, moved: false };

    const before = lines.slice(0, currentBounds.startLine);
    const swapSection = lines.slice(swapBounds.startLine, swapBounds.endLine);
    const between = lines.slice(currentBounds.endLine, swapBounds.startLine);
    const currentSection = lines.slice(currentBounds.startLine, currentBounds.endLine);
    const after = lines.slice(swapBounds.endLine);
    const newHeadingLine = before.length + swapSection.length + between.length;

    return {
        text: [...before, ...swapSection, ...between, ...currentSection, ...after].join('\n'),
        headingLine: newHeadingLine,
        moved: true,
    };
}

export function jumpToHeading(text, cursorLine, direction) {
    const headings = parseHeadings(text);
    if (headings.length === 0) return null;

    if (direction === 'prev') {
        let target = null;
        for (const h of headings) {
            if (h.line < cursorLine) target = h;
            else break;
        }
        return target;
    }

    for (const h of headings) {
        if (h.line > cursorLine) return h;
    }
    return null;
}

export function findHeadingLineAtCursor(text, cursorLine) {
    const headings = parseHeadings(text);
    const idx = findHeadingAtOrBefore(headings, cursorLine);
    return idx >= 0 ? headings[idx].line : null;
}

export function checkStructureIssues(text) {
    const headings = parseHeadings(text);
    const issues = [];

    if (headings.length === 0) return issues;

    let prevLevel = 0;
    headings.forEach((h, i) => {
        if (i === 0 && h.level > 1) {
            issues.push({ line: h.line, message: `文書の最初の見出しが H${h.level} です（H1 推奨）` });
        }
        if (h.level > prevLevel + 1 && prevLevel > 0) {
            issues.push({ line: h.line, message: `H${prevLevel} の次に H${h.level} があります（レベルを飛ばしています）` });
        }
        prevLevel = h.level;
    });

    return issues;
}
