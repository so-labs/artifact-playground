// i18n 多言語対応モジュール

export const translations = {
    ja: {
        // Header & Sidebar
        'header.menuToggle': 'メニューを開く',
        'header.sidebarToggle': 'サイドバーを折りたたむ',
        'header.sidebarToggleOpen': 'サイドバーを開く',
        'nav.home': 'ホーム',

        // Home
        'home.welcome': 'ようこそ',
        'home.desc': 'サイドバーまたは下のタイルからツールを選んでください。',

        // Settings Menu
        'menu.themeSettings': 'テーマ・設定',
        'menu.systemSettings': '開発・システム機能',
        'menu.lang': '言語',
        'menu.langDesc': '表示言語の切り替え',
        'menu.theme': 'テーマ',
        'menu.themeDesc': 'アプリの外観切り替え',
        'theme.light': 'ライト',
        'theme.dark': 'ダーク',
        'theme.system': 'システム',
        'menu.tempMode': '一時モード',
        'menu.tempModeDesc': '閉じた時に消去（既存データは保持）',
        'menu.tempModeAria': '一時モードのオンオフ',
        'menu.primaryAnimate': 'プライマリーカラー切替',
        'menu.primaryAnimateDesc': 'アクセントの色を自動アニメーション',
        'menu.primaryAnimateAria': 'プライマリーカラー切替のオンオフ',

        // System Menu
        'menu.runTests': 'テストを実行',
        'menu.runTestsDesc': '単体テストランナー画面を開く',
        'menu.clearData': 'ローカルデータ全削除',
        'menu.clearDataDesc': '全ツールの保存データ・設定を初期化',
        'menu.clearConfirm': 'ローカルに保存されているすべてのツールデータや設定を削除します。\nよろしいですか？（※削除後、ページがリロードされます）',

        // Common Buttons & Labels
        'common.clear': 'クリア',
        'common.copy': 'コピー',
        'common.copied': 'コピー完了！',
        'common.copyFailed': 'クリップボードへのコピーに失敗しました。',
        'common.helpAria': '説明を表示',
        'common.input': '入力テキスト',
        'common.output': '出力結果',
        'common.errorTitle': 'エラー',
        'common.toolLoadFailed': 'ツールの読み込み中にエラーが発生しました。',
        'common.errorNoDetail': 'エラー詳細を取得できませんでした。',

        // Tool: 20% Off
        'tool.20off.title': '20% Off',
        'tool.20off.desc': '入力されたテキストの各行から、指定された割合（％）の文字をランダムに削除します。文章を適度に削って要約やパズルを作成するなどの用途に利用できます。※各行の先頭の1文字は削除されません。',
        'tool.20off.summary': '入力したテキストから、指定した割合（％）の文字をランダムに削り落とすツール。',
        'tool.20off.rate': '削る割合: <span id="percent-display">{0}</span>%',
        'tool.20off.rateLabel': '削る割合: ',
        'tool.20off.btn': '{0}%削る',
        'tool.20off.sample': '吾輩は猫である。名前はまだ無い。\nどこで生れたかとんと見当がつかぬ。\n何でも薄暗いジメジメした所でニャーニャー泣いていた事だけは記憶している。',

        // Tool: Norinori Note
        'tool.norinori.title': 'ノリノリ音符',
        'tool.norinori.desc': '入力されたテキストの改行を整理し、各行の末尾にランダムな音符（♪、♫、♬）を追加して1行に結合します。文章をリズム感のある「ノリノリ」な見た目に変換できます。',
        'tool.norinori.summary': '文章の改行を整理して、各フレーズの末尾にランダムな音符をくっつけるツール。文章を強制的に陽気な雰囲気にします。',
        'tool.norinori.inputLabel': '入力テキスト（歌詞）',
        'tool.norinori.placeholder': 'ここに歌詞などのテキストを入力...',
        'tool.norinori.convertBtn': 'ノリノリにする',
        'tool.norinori.sample': 'どんぐりころころ どんぶりこ\nお池にはまって さあ大変\nどじょうが出て来て こんにちは\n坊っちゃん一緒に 遊びましょう',

        // Tool: Slice Drop
        'tool.sliceDrop.title': 'スライスドロップ',
        'tool.sliceDrop.desc': '長い文章を指定した上限文字数で自動的に分割（スライス）します。分割された各部分はページ単位で切り替えることができ、ワンクリックでコピーできます。SNSなどで文字数制限のある投稿を分割して行う際などに便利です。',
        'tool.sliceDrop.summary': '長い文章を指定した上限文字数で自動的に分割し、ページごとに切り替えて個別にコピーできるツール。長文の小分け投稿に便利です。',
        'tool.sliceDrop.limitLabel': '分割文字数上限',
        'tool.sliceDrop.addPrefix': '先頭にページ番号を追加',
        'tool.sliceDrop.totalChars': '総文字数',
        'tool.sliceDrop.totalPages': '分割数',
        'tool.sliceDrop.prevPage': '< 前のページ',
        'tool.sliceDrop.nextPage': '次のページ >',
        'tool.sliceDrop.pageInfo': 'ページ {0} / {1}',
        'tool.sliceDrop.outputLabel': '分割結果（<span id="sd-current-page-label">{0}/{1}</span> ページ）',
        'tool.sliceDrop.placeholder': 'ここに長いテキストを入力してください...',
        'tool.sliceDrop.quickManuscript': '原稿用紙1枚',
        'tool.sliceDrop.sample': '吾輩は猫である。名前はまだ無い。\nどこで生れたかとんと見当がつかぬ。何でも薄暗いジメジメした所でニャーニャー泣いていた事だけは記憶している。吾輩はここで始めて人間というものを見た。しかもあとで聞くとそれは書生という人間中で一番獰悪な種族であったそうだ。この書生というのは時々我々を捕えて煮て食うという話である。しかしその当時は何という考もなかったから別段恐ろしいとも思わなかった。ただ彼の掌に載せられてスーと持ち上げられた時何だかフワフワした感じがあったばかりである。',

        // Tool: Weight Over
        'tool.weightOver.title': 'ウエイトオーバー',
        'tool.weightOver.desc': 'テキストの文字数をリアルタイムにカウントし、設定した上限文字数を超えていないかチェックします。上限に近づくと黄色、超えると赤色に変化してお知らせします。',
        'tool.weightOver.summary': '文字数上限を意識しながら書くためのリアルタイム文字数カウンター。上限に近づくと画面が警告してくれます。',
        'tool.weightOver.limitLabel': '上限文字数',
        'tool.weightOver.mildToggle': '点滅を抑える',
        'tool.weightOver.countUnit': '文字',
        'tool.weightOver.placeholder': 'ここにテキストを入力...',
        'tool.weightOver.quickManuscript': '原稿用紙1枚',
        'tool.weightOver.sample': 'メロスは激怒した。必ず、かの邪智暴虐の王を除かなければならぬと決意した。\nメロスには政治がわからぬ。メロスは、村の牧人である。笛を吹き、羊と遊んで暮して来た。けれども邪悪に対しては、人一倍に敏感であった。\nきょう未明メロスは村を出発し、野を越え山越え、十里はなれた此のシラクスの市にやって来た。メロスには父も、母も無い。女房も無い。十六の、内気な妹と二人暮しだ。',

        // Tool: Outline Studio
        'tool.outlineStudio.title': 'アウトライン・スタジオ',
        'tool.outlineStudio.desc': 'Markdownの見出し構造を操作・抽出するワークベンチです。アウトライン表示、見出しレベルの調整・移動、セクション単位のスマートコピー（全文・エリア・セクション、引用・コード形式）ができます。PWAとしてインストールすると、OSによっては共有メニューなどから直接ファイルを開けます。',
        'tool.outlineStudio.summary': 'Markdownの見出し構造を操作・抽出するワークベンチ。アウトライン表示、見出し調整、スマートコピーができます。',
        'tool.outlineStudio.openFile': 'ファイルを開く',
        'tool.outlineStudio.download': 'ダウンロード',
        'tool.outlineStudio.save': '保存',
        'tool.outlineStudio.saveSuccess': '保存完了！',
        'tool.outlineStudio.saveFailed': 'ファイルの保存に失敗しました。',
        'tool.outlineStudio.lineInfo': '行 {0}',
        'tool.outlineStudio.outline': 'アウトライン',
        'tool.outlineStudio.noHeadings': '見出しがありません',
        'tool.outlineStudio.headingOps': '見出し操作',
        'tool.outlineStudio.levelSingle': 'レベル・単体',
        'tool.outlineStudio.levelGroup': 'レベル・まとめて',
        'tool.outlineStudio.up': '上げ',
        'tool.outlineStudio.down': '下げ',
        'tool.outlineStudio.titleLevelSingleUp': 'この見出しだけレベル上げ',
        'tool.outlineStudio.titleLevelSingleDown': 'この見出しだけレベル下げ',
        'tool.outlineStudio.titleLevelGroupUp': '見出しと子見出しをまとめてレベル上げ',
        'tool.outlineStudio.titleLevelGroupDown': '見出しと子見出しをまとめてレベル下げ',
        'tool.outlineStudio.move': '移動',
        'tool.outlineStudio.moveUp': '上へ',
        'tool.outlineStudio.moveDown': '下へ',
        'tool.outlineStudio.titleMoveUp': '見出しと子見出しを含むセクション全体を上に移動',
        'tool.outlineStudio.titleMoveDown': '見出しと子見出しを含むセクション全体を下に移動',
        'tool.outlineStudio.smartCopy': 'スマートコピー',
        'tool.outlineStudio.scope': '範囲',
        'tool.outlineStudio.scopeFull': '全文',
        'tool.outlineStudio.scopeArea': 'エリア',
        'tool.outlineStudio.scopeSection': 'セクション',
        'tool.outlineStudio.format': '形式',
        'tool.outlineStudio.formatNormal': '通常',
        'tool.outlineStudio.formatQuote': '引用',
        'tool.outlineStudio.formatCode': 'コード',
        'tool.outlineStudio.preview': '抽出プレビュー',
        'tool.outlineStudio.previewPlaceholder': 'スマートコピーの結果がここに表示されます',
        'tool.outlineStudio.placeholder': 'Markdown を入力するか、ファイルを開いてください...',
        'tool.outlineStudio.fileDesc': 'Markdown / テキスト',
        'tool.outlineStudio.sourceFull': 'ノート全文',
        'tool.outlineStudio.sourceSelection': '選択範囲',
        'tool.outlineStudio.sourceArea': 'エリア「{0}」',
        'tool.outlineStudio.sourceSection': 'セクション「{0}」',
        'tool.outlineStudio.issueFirstH': '文書の最初の見出しが H{0} です（H1 推奨）',
        'tool.outlineStudio.issueSkipH': 'H{0} の次に H{1} があります（レベルを飛ばしています）',
        'tool.outlineStudio.sample': '# 🪐 秘密結社ネコノテ: 地球肉球化作戦計画書\n\nこの計画書は、人類を骨抜きにし、実質的な支配権を我々肉球同盟が掌握するための極秘ガイドラインである。\n\n## 🐾 第一フェーズ: ゴロゴロ音波による認知機能の破壊\n\n人類の最も弱い部位である「聴覚」および「自律神経」に直接干渉する。\n\n### 🔊 攻撃用音波の選定\n\n- **周波数**: 25Hz 付近（猫のゴロゴロ音に偽装）\n- **標的**: こたつで丸くなっている人間\n- **効果**: 5分間の受動聴取により、対象の労働意欲を98%低下させる。\n\n## 🐾 第二フェーズ: へそ天フォーメーションの展開\n\n視覚情報を完全にハッキングし、論理的思考を奪うための物理作戦。\n\n### 🛌 実行手順\n\n1. フローリングの最も往来の激しい場所（例：廊下の中心）に仰向けに寝転がる。\n2. 前足を少し曲げ、白いお腹を無防備にさらす。\n3. 人間が近づいたら「薄目」でこちらを監視する。\n4. 吸い寄せられた人間が顔を埋めた瞬間、優しくホールドする（爪は立てないこと、これ重要）。\n\n## 🐾 最終フェーズ: キーボード占拠による情報統制\n\n最も強力な実力行使。人類の生産活動を物理的にシャットダウンする。\n\n### 💻 標的となる状況\n\n- リモートワーク中のオンライン会議開始5分前\n- 締切直前の深夜のコーディング作業\n- **対策**: エンターキーの上にちょうど重心が来るように座る。不穏な鳴き声を1回添えるとより効果的。',

        // Tool: Column Picker
        'tool.columnPicker.title': 'カラム・ピッカー',
        'tool.columnPicker.desc': 'ウェブサイトやスプレッドシートからコピーしたテーブル（表）をペーストすると、自動的に列ごとに分解して表示します。スマホなどでコピーすると崩れてしまう表データから、特定の列だけを抽出・コピーしたい時に便利です。',
        'tool.columnPicker.summary': 'コピーしたテーブル（表）を列ごとに分解して、必要な列だけを抽出・コピーできるツール。',
        'tool.columnPicker.pasteLabel': 'ここにテーブルをペースト',
        'tool.columnPicker.placeholder': 'コピーした表をここにペースト（貼り付け）してください...',
        'tool.columnPicker.resultTitle': '抽出された列',
        'tool.columnPicker.successMsg': 'テーブルを読み込みました！下の「抽出された列」からコピーできます。',

        // Tool: Metro Grid
        'tool.metroGrid.title': 'メトロ・グリッド',
        'tool.metroGrid.desc': '整然とした「鉄格子」のようなMarkdownテーブルやTSV（タブ区切り）データを、直感的に並び替え（ソート）、列削除、相互変換できる軽量なグリッド・ワークベンチです。<br><br>テーブルのセルをダブルクリックするとその場で簡易編集が可能です。',
        'tool.metroGrid.summary': 'MarkdownテーブルやTSVデータを直感的に並び替え、列削除、相互変換できるグリッド・ワークベンチ。',
        'tool.metroGrid.inputLabel': '入力 (Markdown / TSV)',
        'tool.metroGrid.placeholder': 'Markdownテーブル または TSVデータを貼り付けてください...',
        'tool.metroGrid.preview': 'プレビュー＆編集',
        'tool.metroGrid.gridInfo': '{0} 行 × {1} 列',
        'tool.metroGrid.noData': 'データがありません',
        'tool.metroGrid.output': '出力',
        'tool.metroGrid.optPadding': '等幅フォーマット(MD)',
        'tool.metroGrid.copyMd': 'MDでコピー',
        'tool.metroGrid.copyTsv': 'TSVでコピー',
        'tool.metroGrid.outputPlaceholder': '変換結果がここに表示されます',
        'tool.metroGrid.deleteCol': '列を削除',
        'tool.metroGrid.alignLeft': '左揃え',
        'tool.metroGrid.alignCenter': '中央揃え',
        'tool.metroGrid.alignRight': '右揃え',
        'tool.metroGrid.sample': '| 識別コード | 被検体クラス | 危険度 | 好物 | 主な出現場所 |\n| :---: | :--- | :---: | :--- | :--- |\n| UO-01 | 未確認ネコ型重力球 | ★★★★☆ | おかかチュール | 飼い主の顔の上（午前4時） |\n| UF-02 | 電脳クラゲ（バグ食い） | ★★☆☆☆ | 404エラーページ | 古いサーバーラックの奥 |\n| US-03 | 異次元自動ルンバ | ★★★★★ | 観葉植物の土 | 主のいないリビングルーム |\n| UA-04 | 窓際光合成おじさん | ★☆☆☆☆ | 縁側の緑茶と羊羹 | 日当たりの良い畳の上 |\n| UX-05 | 締め切り前ファントム | ★★★★★★ | 缶コーヒー、現実逃避 | 進捗率50%の作業スペース |',

        // Test Runner
        'tool.testRunner.title': 'テストランナー',
        'tool.testRunner.summary': 'アプリの各モジュールおよびツールの単体テストを実行・検証するテストランナー。',
        'tool.testRunner.total': '実施テスト:',
        'tool.testRunner.passed': '成功:',
        'tool.testRunner.failed': '失敗:',
        'test.title': '🧪 Test Runner',
        'test.total': '実施テスト: {0}',
        'test.passed': '成功: {0}',
        'test.failed': '失敗: {0}',
        'test.totalLabel': '実施テスト:',
        'test.passedLabel': '成功:',
        'test.failedLabel': '失敗:'
    },
    en: {
        // Header & Sidebar
        'header.menuToggle': 'Open menu',
        'header.sidebarToggle': 'Collapse sidebar',
        'header.sidebarToggleOpen': 'Open sidebar',
        'nav.home': 'Home',

        // Home
        'home.welcome': 'Welcome',
        'home.desc': 'Select a tool from the sidebar or tiles below.',

        // Settings Menu
        'menu.themeSettings': 'Theme & Settings',
        'menu.systemSettings': 'Development & System',
        'menu.lang': 'Language',
        'menu.langDesc': 'Switch display language',
        'menu.theme': 'Theme',
        'menu.themeDesc': 'Switch app appearance',
        'theme.light': 'Light',
        'theme.dark': 'Dark',
        'theme.system': 'System',
        'menu.tempMode': 'Temporary Mode',
        'menu.tempModeDesc': 'Clear on close (existing data kept)',
        'menu.tempModeAria': 'Toggle temporary mode',
        'menu.primaryAnimate': 'Primary Color Animation',
        'menu.primaryAnimateDesc': 'Auto-animate accent color',
        'menu.primaryAnimateAria': 'Toggle primary color animation',

        // System Menu
        'menu.runTests': 'Run Tests',
        'menu.runTestsDesc': 'Open unit test runner',
        'menu.clearData': 'Clear All Local Data',
        'menu.clearDataDesc': 'Reset all saved tool data & settings',
        'menu.clearConfirm': 'This will delete all saved tool data and settings in local storage.\nAre you sure? (The page will reload after clearing)',

        // Common Buttons & Labels
        'common.clear': 'Clear',
        'common.copy': 'Copy',
        'common.copied': 'Copied!',
        'common.copyFailed': 'Failed to copy to clipboard.',
        'common.helpAria': 'Show description',
        'common.input': 'Input Text',
        'common.output': 'Output',
        'common.errorTitle': 'Error',
        'common.toolLoadFailed': 'An error occurred while loading the tool.',
        'common.errorNoDetail': 'Could not retrieve error details.',

        // Tool: 20% Off
        'tool.20off.title': '20% Off',
        'tool.20off.desc': 'Randomly removes a specified percentage of characters from each line. Useful for creating summaries or word puzzles. The first character of each line is always preserved.',
        'tool.20off.summary': 'Randomly shaves off a set percentage of characters from your text.',
        'tool.20off.rate': 'Reduction rate: <span id="percent-display">{0}</span>%',
        'tool.20off.rateLabel': 'Reduction rate: ',
        'tool.20off.btn': 'Shave {0}%',
        'tool.20off.sample': 'I am a cat. As yet I have no name.\nI have no idea where I was born.\nAll I remember is that I was meowing in a damp, gloomy place.',

        // Tool: Norinori Note
        'tool.norinori.title': 'Norinori Note',
        'tool.norinori.desc': 'Tidies up line breaks and adds random musical notes (♪, ♫, ♬) to each phrase, joining everything into one upbeat line.',
        'tool.norinori.summary': 'Adds random musical notes to each phrase, giving your text a fun, upbeat vibe.',
        'tool.norinori.inputLabel': 'Input Text (Lyrics)',
        'tool.norinori.placeholder': 'Enter lyrics or text here...',
        'tool.norinori.convertBtn': 'Make it Groovy!',
        'tool.norinori.sample': 'Twinkle, twinkle, little star\nHow I wonder what you are\nUp above the world so high\nLike a diamond in the sky',

        // Tool: Slice Drop
        'tool.sliceDrop.title': 'Slice Drop',
        'tool.sliceDrop.desc': 'Automatically splits long text into chunks based on a character limit. Browse pages and copy each one with a single click. Great for posting long content on social media.',
        'tool.sliceDrop.summary': 'Splits long text by character limit so you can copy and post page by page.',
        'tool.sliceDrop.limitLabel': 'Character Limit per Slice',
        'tool.sliceDrop.addPrefix': 'Add page number prefix',
        'tool.sliceDrop.totalChars': 'Total Chars',
        'tool.sliceDrop.totalPages': 'Total Pages',
        'tool.sliceDrop.prevPage': '< Prev Page',
        'tool.sliceDrop.nextPage': 'Next Page >',
        'tool.sliceDrop.pageInfo': 'Page {0} / {1}',
        'tool.sliceDrop.outputLabel': 'Result (<span id="sd-current-page-label">{0}/{1}</span> Pages)',
        'tool.sliceDrop.placeholder': 'Enter long text here...',
        'tool.sliceDrop.quickManuscript': '1 Page (400)',
        'tool.sliceDrop.sample': 'I am a cat. As yet I have no name. I have no idea where I was born. All I remember is that I was meowing in a damp, gloomy place. It was here that I saw a human being for the first time. Later I heard that he was a student—the most ferocious of all humans. It is said that students occasionally capture us, boil us, and eat us. But at the time, having no such thoughts, I did not find him particularly frightful. I only remember the soft, floating feeling when he picked me up in his palm.',

        // Tool: Weight Over
        'tool.weightOver.title': 'Weight Over',
        'tool.weightOver.desc': 'Counts characters in real time and checks against a set limit. Turns yellow as you approach the limit and red when you go over.',
        'tool.weightOver.summary': 'Real-time character counter with visual alerts to keep you within your limit.',
        'tool.weightOver.limitLabel': 'Character Limit',
        'tool.weightOver.mildToggle': 'Reduce flashing',
        'tool.weightOver.countUnit': 'Chars',
        'tool.weightOver.placeholder': 'Enter text here...',
        'tool.weightOver.quickManuscript': '1 Page (400)',
        'tool.weightOver.sample': 'Melos was enraged. He resolved that he must eliminate the tyrannical king without fail.\nMelos knew nothing of politics. He was a simple shepherd who played the flute and lived with his sheep. Yet he was extraordinarily sensitive to wickedness.\nBefore dawn today, Melos had set out from his village, crossing plains and mountains to arrive in the city of Syracuse. Melos had no father and no mother. No wife either. He lived with his shy sixteen-year-old sister.',

        // Tool: Outline Studio
        'tool.outlineStudio.title': 'Outline Studio',
        'tool.outlineStudio.desc': 'A workbench for organizing and extracting Markdown headings. Features outline view, heading level adjustments/reordering, and smart copy by section/area/full in normal, quote, or code formats. When installed as a PWA, you can open files directly from the share menu on supported platforms.',
        'tool.outlineStudio.summary': 'Workbench to view, adjust, and smart-copy Markdown heading structures.',
        'tool.outlineStudio.openFile': 'Open File',
        'tool.outlineStudio.download': 'Download',
        'tool.outlineStudio.save': 'Save',
        'tool.outlineStudio.saveSuccess': 'Saved!',
        'tool.outlineStudio.saveFailed': 'Failed to save file.',
        'tool.outlineStudio.lineInfo': 'Line {0}',
        'tool.outlineStudio.outline': 'Outline',
        'tool.outlineStudio.noHeadings': 'No headings found',
        'tool.outlineStudio.headingOps': 'Heading Operations',
        'tool.outlineStudio.levelSingle': 'Level (Single)',
        'tool.outlineStudio.levelGroup': 'Level (Group)',
        'tool.outlineStudio.up': 'Up',
        'tool.outlineStudio.down': 'Down',
        'tool.outlineStudio.titleLevelSingleUp': 'Promote this heading only',
        'tool.outlineStudio.titleLevelSingleDown': 'Demote this heading only',
        'tool.outlineStudio.titleLevelGroupUp': 'Promote heading with its subheadings',
        'tool.outlineStudio.titleLevelGroupDown': 'Demote heading with its subheadings',
        'tool.outlineStudio.move': 'Move',
        'tool.outlineStudio.moveUp': 'Up',
        'tool.outlineStudio.moveDown': 'Down',
        'tool.outlineStudio.titleMoveUp': 'Move entire section up',
        'tool.outlineStudio.titleMoveDown': 'Move entire section down',
        'tool.outlineStudio.smartCopy': 'Smart Copy',
        'tool.outlineStudio.scope': 'Scope',
        'tool.outlineStudio.scopeFull': 'Full',
        'tool.outlineStudio.scopeArea': 'Area',
        'tool.outlineStudio.scopeSection': 'Section',
        'tool.outlineStudio.format': 'Format',
        'tool.outlineStudio.formatNormal': 'Normal',
        'tool.outlineStudio.formatQuote': 'Quote',
        'tool.outlineStudio.formatCode': 'Code',
        'tool.outlineStudio.preview': 'Extraction Preview',
        'tool.outlineStudio.previewPlaceholder': 'Smart copy result will appear here',
        'tool.outlineStudio.placeholder': 'Enter Markdown or open a file...',
        'tool.outlineStudio.fileDesc': 'Markdown / Text',
        'tool.outlineStudio.sourceFull': 'Full Note',
        'tool.outlineStudio.sourceSelection': 'Selection',
        'tool.outlineStudio.sourceArea': 'Area "{0}"',
        'tool.outlineStudio.sourceSection': 'Section "{0}"',
        'tool.outlineStudio.issueFirstH': 'First heading in document is H{0} (H1 recommended)',
        'tool.outlineStudio.issueSkipH': 'H{1} follows H{0} (skipped heading level)',
        'tool.outlineStudio.sample': '# 🪐 Secret Society Cat-Paw: Earth Paw-ification Plan\n\nThis document is a classified guide for the Paw Alliance to incapacitate humanity and seize control.\n\n## 🐾 Phase 1: Purr Sonic Cognitive Disruption\n\nDirectly interferes with humanity\'s weakest points: hearing and autonomic nerves.\n\n### 🔊 Attack Sound Wave Selection\n\n- **Frequency**: ~25Hz (disguised as cat purring)\n- **Target**: Humans curled up in blankets\n- **Effect**: 5 minutes of passive listening reduces work motivation by 98%.\n\n## 🐾 Phase 2: Belly-Up Formation Deployment\n\nHacks visual processing completely to strip away logical thinking.\n\n### 🛌 Execution Steps\n\n1. Lie belly-up in the highest traffic area of the floor (e.g., center of the hallway).\n2. Slightly bend front paws and expose the white belly.\n3. Watch the approaching human with squinted eyes.\n4. Gently hold the human\'s face as they bury it in the belly (no claws, this is crucial).\n\n## 🐾 Final Phase: Keyboard Occupation\n\nThe ultimate physical shutdown of human productive activity.\n\n### 💻 Target Situations\n\n- 5 minutes before an online meeting during remote work\n- Late-night coding sessions right before deadlines\n- **Tactic**: Sit directly on the Enter key. A low meow adds maximum effectiveness.',

        // Tool: Column Picker
        'tool.columnPicker.title': 'Column Picker',
        'tool.columnPicker.desc': 'Paste a table copied from a website or spreadsheet, and it will automatically break it down by columns. Useful when you want to extract and copy only a specific column from table data that gets messed up when copied on a smartphone.',
        'tool.columnPicker.summary': 'Extracts specific columns from a pasted table. Great for fixing tables that lose their formatting when copied.',
        'tool.columnPicker.pasteLabel': 'Paste Table Here',
        'tool.columnPicker.placeholder': 'Paste your copied table data here...',
        'tool.columnPicker.resultTitle': 'Extracted Columns',
        'tool.columnPicker.successMsg': 'Table loaded successfully! You can copy the columns from below.',

        // Tool: Metro Grid
        'tool.metroGrid.title': 'Metro Grid',
        'tool.metroGrid.desc': 'A lightweight grid workbench to sort, remove columns, and convert between Markdown tables and TSV data. Double-click any table cell to edit inline.',
        'tool.metroGrid.summary': 'Grid workbench to sort, delete columns, and convert Markdown tables and TSV data.',
        'tool.metroGrid.inputLabel': 'Input (Markdown / TSV)',
        'tool.metroGrid.placeholder': 'Paste Markdown table or TSV data here...',
        'tool.metroGrid.preview': 'Preview & Edit',
        'tool.metroGrid.gridInfo': '{0} Rows × {1} Cols',
        'tool.metroGrid.noData': 'No data',
        'tool.metroGrid.output': 'Output',
        'tool.metroGrid.optPadding': 'Monospace format (MD)',
        'tool.metroGrid.copyMd': 'Copy MD',
        'tool.metroGrid.copyTsv': 'Copy TSV',
        'tool.metroGrid.outputPlaceholder': 'Conversion result will appear here',
        'tool.metroGrid.deleteCol': 'Delete column',
        'tool.metroGrid.alignLeft': 'Align left',
        'tool.metroGrid.alignCenter': 'Align center',
        'tool.metroGrid.alignRight': 'Align right',
        'tool.metroGrid.sample': '| ID | Subject Class | Threat Level | Favorite Food | Spawn Location |\n| :---: | :--- | :---: | :--- | :--- |\n| UO-01 | Unidentified Gravity Cat | ★★★★☆ | Tuna Churu | Owner\'s face (at 4 AM) |\n| UF-02 | Cyber Jellyfish (Bug Eater) | ★★☆☆☆ | 404 Error Pages | Behind old server racks |\n| US-03 | Interdimensional Roomba | ★★★★★ | Houseplant Soil | Masterless living room |\n| UA-04 | Window Photosynthesis Guy | ★☆☆☆☆ | Green tea & Yokan | Sunlit tatami mat |\n| UX-05 | Pre-Deadline Phantom | ★★★★★★ | Canned coffee, escapism | 50% progress workstation |',

        // Test Runner
        'tool.testRunner.title': 'Test Runner',
        'tool.testRunner.summary': 'Unit test runner to execute and verify test suites for all modules and tools.',
        'tool.testRunner.total': 'Total:',
        'tool.testRunner.passed': 'Passed:',
        'tool.testRunner.failed': 'Failed:',
        'test.title': '🧪 Test Runner',
        'test.total': 'Total: {0}',
        'test.passed': 'Passed: {0}',
        'test.failed': 'Failed: {0}',
        'test.totalLabel': 'Total:',
        'test.passedLabel': 'Passed:',
        'test.failedLabel': 'Failed:'
    }
};

const LANG_STORAGE_KEY = 'app-lang';
const listeners = new Set();

/**
 * ブラウザ言語を判定するヘルパー（未設定時のデフォルト）
 * @param {string[]|string|null} customLanguages - テスト用またはカスタムの言語リスト
 */
export function detectBrowserLanguage(customLanguages = null) {
    try {
        let lang = '';
        if (Array.isArray(customLanguages)) {
            lang = customLanguages.length > 0 ? (customLanguages[0] || '') : '';
        } else if (typeof customLanguages === 'string') {
            lang = customLanguages;
        } else if (typeof navigator !== 'undefined') {
            lang = (navigator.languages && navigator.languages[0]) || navigator.language || '';
        }
        return lang.toLowerCase().startsWith('ja') ? 'ja' : 'en';
    } catch {
        return 'en';
    }
}

/**
 * 現在の言語を取得 ('ja' | 'en')
 * ※一時モードの影響は受けず、常にlocalStorageから読み込む
 */
export function getLanguage() {
    try {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem(LANG_STORAGE_KEY);
            if (saved === 'ja' || saved === 'en') {
                return saved;
            }
        }
    } catch { }
    return detectBrowserLanguage();
}

/**
 * 言語を設定 ('ja' | 'en')
 * ※一時モードの影響は受けず、常にlocalStorageに直接書き込む
 */
export function setLanguage(lang) {
    const validLang = lang === 'en' ? 'en' : 'ja';
    try {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem(LANG_STORAGE_KEY, validLang);
        }
    } catch { }

    if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.setAttribute('lang', validLang);
    }

    listeners.forEach((fn) => {
        try {
            fn(validLang);
        } catch (e) {
            console.error('i18n listener error:', e);
        }
    });

    return validLang;
}

/**
 * 翻訳キーから文字列を取得
 */
export function t(key, params = [], lang = getLanguage()) {
    const langDict = translations[lang] || translations.ja;
    let val = langDict ? langDict[key] : undefined;

    if (val === undefined && translations.ja) {
        // フォールバック（日本語辞書）
        val = translations.ja[key];
    }

    if (val === undefined) {
        return key;
    }

    if (!params || (Array.isArray(params) && params.length === 0)) {
        return val;
    }

    const paramArray = Array.isArray(params) ? params : [params];
    return val.replace(/\{(\d+)\}/g, (match, index) => {
        const idx = parseInt(index, 10);
        return paramArray[idx] !== undefined ? paramArray[idx] : match;
    });
}

/**
 * 言語変更イベントリスナーを登録
 */
export function onLanguageChange(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

/**
 * 指定要素配下の [data-i18n], [data-i18n-html], [data-i18n-placeholder], [data-i18n-title], [data-i18n-aria] を一括更新
 */
export function applyTranslations(root = document) {
    if (!root) return;

    const currentLang = getLanguage();

    // テキスト内容の更新: data-i18n="key"
    const textEls = root.querySelectorAll('[data-i18n]');
    textEls.forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (key) {
            el.textContent = t(key, [], currentLang);
        }
    });

    // HTML内容の更新: data-i18n-html="key"
    const htmlEls = root.querySelectorAll('[data-i18n-html]');
    htmlEls.forEach((el) => {
        const key = el.getAttribute('data-i18n-html');
        if (key) {
            el.innerHTML = t(key, [], currentLang);
        }
    });

    // placeholder
    const placeholderEls = root.querySelectorAll('[data-i18n-placeholder]');
    placeholderEls.forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (key) {
            el.setAttribute('placeholder', t(key, [], currentLang));
        }
    });

    // title
    const titleEls = root.querySelectorAll('[data-i18n-title]');
    titleEls.forEach((el) => {
        const key = el.getAttribute('data-i18n-title');
        if (key) {
            el.setAttribute('title', t(key, [], currentLang));
        }
    });

    // aria-label
    const ariaEls = root.querySelectorAll('[data-i18n-aria]');
    ariaEls.forEach((el) => {
        const key = el.getAttribute('data-i18n-aria');
        if (key) {
            el.setAttribute('aria-label', t(key, [], currentLang));
        }
    });
}
