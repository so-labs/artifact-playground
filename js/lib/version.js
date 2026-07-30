/**
 * sw.js からキャッシュ名（CACHE_NAME）を解析してバージョン番号を取得するユーティリティ。
 * アプリのバージョン情報を sw.js に一元化（Single Source of Truth）するための仕組み。
 */
export async function getAppVersion(swPath = './sw.js') {
    try {
        // ブラウザの強力なキャッシュを回避して最新の sw.js を読み込む
        const response = await fetch(swPath, { cache: 'no-store' });
        if (!response.ok) return 'Unknown';

        const text = await response.text();
        // 例: const CACHE_NAME = 'artifact-playground-2026.07-r7';
        const match = text.match(/CACHE_NAME\s*=\s*['"]artifact-playground-(.+?)['"]/);

        if (match && match[1]) {
            return match[1];
        }
    } catch (e) {
        console.warn('Failed to fetch app version from sw.js:', e);
    }
    return 'Unknown';
}