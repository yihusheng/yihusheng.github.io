/**
 * generate-music.js
 * 自动扫描 src 目录下的音乐文件，生成 src/music.json
 * 用法: node src/scripts/generate-music.js
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..');
const outputFile = path.join(__dirname, '..', 'music.json');

// 支持的音频格式
const AUDIO_EXTS = ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac'];
// 支持的封面格式
const COVER_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];

// 读取 src 目录所有文件
let files;
try {
  files = fs.readdirSync(srcDir);
} catch (e) {
  console.error('❌ 无法读取 src 目录:', e.message);
  process.exit(1);
}

// 筛选出音频文件
const audioFiles = files.filter(f =>
  AUDIO_EXTS.includes(path.extname(f).toLowerCase())
);

if (audioFiles.length === 0) {
  console.log('⚠️  src 目录中没有找到音频文件，生成空列表');
  fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
  process.exit(0);
}

// 为每个音频文件匹配封面
const songs = audioFiles.map((mp3File) => {
  const baseName = path.basename(mp3File, path.extname(mp3File));
  
  // 尝试找相同文件名的封面（优先 .jpg）
  let coverFile = null;
  for (const ext of COVER_EXTS) {
    const candidate = baseName + ext;
    if (files.includes(candidate)) {
      coverFile = candidate;
      break;
    }
  }

  // 如果没找到，尝试匹配 src 目录下的任意非音乐图片
  if (!coverFile) {
    coverFile = files.find(f =>
      COVER_EXTS.includes(path.extname(f).toLowerCase()) &&
      baseName.includes(path.basename(f, path.extname(f)))
    ) || null;
  }

  // 从文件名解析标题和艺术家
  // 格式: "Artist - Title.mp3" 或 "Title.mp3"
  let title = baseName;
  let artist = 'Unknown';

  // 尝试用 " - " 分割
  const dashIndex = baseName.indexOf(' - ');
  if (dashIndex > 0) {
    artist = baseName.substring(0, dashIndex).trim();
    title = baseName.substring(dashIndex + 3).trim();
  }

  return {
    title: title,
    artist: artist,
    cover: coverFile ? `./src/${encodeURIComponent(coverFile)}` : '',
    src: `./src/${encodeURIComponent(mp3File)}`
  };
});

// 写入 music.json
fs.writeFileSync(outputFile, JSON.stringify(songs, null, 2), 'utf-8');
console.log(`✅ 已生成 music.json，共 ${songs.length} 首歌曲`);
songs.forEach((s, i) => {
  console.log(`   ${i + 1}. ${s.artist} - ${s.title}${s.cover ? ' 🖼️' : ''}`);
});