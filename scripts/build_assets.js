const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const MarkdownIt = require('markdown-it');
const markdownItFrontMatter = require('markdown-it-front-matter');

// 設定
const SLIDES_MD = path.join(__dirname, '../manuscript/slides.md');
const PUBLIC_DIR = path.join(__dirname, '../public');
const SLIDES_DIR = path.join(PUBLIC_DIR, 'slides');
const VOICES_DIR = path.join(PUBLIC_DIR, 'voices');
const ASSETS_JSON = path.join(PUBLIC_DIR, 'assets.json');
const VOICEVOX_HOST = 'http://localhost:50021';
const SPEAKER_ID = 3; // ずんだもん

// ディレクトリの準備
function prepareDirs() {
  if (fs.existsSync(SLIDES_DIR)) fs.rmSync(SLIDES_DIR, { recursive: true, force: true });
  if (fs.existsSync(VOICES_DIR)) fs.rmSync(VOICES_DIR, { recursive: true, force: true });
  fs.mkdirSync(SLIDES_DIR, { recursive: true });
  fs.mkdirSync(VOICES_DIR, { recursive: true });
}

// Markdownから台詞を抽出
function extractVoices(mdPath) {
  const content = fs.readFileSync(mdPath, 'utf-8');
  
  const md = new MarkdownIt({ html: true });
  // Frontmatterを読み飛ばすためにプラグインを使用
  // cb引数は必須だが今回は使わないので空関数
  md.use(markdownItFrontMatter, () => {});
  
  const tokens = md.parse(content, {});
  
  const voices = [];
  let currentSlideVoice = null;
  
  // 最初のスライド用
  // トークンを順に見ていき、'hr' (---) が来たら次のスライドへ
  
  for (const token of tokens) {
    if (token.type === 'hr') {
      // 区切り線が来たら、前のスライドのボイス（あれば）を確定させて、次のスライドへ
      voices.push(currentSlideVoice);
      currentSlideVoice = null;
    } else if (token.type === 'html_block') {
      // HTMLコメントを探す
      const match = token.content.match(/<!--\s*voice:\s*(.*?)\s*-->/s);
      if (match) {
        // 同じスライドに複数voiceコメントがある場合は上書き（または結合）
        // ここでは「1スライド1ボイス」前提で上書き
        currentSlideVoice = match[1].trim();
      }
    }
  }
  // 最後のスライドを追加
  voices.push(currentSlideVoice);
  
  return voices;
}

// 音声生成 (同期処理風に書くためにexecSyncでcurlを使うか、fetchで待つ)
async function generateVoice(text, outputPath) {
  if (!text) return null;
  
  console.log(`Generating voice for: "${text.substring(0, 20)}"...`);
  
  try {
    const queryRes = await fetch(`${VOICEVOX_HOST}/audio_query?speaker=${SPEAKER_ID}&text=${encodeURIComponent(text)}`, {
        method: 'POST'
    });
    const queryJson = await queryRes.json();
    
    const synthRes = await fetch(`${VOICEVOX_HOST}/synthesis?speaker=${SPEAKER_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(queryJson)
    });
    
    const arrayBuffer = await synthRes.arrayBuffer();
    fs.writeFileSync(outputPath, Buffer.from(arrayBuffer));
    return outputPath;
  } catch (e) {
    console.error('Voice generation failed:', e);
    return null;
  }
}

// wavファイルの長さを計算 (VOICEVOX: 24kHz, 16bit, mono 前提)
function getWavDuration(filePath) {
  const size = fs.statSync(filePath).size;
  const headerSize = 44;
  const sampleRate = 24000;
  const bitsPerSample = 16;
  const channels = 1;
  
  const dataSize = size - headerSize;
  const bytesPerSecond = sampleRate * channels * (bitsPerSample / 8);
  return dataSize / bytesPerSecond;
}

async function main() {
  console.log('--- Start building assets ---');
  
  prepareDirs();
  
  // 1. Marpで画像生成
  console.log('Generating slides...');
  // slide.001.png という形式で出力される
  execSync(`npx marp "${SLIDES_MD}" --images png -o "${path.join(SLIDES_DIR, 'slide.png')}"`);
  
  // 生成された画像リストを取得
  const slideFiles = fs.readdirSync(SLIDES_DIR).filter(f => f.endsWith('.png')).sort();
  console.log(`Generated ${slideFiles.length} slides.`);
  
  // 2. 台詞抽出
  const voices = extractVoices(SLIDES_MD);
  
  // スライド枚数と台詞数が合わない場合の警告
  // 注: extractVoicesの実装が簡易的なため、splitの挙動次第でズレる可能性がある。
  // 今回は一旦「見つかった順」で割り当てる。
  
  const promises = slideFiles.map(async (slideFile, i) => {
    const text = voices[i] || null; // 対応する台詞がない場合はnull
    
    let voiceFile = null;
    let duration = 3; // デフォルト3秒
    
    if (text) {
      const voiceFilename = `voice.${String(i + 1).padStart(3, '0')}.wav`;
      const voicePath = path.join(VOICES_DIR, voiceFilename);
      await generateVoice(text, voicePath);
      
      if (fs.existsSync(voicePath)) {
        voiceFile = `voices/${voiceFilename}`;
        duration = getWavDuration(voicePath);
      }
    }
    
    return {
      slide: `slides/${slideFile}`,
      voice: voiceFile,
      duration: duration,
      text: text
    };
  });

  const assets = await Promise.all(promises);
  
  // 3. メタデータ出力
  fs.writeFileSync(ASSETS_JSON, JSON.stringify(assets, null, 2));
  console.log(`Assets info saved to ${ASSETS_JSON}`);
  console.log('--- Done ---');
}

main();
