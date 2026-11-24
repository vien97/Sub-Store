/**
 * Vercel Speed Insights integration
 * Injects Speed Insights script into HTML responses
 */

const SPEED_INSIGHTS_SCRIPT = `
<script>
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
</script>
<script defer src="/_vercel/speed-insights/script.js"></script>
`.trim();

/**
 * Creates a middleware that intercepts HTML responses and injects Speed Insights
 * @param {Function} handler - The original middleware/handler
 * @returns {Function} Wrapped middleware with Speed Insights injection
 */
export function createSpeedInsightsMiddleware(handler) {
    return (req, res, next) => {
        const originalSend = res.send;
        const originalEnd = res.end;
        const originalWrite = res.write;

        let chunks = [];
        let isHtml = false;

        // Override write to capture response data
        res.write = function (chunk, encoding) {
            if (chunk) {
                const contentType = res.getHeader('content-type') || '';
                isHtml = contentType.includes('text/html');
                
                if (isHtml) {
                    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding || 'utf8'));
                    return true;
                }
            }
            return originalWrite.apply(res, arguments);
        };

        // Override end to inject script before sending
        res.end = function (chunk, encoding) {
            if (chunk && !chunks.length) {
                const contentType = res.getHeader('content-type') || '';
                isHtml = contentType.includes('text/html');
                
                if (isHtml) {
                    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding || 'utf8'));
                }
            }

            if (isHtml && chunks.length > 0) {
                let html = Buffer.concat(chunks).toString('utf8');
                
                // Inject Speed Insights script before closing </head> or </body> tag
                if (html.includes('</head>')) {
                    html = html.replace('</head>', `${SPEED_INSIGHTS_SCRIPT}\n</head>`);
                } else if (html.includes('</body>')) {
                    html = html.replace('</body>', `${SPEED_INSIGHTS_SCRIPT}\n</body>`);
                } else {
                    // If no head or body tag, append at the end
                    html += `\n${SPEED_INSIGHTS_SCRIPT}`;
                }

                // Update content-length if it was set
                const buffer = Buffer.from(html, 'utf8');
                if (res.getHeader('content-length')) {
                    res.setHeader('content-length', buffer.length);
                }

                return originalEnd.call(res, buffer, 'utf8');
            }

            // Not HTML or no chunks captured, pass through
            if (chunk) {
                return originalEnd.apply(res, arguments);
            }
            return originalEnd.call(res);
        };

        // Override send to handle res.send() calls
        res.send = function (body) {
            const contentType = res.getHeader('content-type') || '';
            isHtml = contentType.includes('text/html') || 
                     (typeof body === 'string' && body.trim().startsWith('<'));

            if (isHtml && typeof body === 'string') {
                let html = body;
                
                // Inject Speed Insights script
                if (html.includes('</head>')) {
                    html = html.replace('</head>', `${SPEED_INSIGHTS_SCRIPT}\n</head>`);
                } else if (html.includes('</body>')) {
                    html = html.replace('</body>', `${SPEED_INSIGHTS_SCRIPT}\n</body>`);
                } else {
                    html += `\n${SPEED_INSIGHTS_SCRIPT}`;
                }

                // Set content-type if not already set
                if (!res.getHeader('content-type')) {
                    res.setHeader('content-type', 'text/html; charset=utf-8');
                }

                return originalSend.call(res, html);
            }

            return originalSend.apply(res, arguments);
        };

        handler(req, res, next);
    };
}

/**
 * Check if Speed Insights should be enabled
 * It's enabled by default on Vercel, can be disabled via environment variable
 */
export function isSpeedInsightsEnabled() {
    if (typeof process === 'undefined') return false;
    
    // Check if running on Vercel
    const isVercel = eval('process.env.VERCEL') === '1';
    
    // Check if explicitly disabled
    const isDisabled = eval('process.env.DISABLE_SPEED_INSIGHTS') === 'true';
    
    return isVercel && !isDisabled;
}
