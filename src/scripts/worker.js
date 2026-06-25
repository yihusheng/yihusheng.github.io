/**
 * MaxCloud Web Worker — 并行处理
 * 处理：封面颜色提取、LRC 歌词解析
 */
self.addEventListener('message', async function (e) {
  var msg = e.data;
  var type = msg.type;
  var id = msg.id;

  if (type === 'extractColor') {
    try {
      var rgb = await extractColorFromUrl(msg.url);
      self.postMessage({ type: 'extractColor', id: id, rgb: rgb, t: performance.now() });
    } catch (err) {
      self.postMessage({ type: 'extractColor', id: id, rgb: { r: 100, g: 145, b: 65 }, error: true, t: performance.now() });
    }
  } else if (type === 'parseLRC') {
    try {
      var result = parseLRC(msg.text);
      self.postMessage({ type: 'parseLRC', id: id, data: result, t: performance.now() });
    } catch (err) {
      self.postMessage({ type: 'parseLRC', id: id, data: [], error: true, t: performance.now() });
    }
  }
});

// ── 颜色提取 (OffscreenCanvas) ──
async function extractColorFromUrl(url) {
  var resp = await fetch(url, { mode: 'cors' });
  var blob = await resp.blob();
  var bitmap = await createImageBitmap(blob);
  var canvas = new OffscreenCanvas(50, 50);
  var ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, 50, 50);
  bitmap.close();

  var d = ctx.getImageData(0, 0, 50, 50).data;
  var r = 0, g = 0, b = 0, t = 0;
  for (var j = 0; j < d.length; j += 4) {
    var br = 0.299 * d[j] + 0.587 * d[j + 1] + 0.114 * d[j + 2];
    var w = br < 50 ? 2 : 1;
    r += d[j] * w;
    g += d[j + 1] * w;
    b += d[j + 2] * w;
    t += w;
  }
  if (t > 0) { r = Math.floor(r / t); g = Math.floor(g / t); b = Math.floor(b / t); }
  return { r: r, g: g, b: b };
}

// ── LRC 歌词解析 ──
function parseLRC(lrcText) {
  var lines = lrcText.split('\n');
  var result = [];
  var timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    var match;
    timeRegex.lastIndex = 0;
    var times = [];
    while ((match = timeRegex.exec(line)) !== null) {
      var mins = parseInt(match[1], 10);
      var secs = parseInt(match[2], 10);
      var ms = match[3] ? parseInt(match[3].padEnd(3, '0'), 10) : 0;
      times.push(mins * 60 + secs + ms / 1000);
    }
    var text = line.replace(/\[.*?\]/g, '').trim();
    if (text) {
      for (var j = 0; j < times.length; j++) {
        result.push({ time: times[j], text: text });
      }
    }
  }
  result.sort(function (a, b) { return a.time - b.time; });
  return result;
}
