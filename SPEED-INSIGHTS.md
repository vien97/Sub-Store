# Vercel Speed Insights Integration

This document describes the Vercel Speed Insights integration for Sub-Store.

## Overview

[Vercel Speed Insights](https://vercel.com/docs/speed-insights) has been integrated into this project to provide real-time performance monitoring and Core Web Vitals tracking for the frontend pages.

## How It Works

The Speed Insights integration automatically injects the required tracking script into HTML pages served by the backend when certain conditions are met.

### Automatic Activation

Speed Insights is **automatically enabled** when:
1. The application is running on Vercel (detected via `VERCEL=1` environment variable)
2. Frontend HTML pages are being served (requires `SUB_STORE_BACKEND_MERGE=true` and `SUB_STORE_FRONTEND_PATH` to be configured)

### Disabling Speed Insights

To disable Speed Insights, set the following environment variable:

```bash
DISABLE_SPEED_INSIGHTS=true
```

## Technical Implementation

### Files Modified

1. **`backend/package.json`**
   - Added `@vercel/speed-insights` package dependency

2. **`backend/src/utils/speed-insights.js`** (NEW)
   - Core Speed Insights functionality
   - HTML injection middleware
   - Feature detection and enablement logic

3. **`backend/src/utils/frontend-static.js`**
   - Integrated Speed Insights middleware wrapper
   - Automatically wraps frontend static serving with Speed Insights injection

4. **`backend/src/restful/miscs.js`**
   - Added Speed Insights status to `/api/utils/env` endpoint
   - Provides visibility into whether Speed Insights is currently enabled

### How the Injection Works

When Speed Insights is enabled, the middleware:
1. Intercepts HTML responses from the frontend static server
2. Injects the Speed Insights script before the closing `</head>` or `</body>` tag
3. Preserves all original response headers and gzip encoding

The injected script snippet:
```html
<script>
  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
</script>
<script defer src="/_vercel/speed-insights/script.js"></script>
```

## Checking Status

You can check if Speed Insights is enabled by visiting:

```
https://your-deployment.vercel.app/api/utils/env
```

Look for the `speedInsights` section in the JSON response:

```json
{
  "status": "success",
  "data": {
    "speedInsights": {
      "enabled": true,
      "note": "Speed Insights is automatically enabled on Vercel for frontend pages. Set DISABLE_SPEED_INSIGHTS=true to disable."
    },
    ...
  }
}
```

## Deployment Notes

### Current Deployment Model

According to `DEPLOY-VERCEL.md`, the current Vercel deployment:
- Serves **backend API only** (no frontend merged)
- Users access the official frontend at `https://sub-store.vercel.app`
- The frontend communicates with the backend via CORS

**In this configuration, Speed Insights will NOT be active** because no HTML pages are being served by this backend.

### Enabling Speed Insights

To enable Speed Insights for this deployment, you would need to:

1. Build or obtain the frontend static files
2. Set environment variables:
   ```bash
   SUB_STORE_BACKEND_MERGE=true
   SUB_STORE_FRONTEND_PATH=/path/to/frontend/dist
   SUB_STORE_FRONTEND_BACKEND_PATH=/
   ```
3. Deploy to Vercel

Then the backend will serve both frontend pages (with Speed Insights) and API endpoints.

### Alternative: Frontend-Side Integration

If you want to track the official frontend at `https://sub-store.vercel.app`, Speed Insights would need to be integrated directly into that frontend application's codebase, which is outside the scope of this backend repository.

## Vercel Dashboard

Once Speed Insights is active and users are visiting your frontend pages:

1. Go to your Vercel dashboard
2. Select your project
3. Click "Speed Insights" in the sidebar
4. View Core Web Vitals and performance metrics

Data typically becomes available after several days of visitor activity.

## References

- [Vercel Speed Insights Documentation](https://vercel.com/docs/speed-insights)
- [Speed Insights Quickstart](https://vercel.com/docs/speed-insights/quickstart)
