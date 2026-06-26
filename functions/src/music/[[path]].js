/**
 * Proxy /src/music/* to R2 bucket
 * - Music/cover/lyric files hosted in R2 for faster streaming
 * - Falls back to Pages static assets if not found in R2
 */
export async function onRequest(context) {
  const { request, env, params } = context;
  const path = params.path || '';
  const decodedPath = decodeURIComponent(path);

  if (!decodedPath) {
    return new Response('Not Found', { status: 404 });
  }

  // wrangler r2 object put 对中文文件名会 URL 编码，查 R2 时 key 需匹配
  const r2Key = path; // params.path 是 Cloudflare 解码前的原始编码路径

  // Try R2 first
  if (env.MUSIC_BUCKET) {
    try {
      const object = await env.MUSIC_BUCKET.get(r2Key);
      if (object) {
        const headers = new Headers();
        headers.set('Accept-Ranges', 'bytes');
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');

        const ext = decodedPath.split('.').pop()?.toLowerCase();
        const mimeMap = {
          mp3: 'audio/mpeg', flac: 'audio/flac', m4a: 'audio/mp4',
          ogg: 'audio/ogg', wav: 'audio/wav', aac: 'audio/aac',
          jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
          webp: 'image/webp', gif: 'image/gif',
          lrc: 'text/plain; charset=utf-8', txt: 'text/plain; charset=utf-8',
          svg: 'image/svg+xml',
        };
        if (mimeMap[ext]) headers.set('Content-Type', mimeMap[ext]);

        const range = request.headers.get('Range');
        if (range) {
          const [startStr, endStr] = range.replace('bytes=', '').split('-');
          const start = parseInt(startStr, 10);
          const end = endStr ? parseInt(endStr, 10) : object.size - 1;
          const chunk = await object.slice(start, end + 1);
          const chunkData = await chunk.arrayBuffer();
          headers.set('Content-Range', `bytes ${start}-${end}/${object.size}`);
          headers.set('Content-Length', String(chunkData.byteLength));
          return new Response(chunkData, { status: 206, headers });
        }

        const data = await object.arrayBuffer();
        headers.set('Content-Length', String(object.size));
        return new Response(data, { status: 200, headers });
      }
    } catch (e) {
      console.error('[R2] error fetching', decodedPath, e);
    }
  }

  // Fallback: Pages static asset
  return context.next();
}
