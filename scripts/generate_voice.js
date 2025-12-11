const fs = require('fs/promises');
const path = require('path');

// 設定
const HOST = 'http://localhost:50021';
const SPEAKER_ID = 3; // 3: ずんだもん (ノーマル)
const OUTPUT_DIR = path.join(__dirname, '..', 'public');

async function generateVoice(text) {
  if (!text) {
    console.error('使用法: node scripts/generate_voice.js "喋らせたい内容" [ファイル名.wav]');
    process.exit(1);
  }

  // 出力ファイル名を決定 (引数があればそれを使用、なければ固定名)
  const filename = process.argv[3] || 'voice.wav';
  const outputFile = path.join(OUTPUT_DIR, filename);

  try {
    // 出力ディレクトリの確認と作成
    await fs.mkdir(OUTPUT_DIR, { recursive: true });

    // 1. 音声合成用のクエリを作成
    console.log(`クエリを作成中: "${text}"...`);
    const queryResponse = await fetch(`${HOST}/audio_query?speaker=${SPEAKER_ID}&text=${encodeURIComponent(text)}`, {
      method: 'POST'
    });

    if (!queryResponse.ok) {
      throw new Error(`Query failed: ${queryResponse.statusText}`);
    }

    const queryJson = await queryResponse.json();

    // 2. 音声を合成
    console.log('音声合成中...');
    const synthesisResponse = await fetch(`${HOST}/synthesis?speaker=${SPEAKER_ID}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queryJson),
    });

    if (!synthesisResponse.ok) {
      throw new Error(`Synthesis failed: ${synthesisResponse.statusText}`);
    }

    // 3. ファイルに保存
    const arrayBuffer = await synthesisResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(outputFile, buffer);

    console.log(`完了しました！音声ファイルは ${outputFile} に保存されました。`);

  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    console.error('Dockerコンテナが起動しているか確認してください (docker-compose up -d)');
  }
}

// コマンドライン引数からテキストを取得
const text = process.argv[2] || 'こんにちは、ずんだもんです。';
generateVoice(text);
