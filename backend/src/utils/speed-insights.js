/**
 * Vercel Speed Insights middleware for Sub-Store
 * Injects Speed Insights script into HTML responses
 */

/**
 * Creates middleware to inject Vercel Speed Insights script into HTML responses
 * This enables Core Web Vitals tracking (FCP, LCP, CLS, INP, TTFB)
 * @param {Object} $ - App instance for logging
 * @returns {Function} Express middleware function
 */
export function createSpeedInsightsMiddleware($) {
    const { isNode } = $.env;

    // Only apply in Node environment
    if (!isNode) {
        return (req, res, next) => next();
    }

    // Check if Speed Insights is enabled via environment variable
    const enabled =
        eval('process.env.SUB_STORE_SPEED_INSIGHTS_ENABLED') !== 'false';

    if (!enabled) {
        $.info('[SPEED INSIGHTS] disabled via environment variable');
        return (req, res, next) => next();
    }

    $.info('[SPEED INSIGHTS] enabled');

    // Speed Insights script injection
    const speedInsightsScript = `
<script>
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
</script>
<script defer src="/_vercel/speed-insights/script.js"></script>`;

    return function speedInsightsMiddleware(req, res, next) {
        // Only process HTML responses
        const originalSend = res.send;

        res.send = function (data) {
            // Check if this is an HTML response
            const contentType = res.get('Content-Type') || '';
            const isHtml =
                contentType.includes('text/html') ||
                (typeof data === 'string' && data.trim().startsWith('<!DOCTYPE html>'));

            if (isHtml && typeof data === 'string') {
                // Inject Speed Insights script before closing </head> tag
                if (data.includes('</head>')) {
                    data = data.replace('</head>', `${speedInsightsScript}\n</head>`);
                }
                // Fallback: inject before </body> if no </head> found
                else if (data.includes('</body>')) {
                    data = data.replace('</body>', `${speedInsightsScript}\n</body>`);
                }
            }

            return originalSend.call(this, data);
        };

        next();
    };
}
