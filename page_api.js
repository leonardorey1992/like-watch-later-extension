// Runs in YouTube's MAIN world so it can read window.ytcfg, which is invisible
// to content scripts (they run in an isolated world).
(() => {
    const PAGE_API_REQUEST = 'add-to-playlist:request';
    const PAGE_API_RESPONSE = 'add-to-playlist:response';

    // YouTube's own authenticated requests carry a SAPISIDHASH proof, and the
    // server rejects cookie-only writes. Mirrors the page's auth scheme.
    async function authHeader() {
        const match = document.cookie.match(/(?:^|; )SAPISID=([^;]+)/);
        if (!match) return null;

        const timestamp = Math.floor(Date.now() / 1000);
        const input = new TextEncoder().encode(`${timestamp} ${match[1]} ${location.origin}`);
        const digest = await crypto.subtle.digest('SHA-1', input);
        const hash = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
        return `SAPISIDHASH ${timestamp}_${hash}`;
    }

    window.addEventListener('message', async (e) => {
        if (e.source !== window || e.data?.type !== PAGE_API_REQUEST) return;

        const { requestId, endpoint, body } = e.data;
        const cfg = window.ytcfg?.data_ || {};

        try {
            if (!cfg.INNERTUBE_API_KEY || !cfg.INNERTUBE_CONTEXT) {
                throw new Error('YouTube config not ready — reload the page');
            }

            const headers = {
                'Content-Type': 'application/json',
                'X-Origin': location.origin,
                'X-Youtube-Client-Name': String(cfg.INNERTUBE_CONTEXT_CLIENT_NAME || 1),
                'X-Youtube-Client-Version': cfg.INNERTUBE_CLIENT_VERSION || '',
                'X-Goog-AuthUser': String(cfg.SESSION_INDEX ?? 0),
            };
            const visitorData = cfg.INNERTUBE_CONTEXT?.client?.visitorData;
            if (visitorData) headers['X-Goog-Visitor-Id'] = visitorData;

            const auth = await authHeader();
            if (auth) headers.Authorization = auth;

            const res = await fetch(`/youtubei/v1/${endpoint}?key=${cfg.INNERTUBE_API_KEY}&prettyPrint=false`, {
                method: 'POST',
                credentials: 'same-origin',
                headers,
                body: JSON.stringify({ context: cfg.INNERTUBE_CONTEXT, ...body }),
            });

            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error?.message || `YouTube API error (${res.status})`);
            if (data?.error) throw new Error(data.error.message || 'YouTube request failed');

            window.postMessage({ type: PAGE_API_RESPONSE, requestId, ok: true, data }, '*');
        } catch (err) {
            window.postMessage({ type: PAGE_API_RESPONSE, requestId, ok: false, error: err.message }, '*');
        }
    });
})();
