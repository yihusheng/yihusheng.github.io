// Wise Theme Injector — Cloudflare Worker
// Automatically injects Music-unlock-injectior-wise-theme.css into Music tool pages
// so it survives upstream updates.

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Only process Music tool HTML pages
    if (!url.pathname.startsWith('/Music')) {
      return fetch(request);
    }

    const response = await fetch(request);
    const contentType = response.headers.get('content-type') || '';

    if (!contentType.includes('text/html')) {
      return response;
    }

    // Inject the Wise theme CSS link before </head>
    return new HTMLRewriter()
      .on('head', {
        element(el) {
          el.append(
            '<link href="/src/style/Music-unlock-injectior-wise-theme.css" rel="stylesheet">',
            { html: true }
          );
        },
      })
      .transform(response);
  },
};
