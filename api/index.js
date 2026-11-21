const fs = require('fs');

process.env.SUB_STORE_DATA_BASE_PATH =
    process.env.SUB_STORE_DATA_BASE_PATH || '/tmp/sub-store';
try {
    fs.mkdirSync(process.env.SUB_STORE_DATA_BASE_PATH, { recursive: true });
} catch (e) {
    console.error(
        `[Vercel] cannot create data path ${
            process.env.SUB_STORE_DATA_BASE_PATH
        }: ${e?.message ?? e}`,
    );
}

const { default: app } = require('./sub-store-serverless.min.js');

module.exports = (req, res) => app(req, res);
