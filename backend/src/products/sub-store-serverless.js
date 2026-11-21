/**
 * 路由拆分 - Serverless 入口 (e.g. Vercel) - RESTFul API 无监听端口版本
 */

import { version } from '../../package.json';
console.log(
    `
╔══════════════════════════════════════════════════════════════════════════╗
     Sub-Store -- v${version} (serverless)
╚══════════════════════════════════════════════════════════════════════════╝
`,
);

import migrate from '@/utils/migration';
import express from '@/vendor/express';
import $ from '@/core/app';
import download from '@/utils/download';
import { Base64 } from 'js-base64';
import registerCollectionRoutes from '@/restful/collections';
import registerSubscriptionRoutes from '@/restful/subscriptions';
import registerDownloadRoutes from '@/restful/download';
import registerPreviewRoutes from '@/restful/preview';
import registerSortingRoutes from '@/restful/sort';
import registerSettingRoutes from '@/restful/settings';
import registerArtifactRoutes from '@/restful/artifacts';
import registerFileRoutes from '@/restful/file';
import registerTokenRoutes from '@/restful/token';
import registerArchiveRoutes from '@/restful/archives';
import registerModuleRoutes from '@/restful/module';
import registerSyncRoutes from '@/restful/sync';
import registerNodeInfoRoutes from '@/restful/node-info';
import registerParserRoutes from '@/restful/parser';
import registerLogRoutes from '@/restful/logs';
import registerMiscRoutes from '@/restful/miscs';
import registerAgeRoutes from '@/restful/age';

migrate();
restoreFromDataUrl();

export default buildApp();

function buildApp() {
    const $app = express({ substore: $ });

    registerCollectionRoutes($app);
    registerSubscriptionRoutes($app);
    registerDownloadRoutes($app);
    registerPreviewRoutes($app);
    registerSortingRoutes($app);
    registerSettingRoutes($app);
    registerArtifactRoutes($app);
    registerFileRoutes($app);
    registerTokenRoutes($app);
    registerArchiveRoutes($app);
    registerModuleRoutes($app);
    registerSyncRoutes($app);
    registerNodeInfoRoutes($app);
    registerParserRoutes($app);
    registerLogRoutes($app);
    registerMiscRoutes($app);
    registerAgeRoutes($app);
    return $app;
}

async function restoreFromDataUrl() {
    const data_url = eval('process.env.SUB_STORE_DATA_URL');
    if (!data_url) return;
    try {
        $.info(`[BACKEND] downloading data from ${data_url}`);
        let content = await download(data_url);
        try {
            content = JSON.parse(Base64.decode(content));
            if (!(Object.keys(content.settings).length >= 0)) {
                throw new Error('备份文件应至少包含 settings 字段');
            }
        } catch (err) {
            try {
                content = JSON.parse(content);
                if (!(Object.keys(content.settings).length >= 0)) {
                    throw new Error('备份文件应至少包含 settings 字段');
                }
            } catch (err2) {
                throw new Error('Gist 备份文件校验失败, 无法还原');
            }
        }
        $.write(JSON.stringify(content, null, `  `), '#sub-store');
        $.cache = content;
        $.persistCache();
        migrate();
        $.info(`[BACKEND] restored data from ${data_url}`);
    } catch (e) {
        $.error(`[BACKEND] restore data failed: ${e.message ?? e}`);
        console.error(e);
    }
}
