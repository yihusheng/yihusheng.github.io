/**
 * generate-music.js
 * 扫描 src/music 目录，提取 MP3 内置封面，生成 src/scripts/music.json
 * 用法: node src/scripts/generate-music.js
 */

const fs = require('fs');
const path = require('path');
const NodeID3 = require('node-id3');

const musicDir = path.join(__dirname, '..', 'music');
const outputFile = path.join(__dirname, 'music.json');

const AUDIO_EXTS = ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac'];
const COVER_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

let files;
try {
  files = fs.readdirSync(musicDir);
} catch (e) {
  console.error('❌ 无法读取 src/music 目录:', e.message);
  process.exit(1);
}

const audioFiles = files.filter(f =>
  AUDIO_EXTS.includes(path.extname(f).toLowerCase())
);

if (audioFiles.length === 0) {
  console.log('⚠️  没有找到音频文件');
  fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
  process.exit(0);
}

const songs = audioFiles.map((mp3File) => {
  const baseName = path.basename(mp3File, path.extname(mp3File));
  const filePath = path.join(musicDir, mp3File);

  // 从 MP3 提取内置封面
  let extractedCover = null;
  try {
    const tags = NodeID3.read(filePath);
    if (tags && tags.image && tags.image.imageBuffer) {
      const mime = tags.image.mime || 'image/jpeg';
      const imgExt = mime === 'image/png' ? '.png' : '.jpg';
      const coverFile = baseName + imgExt;
      const coverPath = path.join(musicDir, coverFile);
      if (!fs.existsSync(coverPath)) {
        fs.writeFileSync(coverPath, Buffer.from(tags.image.imageBuffer));
        console.log(`  📸 提取封面: ${coverFile}`);
      }
      extractedCover = coverFile;
    }
  } catch (e) {
    // 无 ID3 标签或没有封面，正常跳过
  }

  // 外部封面匹配（内置封面优先级更高）
  let coverFile = extractedCover;
  if (!coverFile) {
    for (const ext of COVER_EXTS) {
      if (files.includes(baseName + ext)) {
        coverFile = baseName + ext;
        break;
      }
    }
  }
  if (!coverFile) {
    coverFile = files.find(f =>
      COVER_EXTS.includes(path.extname(f).toLowerCase()) &&
      baseName.includes(path.basename(f, path.extname(f)))
    ) || null;
  }

  // 解析标题和艺术家
  let title = baseName;
  let artist = 'Unknown';
  const dashIndex = baseName.indexOf(' - ');
  if (dashIndex > 0) {
    artist = baseName.substring(0, dashIndex).trim();
    title = baseName.substring(dashIndex + 3).trim();
  }

  return {
    title,
    artist,
    cover: coverFile ? `./src/music/${encodeURIComponent(coverFile)}` : '',
    src: `./src/music/${encodeURIComponent(mp3File)}`
  };
});

fs.writeFileSync(outputFile, JSON.stringify(songs, null, 2), 'utf-8');
console.log(`✅ 已生成 music.json，共 ${songs.length} 首`);
songs.forEach((s, i) => {
  console.log(`   ${i + 1}. ${s.artist} - ${s.title}${s.cover ? ' 🖼️' : ''}`);
});
