/**
 * generate-music.js
 * 扫描 src/music 目录，提取 MP3 内置封面和歌词，生成 src/scripts/music.json
 * 用法: node src/scripts/generate-music.js
 */

const fs = require('fs');
const path = require('path');
const NodeID3 = require('node-id3');

const musicDir = path.join(__dirname, '..', 'music');
const outputFile = path.join(__dirname, 'music.json');
const lyricsDir = path.join(__dirname, '..', 'lyrics');

const AUDIO_EXTS = ['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac'];
const COVER_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const LYRIC_EXTS = ['.lrc', '.txt'];

// 确保歌词目录存在
if (!fs.existsSync(lyricsDir)) {
  fs.mkdirSync(lyricsDir, { recursive: true });
}

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
  let extractedLyrics = null;
  
  try {
    const tags = NodeID3.read(filePath);
    
    // 提取封面
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
    
    // 提取内嵌歌词 (USLT - Unsynchronised Lyrics)
    if (tags && tags.unsynchronisedLyrics) {
      const lyricsText = tags.unsynchronisedLyrics.text || tags.unsynchronisedLyrics;
      if (lyricsText && lyricsText.trim()) {
        const lrcFile = baseName + '.lrc';
        const lrcPath = path.join(lyricsDir, lrcFile);
        if (!fs.existsSync(lrcPath)) {
          fs.writeFileSync(lrcPath, lyricsText, 'utf-8');
          console.log(`  📝 提取歌词: ${lrcFile}`);
        }
        extractedLyrics = lrcFile;
      }
    }
  } catch (e) {
    // 无 ID3 标签或没有封面/歌词，正常跳过
  }

  // 外部封面匹配
  let coverFile = extractedCover;
  if (!coverFile) {
    for (const ext of COVER_EXTS) {
      if (files.includes(baseName + ext)) {
        coverFile = baseName + ext;
        break;
      }
    }
  }

  // 外部歌词匹配
  let lrcFile = extractedLyrics;
  if (!lrcFile) {
    // 检查 lyrics 目录
    for (const ext of LYRIC_EXTS) {
      const lrcPath = path.join(lyricsDir, baseName + ext);
      if (fs.existsSync(lrcPath)) {
        lrcFile = baseName + ext;
        break;
      }
    }
    // 检查 music 目录
    if (!lrcFile) {
      for (const ext of LYRIC_EXTS) {
        if (files.includes(baseName + ext)) {
          lrcFile = baseName + ext;
          break;
        }
      }
    }
  }

  // 解析标题和艺术家
  let title = baseName;
  let artist = 'Unknown';
  const dashIndex = baseName.indexOf(' - ');
  if (dashIndex > 0) {
    artist = baseName.substring(0, dashIndex).trim();
    title = baseName.substring(dashIndex + 3).trim();
  }

  const song = {
    title,
    artist,
    cover: coverFile ? `./src/music/${encodeURIComponent(coverFile)}` : '',
    src: `./src/music/${encodeURIComponent(mp3File)}`
  };

  // 只有有歌词时才添加 lrc 字段
  if (lrcFile) {
    song.lrc = `./src/lyrics/${encodeURIComponent(lrcFile)}`;
  }

  return song;
});

fs.writeFileSync(outputFile, JSON.stringify(songs, null, 2), 'utf-8');
console.log(`✅ 已生成 music.json，共 ${songs.length} 首`);
songs.forEach((s, i) => {
  const hasCover = s.cover ? ' 🖼️' : '';
  const hasLrc = s.lrc ? ' 📝' : '';
  console.log(`   ${i + 1}. ${s.artist} - ${s.title}${hasCover}${hasLrc}`);
});