---
marp: true
theme: default
paginate: true
size: 16:9
style: |
  /* 全ページ共通：上詰め左寄せ */
  section {
    display: flex !important;
    flex-direction: column !important;
    justify-content: flex-start !important;
    text-align: left;
    padding-top: 160px; /* タイトル分のスペース */
    padding-left: 80px;
    padding-right: 80px;
    gap: 20px; /* 要素間の間隔 */
  }
  
  /* タイトル：絶対配置で位置を固定 */
  h1 {
    position: absolute;
    top: 50px;
    left: 80px;
    font-size: 48px;
    margin: 0;
    color: #333;
  }

  /* 要素の余計なマージンをリセットしてgapで制御 */
  p, ul, ol {
    margin-top: 0;
    margin-bottom: 0;
  }

  /* リストの行間 */
  li {
    margin-bottom: 10px;
  }

  /* 表紙（lead）だけ中央揃えに戻す */
  section.lead {
    display: flex !important;
    flex-direction: column !important;
    justify-content: center !important;
    align-items: center !important;
    text-align: center !important;
    padding: 50px !important;
  }
  section.lead h1 {
    position: static !important; /* 表紙は固定しない */
    margin-bottom: 20px !important;
  }

  /* 2カラムレイアウト用 */
  .columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
    width: 100%;
  }
---

<!-- _class: lead -->

# ずんだもんスライド動画生成

## Markdownから動画を自動生成

<!-- voice: ずんだもんスライド動画生成ツールへようこそなのだ。これからこのツールの紹介を始めるのだ。 -->

---

# この動画について

<!-- voice: こんにちは、ずんだもんです。今日はマークダウンから動画を自動生成するツールについて、もっと詳しく紹介するのだ。 -->

- Markdownからスライドを作成
- VOICEVOXで音声を生成
- Remotionで動画に結合

---

# 全体の仕組み

<!-- voice: まずは全体の仕組みのおさらいなのだ。マープで画像を作り、ボイスボックスで音声を作り、最後にリモーションで合体させるという流れなのだ。それぞれが連携して動画ができるのだ。 -->

1. **Marp**: Markdown -> 画像
2. **VOICEVOX**: テキスト -> 音声
3. **Remotion**: 画像 + 音声 -> 動画

---

# ステップ1: Marpとは？

<!-- voice: ステップ1はマープなのだ。これはマークダウンで書いたテキストを、おしゃれなスライド画像に変換してくれるツールなのだ。シーエスエスでデザインも自由自在なのだ。 -->

- **Markdown** でスライドを記述
- テーマやデザインもCSSで調整可能
- PDFや画像形式でエクスポート

---

# Marpの書き方

<!-- voice: マープの書き方はこんな感じなのだ。左のように書くと、右のようなスライドになるのだ。とてもシンプルで覚えやすいのだ。 -->

<div class="columns">
<div>

ハイフン3つでページを区切るだけ！

- タイトル
- 箇条書き

</div>
<div>

```markdown
---
marp: true
---

# タイトル

- 箇条書き1
- 箇条書き2

---

# 2ページ目
```

</div>
</div>

---

# Marpのいいところ

<!-- voice: ブイエスコードの拡張機能を使えば、リアルタイムでプレビューしながら編集できるのが最強なのだ。パワーポイントのような微調整作業から開放されるのだ。 -->

- **VS Code拡張機能** が便利
- リアルタイムプレビュー
- バージョン管理しやすい（テキストだから）

---

# ステップ2: VOICEVOX

<!-- voice:
ステップ2はボイスボックスなのだ。
漢字もカタカナも英語も、ある程度自動で判別して読んでくれるから、
原稿作成がとても楽になるのだ。
このように少し長い文章を入力しても、
息継ぎやイントネーションを自動で調整して、
自然な発音で読み上げてくれるのがボイスボックスのすごいところなのだ。
-->

- **テキスト読み上げ** ソフトウェア
- 多くのキャラクターが利用可能
- 商用利用も容易（規約による）

---

# VOICEVOXの自動化

<!-- voice: 今回はドッカーを使ってAPIサーバーを立ち上げ、プログラムから喋らせる内容を送信しているのだ。これで自動化ができるのだ。 -->

プログラムからHTTPリクエストを送るだけ！

```bash
# クエリ作成
POST /audio_query?text=こんにちは

# 音声合成
POST /synthesis
```

---

# ステップ3: Remotion

<!-- voice: 最後のステップはリモーションなのだ。これはリアクトを使って動画を作るフレームワークなのだ。エンジニアにはたまらないツールなのだ。 -->

- **React** で動画を作成
- プログラマブルに映像を制御
- プレビューやレンダリングが容易

---

# Remotionのコード

<!-- voice: 動画の中身もリアクトのコンポーネントなのだ。画像や音声を、ジェーエスエックスで記述して配置していくのだ。 -->

```tsx
export const MyVideo = () => {
  return (
    <AbsoluteFill>
      <Img src={imageSrc} />
      <Audio src={audioSrc} />
    </AbsoluteFill>
  );
};
```

---

# このツールの推しポイント

<!-- voice: さて、このツールの最大の特徴を紹介するのだ。まずは3つの技術を統合していること。そして完全自動化されていること。さらにマークダウンを書くだけでいい、マークダウンドリブンであることなのだ。 -->

- **3つの技術を統合**！
  - Marp x VOICEVOX x Remotion
- **完全自動化**！
  - コマンド一発
- **Markdownドリブン**！
  - 原稿に集中できる

---

# 原稿とスライドの一元管理

<!-- voice: 特に重要なのが、原稿とスライドの一元管理なのだ。スライドの中にコメントで台詞を書くことで、スライドと喋る内容がズレるのを防げるのだ。修正も楽ちんなのだ。 -->

- Markdown内に台詞を記述
  `<!-- voice: セリフ -->`
- **原稿とスライドが同じファイル**
- 修正が楽！

---

# まとめ

<!-- voice: これらを組み合わせることで、原稿を書くだけで動画が完成するのだ！作業効率が爆上がりすること間違いなしなのだ。ぜひ試してみてほしいのだ。 -->

**Markdown** を書くだけで動画が完成！
作業効率が大幅アップ！
ずんだもんも大活躍！

---

# おまけ 1

<!-- voice: 実は、このスライドの原稿もジェミナイが作っているのだ。AIが原稿を書いて、AIが喋る。すごい時代なのだ。 -->

このスライド原稿は **Gemini** が執筆しました。

- 構成案: Gemini
- 本文執筆: Gemini
- 推敲: Gemini

---

# おまけ 2

<!-- voice: さらに言うと、この動画生成ツール自体のコードも、ジェミナイが書いたのだ。人間は指示を出しただけなのだ。ジェミナイすごすぎるのだ！ -->

このツールも **Gemini** が実装しました。

- Node.jsスクリプト
- Remotionの実装
- 環境構築
- デバッグ

---

<!-- _class: lead -->

# おわり

<!-- voice: これで紹介を終わるのだ。最後まで見てくれてありがとうなのだ！またどこかで会おうなのだ！ -->