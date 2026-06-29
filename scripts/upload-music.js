/**
 * 音乐文件上传 & music_list.js 生成脚本
 *
 * 功能：
 *   - 扫描 public/music/ 下的 mp3/jpg/lrc 文件
 *   - 从文件名解析标题/艺术家
 *   - 上传到 R2（S3 兼容 API）
 *   - 生成 src/scripts/music_list.js
 *
 * 用法：
 *   # 1. 配置环境变量
 *   export CLOUDFLARE_ACCOUNT_ID="your_account_id"
 *   export CLOUDFLARE_R2_ACCESS_KEY="your_r2_access_key"
 *   export CLOUDFLARE_R2_SECRET_KEY="your_r2_secret_key"
 *   export R2_BUCKET="music"
 *   export R2_PUBLIC_URL="https://your-pages-domain.com"
 *
 *   # 2. 安装依赖（如需精确元数据解析）
 *   npm install music-metadata
 *
 *   # 3. 运行
 *   node scripts/upload-music.js
 *
 * 备选：只用 rclone 上传（推荐，无需此脚本）
 *   rclone config  # 选 S3 → Cloudflare R2
 *   rclone copy public/music/ r2-music:music/ --progress
 *   node scripts/upload-music.js --generate-only
 */

const fs = require('fs');
const path = require('path');

const MUSIC_DIR = path.join(__dirname, '..', 'public', 'music');
const OUTPUT = path.join(__dirname, '..', 'src', 'scripts', 'music_list.js');

// ── 配置 ──
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const ACCESS_KEY = process.env.CLOUDFLARE_R2_ACCESS_KEY;
const SECRET_KEY = process.env.CLOUDFLARE_R2_SECRET_KEY;
const BUCKET = process.env.R2_BUCKET || 'music';
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/+$/, '');

const S3_ENDPOINT = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;
const GENERATE_ONLY = process.argv.includes('--generate-only');

// ── 从文件名解析标题和艺术家 ──
function parseFileName(fileName) {
  const name = fileName.replace(/\.mp3$/i, '');
  // 尝试 "艺术家 - 标题" 格式
  const match = name.match(/^(.+?)\s*[-–—]\s*(.+)$/);
  if (match) {
    return { artist: match[1].trim(), title: match[2].trim() };
  }
  return { artist: '未知艺术家', title: name };
}

// ── S3 v4 签名 ──
function buildS3Auth(method, key, contentLength, contentType, date) {
  const datestamp = date.slice(0, 8);
  const canonicalUri = `/${BUCKET}/${key}`;

  const canonicalHeaders =
    `host:${ACCOUNT_ID}.r2.cloudflarestorage.com\n` +
    `x-amz-content-sha256:UNSIGNED-PAYLOAD\n` +
    `x-amz-date:${date}\n`;

  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const canonicalRequest = `${method}\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\nUNSIGNED-PAYLOAD`;

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = `${datestamp}/auto/s3/aws4_request`;
  const stringToSign =
    `${algorithm}\n${date}\n${credentialScope}\n` +
    require('crypto').createHash('sha256').update(canonicalRequest).digest('hex');

  function hmac(k, str) { return require('crypto').createHmac('sha256', k).update(str).digest(); }
  const kDate = hmac('AWS4' + SECRET_KEY, datestamp);
  const kSigning = hmac(hmac(hmac(kDate, 'auto'), 's3'), 'aws4_request');
  const signature = hmac(kSigning, stringToSign).toString('hex');

  return `${algorithm} Credential=${ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
}

async function uploadToR2(key, filePath) {
  const ext = path.extname(key).toLowerCase();
  const mimeMap = {
    '.mp3': 'audio/mpeg', '.flac': 'audio/flac', '.m4a': 'audio/mp4',
    '.ogg': 'audio/ogg', '.wav': 'audio/wav',
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
    '.webp': 'image/webp',
    '.lrc': 'text/plain; charset=utf-8',
  };
  const contentType = mimeMap[ext] || 'application/octet-stream';
  const data = fs.readFileSync(filePath);
  const date = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');

  const auth = buildS3Auth('PUT', key, data.length, contentType, date);

  const resp = await fetch(`${S3_ENDPOINT}/${BUCKET}/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: {
      'Authorization': auth,
      'x-amz-date': date,
      'x-amz-content-sha256': 'UNSIGNED-PAYLOAD',
      'Content-Type': contentType,
      'Content-Length': String(data.length),
    },
    body: data,
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);
  console.log(`  ✅ ${key}`);
}

function getPublicUrl(fileName) {
  if (PUBLIC_URL) return `${PUBLIC_URL}/public/music/${encodeURIComponent(fileName)}`;
  return `./public/music/${encodeURIComponent(fileName)}`;
}

async function main() {
  // 尝试加载 music-metadata（可选）
  let musicMetadata = null;
  try { musicMetadata = require('music-metadata'); } catch (e) {}

  console.log('📁 扫描:', MUSIC_DIR);
  const files = fs.readdirSync(MUSIC_DIR);
  const mp3Files = files.filter(f => /\.mp3$/i.test(f));
  console.log(`🎵 发现 ${mp3Files.length} 个 MP3\n`);

  let musicList = [];
  let uploadOk = true;

  for (const mp3File of mp3Files) {
    const baseName = mp3File.replace(/\.mp3$/i, '');
    const mp3Path = path.join(MUSIC_DIR, mp3File);
    console.log(`📝 ${mp3File}`);

    // 提取元数据
    let title, artist;
    if (musicMetadata) {
      try {
        const mm = await musicMetadata.parseFile(mp3Path, { duration: false });
        title = mm.common.title || baseName;
        artist = mm.common.artist || '未知艺术家';
        console.log(`  元数据: ${artist} - ${title}`);
      } catch (e) {
        const parsed = parseFileName(mp3File);
        title = parsed.title; artist = parsed.artist;
        console.log(`  ⚠️ 元数据解析失败，用文件名: ${title}`);
      }
    } else {
      const parsed = parseFileName(mp3File);
      title = parsed.title; artist = parsed.artist;
      console.log(`  文件名解析: ${artist} - ${title}`);
    }

    // 上传
    if (!GENERATE_ONLY) {
      if (!ACCOUNT_ID || !ACCESS_KEY || !SECRET_KEY) {
        console.error('  ❌ 请设置 CLOUDFLARE_ACCOUNT_ID, R2_ACCESS_KEY, R2_SECRET_KEY');
        process.exit(1);
      }
      try {
        process.stdout.write('  上传 MP3... ');
        await uploadToR2(mp3File, mp3Path);
      } catch (e) { console.error(`  ❌ ${e.message}`); uploadOk = false; continue; }

      // 封面
      for (const ext of ['.jpg', '.jpeg', '.png', '.webp']) {
        const cf = baseName + ext;
        if (files.includes(cf)) {
          process.stdout.write('  上传封面... ');
          try { await uploadToR2(cf, path.join(MUSIC_DIR, cf)); } catch (e) { console.error(`  ⚠️ ${e.message}`); }
          break;
        }
      }

      // 歌词
      const lrcFile = baseName + '.lrc';
      if (files.includes(lrcFile)) {
        process.stdout.write('  上传歌词... ');
        try { await uploadToR2(lrcFile, path.join(MUSIC_DIR, lrcFile)); } catch (e) { console.error(`  ⚠️ ${e.message}`); }
      }
    }

    const entry = { title, artist, src: getPublicUrl(mp3File) };
    for (const ext of ['.jpg', '.jpeg', '.png', '.webp']) {
      if (files.includes(baseName + ext)) { entry.cover = getPublicUrl(baseName + ext); break; }
    }
    if (files.includes(baseName + '.lrc')) entry.lrc = getPublicUrl(baseName + '.lrc');
    musicList.push(entry);
  }

  const jsContent = 'var musicList = ' + JSON.stringify(musicList, null, 2) + ';\n';
  fs.writeFileSync(OUTPUT, jsContent, 'utf-8');
  console.log(`\n📝 已生成: ${OUTPUT} (${musicList.length} 首)`);

  if (!uploadOk) process.exit(1);
}

main().catch(e => { console.error('❌', e); process.exit(1); });
