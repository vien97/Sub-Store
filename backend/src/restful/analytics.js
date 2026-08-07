/**
 * Vercel Web Analytics Middleware
 * Injects the Vercel Analytics script into HTML responses when serving frontend
 */

/**
 * Creates middleware to inject Vercel Analytics script into HTML responses
 * This middleware intercepts HTML responses and adds the analytics script before </head>
 */
export function createAnalyticsMiddleware() {
    // The analytics script to inject
    const analyticsScript = `
<script>
(function() {
    if (typeof window === 'undefined') return;
    
    // Vercel Analytics tracking
    window.va = window.va || function() {
        (window.vaq = window.vaq || []).push(arguments);
    };
    
    var script = document.createElement('script');
    script.defer = true;
    script.src = '/_vercel/insights/script.js';
    document.head.appendChild(script);
})();
</script>`;

    return function analyticsMiddleware(req, res, next) {
        // Only intercept HTML responses
        const originalSend = res.send;
        
        res.send = function(data) {
            // Check if this is an HTML response
            const contentType = res.get('Content-Type') || '';
            const isHTML = contentType.includes('text/html');
            
            if (isHTML && typeof data === 'string' && data.includes('</head>')) {
                // Inject analytics script before closing </head> tag
                data = data.replace('</head>', `${analyticsScript}\n</head>`);
            }
            
            // Call original send with modified or original data
            originalSend.call(this, data);
        };
        
        next();
    };
}

/**
 * Express middleware to handle Vercel Analytics endpoint
 * This serves the analytics beacon endpoint
 */
export function analyticsBeaconMiddleware(req, res) {
    // Set CORS headers for analytics
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    // Accept the analytics data but don't process it in development
    // In production on Vercel, this will be handled by Vercel's infrastructure
    res.status(200).json({ success: true });
}
