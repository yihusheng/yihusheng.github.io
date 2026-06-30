/**
 * Proxy /public/music/* to R2 bucket
 * - 流式响应（不缓冲整个文件），大幅减少首字节时间
 * - Falls back to Pages static assets if not found in R2
 */
export async function onRequest(context) {
  const { request, env, params } = context;
  const path = params.path || '';
  const decodedPath = decodeURIComponent(path);

  if (!decodedPath) {
    return new Response('Not Found', { status: 404 });
  }

  // Try R2 first
  if (env.MUSIC_BUCKET) {
    try {
      var prefix = "public/music/";
      var r2Key = prefix + path;
      let object = await env.MUSIC_BUCKET.get(r2Key);
      if (!object) object = await env.MUSIC_BUCKET.get(prefix + decodedPath);
      if (object) {
        const headers = new Headers();
        headers.set('Access-Control-Allow-Origin', '*');
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
          // 范围请求：只返回请求的字节段（用于音频拖动）
          const [startStr, endStr] = range.replace('bytes=', '').split('-');
          const start = parseInt(startStr, 10);
          const end = endStr ? parseInt(endStr, 10) : object.size - 1;
          const chunk = await object.slice(start, end + 1);
          const chunkData = await chunk.arrayBuffer();
          headers.set('Content-Range', `bytes ${start}-${end}/${object.size}`);
          headers.set('Content-Length', String(chunkData.byteLength));
          return new Response(chunkData, { status: 206, headers });
        }

        // 流式响应：不缓冲，边读边发
        headers.set('Content-Length', String(object.size));
        return new Response(object.body, { status: 200, headers });
      }
    } catch (e) {
      console.error('[R2] error fetching', decodedPath, e);
    }
  }

  // Fallback: Pages static asset
  return context.next();
}
