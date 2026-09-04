/**
 *  ███████╗██╗   ██╗██████╗       ███████╗████████╗ ██████╗ ██████╗ ███████╗
 *  ██╔════╝██║   ██║██╔══██╗      ██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗██╔════╝
 *  ███████╗██║   ██║██████╔╝█████╗███████╗   ██║   ██║   ██║██████╔╝█████╗
 *  ╚════██║██║   ██║██╔══██╗╚════╝╚════██║   ██║   ██║   ██║██╔══██╗██╔══╝
 *  ███████║╚██████╔╝██████╔╝      ███████║   ██║   ╚██████╔╝██║  ██║███████╗
 *  ╚══════╝ ╚═════╝ ╚═════╝       ╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝
 * Advanced Subscription Manager for QX, Loon, Surge and Clash.
 * @author: Peng-YM
 * @github: https://github.com/sub-store-org/Sub-Store
 * @documentation: https://www.notion.so/Sub-Store-6259586994d34c11a4ced5c406264b46
 */
import { version } from '../package.json';
import $ from '@/core/app';
import { injectSpeedInsights } from '@vercel/speed-insights';

console.log(
    `
┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅
     Sub-Store -- v${version}
┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅┅
`,
);
import migrate from '@/utils/migration';
import serve from '@/restful';

// Initialize Vercel Speed Insights
if ($.env.isNode) {
    injectSpeedInsights();
}

migrate();
serve();
