const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
  // marpのページ区切り(---)で分割。先頭のfrontmatter(--- ... ---)を除くため工夫が必要
  // 簡易的に、"---" でsplitして、marp: trueが含まれるブロック(frontmatter)はスキップする方針にする
  
  const rawSlides = content.split(/\n---\n/);
  const slides = rawSlides.filter(s => !s.includes('marp: true')); // Frontmatter除外（簡易実装）
  
  // もしFrontmatterの直後に --- がなくて最初のスライドがFrontmatterと一緒に取れてしまう場合の対策
  // 実際は marp-cli がどう解釈するかによるが、ここでは簡易的に「voiceコメント」を探す
  
  // 正規表現で <!-- voice: ... --> を探す
  // ページごとの分割が難しい（---の扱いがMarkdown的に複雑）ため、
  // Marpが出力する画像の枚数と、見つかったvoiceコメントの数が一致することを前提とするか、
  // あるいは単純に「出現順」で割り当てる。
  
  // より確実なのは、やはり --- で分割して各ブロックから探すこと。
  // Frontmatterはファイルの先頭にある --- ブロック ---
  // split('---') だと空文字やFrontmatterも配列に含まれる。
  
  const parts = content.split(/^---$/m); 
  // parts[0] は空(先頭が---の場合)
  // parts[1] はFrontmatter
  // parts[2] 以降がスライド
  
  let slideBlocks = [];
  if (parts.length > 2) {
      slideBlocks = parts.slice(2);
  } else {
      // 区切りがない、あるいはFrontmatterのみ？
      // 今回のケースでは必ずFrontmatterがあるので、slice(2)で本文以降を取得
      slideBlocks = parts.slice(2);
  }

  // もしスライド内に --- がない場合（1枚のみ）の考慮が必要だが、
  // 今回のslides.mdは --- で区切られている。
  
  const voices = slideBlocks.map(block => {
    const match = block.match(/<!--\s*voice:\s*(.*?)\s*-->/s);
    return match ? match[1].trim() : null;
  });
  
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
  
  const assets = [];
  
  for (let i = 0; i < slideFiles.length; i++) {
    const slideFile = slideFiles[i];
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
    
    assets.push({
      slide: `slides/${slideFile}`,
      voice: voiceFile,
      duration: duration,
      text: text
    });
  }
  
  // 3. メタデータ出力
  fs.writeFileSync(ASSETS_JSON, JSON.stringify(assets, null, 2));
  console.log(`Assets info saved to ${ASSETS_JSON}`);
  console.log('--- Done ---');
}

main();
