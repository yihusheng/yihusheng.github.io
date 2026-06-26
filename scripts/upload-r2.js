/**
 * Upload music files, covers, lyrics to Cloudflare R2
 * Usage: CLOUDFLARE_API_TOKEN=xxx node scripts/upload-r2.js
 */
const fs = require('fs');
const path = require('path');

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '5d7d0fcdc929a2bd1491c8924d0a587a';
const API_TOKEN = process.env.CLOUDFLARE_PAGES_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
const BUCKET = 'maxcloud';
const MUSIC_DIR = path.join(__dirname, '..', 'src', 'music');
const BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/r2/buckets/${BUCKET}/objects`;

const EXT_MIME = {
  mp3: 'audio/mpeg', flac: 'audio/flac', m4a: 'audio/mp4',
  ogg: 'audio/ogg', wav: 'audio/wav', aac: 'audio/aac',
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  webp: 'image/webp', gif: 'image/gif', lrc: 'text/plain; charset=utf-8',
  txt: 'text/plain; charset=utf-8', svg: 'image/svg+xml',
  json: 'application/json',
};

async function uploadFile(filePath) {
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName).toLowerCase().replace('.', '');
  const mime = EXT_MIME[ext] || 'application/octet-stream';
  const key = `src/music/${encodeURIComponent(fileName)}`;

  const stat = fs.statSync(filePath);
  if (stat.size > 50 * 1024 * 1024) {
    console.log(`  ⏭️  跳过超大文件: ${fileName} (${(stat.size/1024/1024).toFixed(1)}MB)`);
    return false;
  }

  const fileBuffer = fs.readFileSync(filePath);
  const url = `${BASE_URL}/${encodeURIComponent(key)}`;

  try {
    const resp = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': mime,
      },
      body: fileBuffer,
    });
    const data = await resp.json();
    if (data.success) {
      console.log(`  ✅ ${fileName} (${(stat.size/1024/1024).toFixed(1)}MB)`);
      return true;
    } else {
      console.log(`  ❌ ${fileName}: ${JSON.stringify(data.errors)}`);
      return false;
    }
  } catch (e) {
    console.log(`  ❌ ${fileName}: ${e.message}`);
    return false;
  }
}

(async () => {
  if (!API_TOKEN) {
    console.error('❌ 请设置 CLOUDFLARE_API_TOKEN');
    process.exit(1);
  }

  const files = fs.readdirSync(MUSIC_DIR)
    .map(f => path.join(MUSIC_DIR, f))
    .filter(f => fs.statSync(f).isFile());

  console.log(`📤 上传 ${files.length} 个文件到 R2 (${BUCKET})...\n`);

  let ok = 0, fail = 0;
  for (const f of files) {
    const r = await uploadFile(f);
    if (r) ok++; else fail++;
  }

  console.log(`\n✅ 完成: ${ok} 成功, ${fail} 失败`);
  process.exit(fail > 0 ? 1 : 0);
})();
