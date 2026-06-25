/**
 * generate-music.js
 * 扫描 src/music 目录，提取 MP3 / FLAC / M4A / OGG 等格式的内置封面和歌词，
 * 生成 src/scripts/music.json
 *
 * 用法: node src/scripts/generate-music.js
 */

const fs = require('fs');
const path = require('path');
const mm = require('music-metadata');

const musicDir = path.join(__dirname, '..', 'music');
const outputFile = path.join(__dirname, 'music.json');

const AUDIO_EXTS = new Set(['.mp3', '.wav', '.flac', '.ogg', '.m4a', '.aac', '.mp4', '.wma']);
const COVER_EXTS = ['.jpg', '.jpeg', '.png', '.webp'];
const LYRIC_EXTS = ['.lrc', '.txt'];

// URL 编码（保持与浏览器 music.json 一致）
function urlSafe(s) { return encodeURIComponent(s).replace(/%20/g, '+'); }

function getCoverExt(mime) {
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
  };
  return map[mime] || '.jpg';
}

(async () => {
  let files;
  try {
    files = fs.readdirSync(musicDir);
  } catch (e) {
    console.error('❌ 无法读取 src/music 目录:', e.message);
    process.exit(1);
  }

  const audioFiles = files.filter(f => AUDIO_EXTS.has(path.extname(f).toLowerCase()));
  if (audioFiles.length === 0) {
    console.log('⚠️  没有找到音频文件');
    fs.writeFileSync(outputFile, JSON.stringify([], null, 2));
    process.exit(0);
  }

  const songs = [];

  for (const audioFile of audioFiles) {
    const ext = path.extname(audioFile).toLowerCase();
    const baseName = path.basename(audioFile, ext);
    const filePath = path.join(musicDir, audioFile);

    let title = baseName;
    let artist = '';
    let extractedCover = null;
    let extractedLyrics = null;

    try {
      const metadata = await mm.parseFile(filePath, {
        duration: false,
        skipPostHeaders: true,
      });
      const common = metadata.common;

      // 标题 / 艺术家 / 专辑
      if (common.title) title = common.title;
      if (common.artist) artist = common.artist;

      // 提取内嵌封面
      if (common.picture && common.picture.length > 0) {
        const pic = common.picture[0];
        const imgExt = getCoverExt(pic.format);
        const coverFile = baseName + imgExt;
        const coverPath = path.join(musicDir, coverFile);

        if (!fs.existsSync(coverPath)) {
          fs.writeFileSync(coverPath, Buffer.from(pic.data));
          console.log(`  📸 提取封面: ${coverFile}  (${audioFile})`);
        }
        extractedCover = coverFile;
      }

      // 提取内嵌歌词
      if (common.lyrics && common.lyrics.length > 0) {
        const lyricsText = common.lyrics
          .map(l => {
            if (typeof l === 'string') return l;
            // 同步歌词：time（秒）+ text 分开存，组装成 LRC 格式
            if (l.time != null) {
              const t = l.time;
              const mins = Math.floor(t / 60);
              const secs = Math.floor(t % 60);
              const cs = Math.floor((t % 1) * 100);
              return `[${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}]${l.text || ''}`;
            }
            return l.text || '';
          })
          .filter(Boolean)
          .join('\n');
        if (lyricsText.trim()) {
          const lrcFile = baseName + '.lrc';
          const lrcPath = path.join(musicDir, lrcFile);
          if (!fs.existsSync(lrcPath)) {
            fs.writeFileSync(lrcPath, lyricsText, 'utf-8');
            console.log(`  📝 提取歌词: ${lrcFile}  (${audioFile})`);
          }
          extractedLyrics = lrcFile;
        }
      }
    } catch (e) {
      console.warn(`  ⚠️  解析失败: ${audioFile} — ${e.message}`);
    }

    // 文件名解析（仅当 tag 没有提供 artist 时）
    if (!artist) {
      const dashIdx = baseName.indexOf(' - ');
      if (dashIdx > 0) {
        artist = baseName.substring(0, dashIdx).trim();
        title = baseName.substring(dashIdx + 3).trim();
      } else {
        artist = 'Unknown';
      }
    }

    // 外部封面（优先级低于嵌入式，但检查是否已有文件）
    let coverFile = extractedCover;
    if (!coverFile) {
      for (const ext of COVER_EXTS) {
        if (files.includes(baseName + ext)) {
          coverFile = baseName + ext;
          break;
        }
      }
    }

    // 外部歌词
    let lrcFile = extractedLyrics;
    if (!lrcFile) {
      for (const ext of LYRIC_EXTS) {
        const lrcPath = path.join(musicDir, baseName + ext);
        if (fs.existsSync(lrcPath)) {
          lrcFile = baseName + ext;
          break;
        }
      }
    }

    const song = {
      title,
      artist,
      src: `./src/music/${encodeURIComponent(audioFile)}`,
    };

    if (coverFile) {
      song.cover = `./src/music/${encodeURIComponent(coverFile)}`;
    }
    if (lrcFile) {
      song.lrc = `./src/music/${encodeURIComponent(lrcFile)}`;
    }

    songs.push(song);
  }

  // 按文件名排序
  songs.sort((a, b) => a.src.localeCompare(b.src));

  fs.writeFileSync(outputFile, JSON.stringify(songs, null, 2), 'utf-8');
  console.log(`\n✅ 已生成 music.json，共 ${songs.length} 首`);
  songs.forEach((s, i) => {
    const hasCover = s.cover ? ' 🖼️' : '';
    const hasLrc = s.lrc ? ' 📝' : '';
    console.log(`   ${String(i + 1).padStart(2)}. ${s.artist} - ${s.title}${hasCover}${hasLrc}`);
  });
})();
