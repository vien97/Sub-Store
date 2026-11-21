#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { build } = require('esbuild');

const { builtinModules } = require('module');
const builtinModuleNames = new Set(
    builtinModules.map((name) => name.replace(/^node:/, '')),
);

function normalizeSpecifier(specifier) {
    return specifier.replace(/^node:/, '');
}

const nodeBuiltinExternalPlugin = {
    name: 'node-builtin-external',
    setup(build) {
        build.onResolve({ filter: /.*/ }, (args) => {
            if (builtinModuleNames.has(normalizeSpecifier(args.path))) {
                return { path: args.path, external: true };
            }
        });
    },
};

!(async () => {
    const version = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'),
    ).version.trim();

    await build({
        entryPoints: ['src/products/sub-store-serverless.js'],
        bundle: true,
        minify: true,
        sourcemap: false,
        platform: 'browser',
        format: 'esm',
        outfile: 'dist/sub-store-serverless.min.js',
        plugins: [nodeBuiltinExternalPlugin],
    });

    let content = fs.readFileSync(
        path.join(__dirname, 'dist/sub-store-serverless.min.js'),
        { encoding: 'utf8' },
    );
    content = content.replace(
        /eval\(('|")(require\(('|").*?('|")\))('|")\)/g,
        '$2',
    );
    content = content.replace(
        /eval\(('|")(import\(('|").*?('|")\))('|")\)/g,
        '$2',
    );
    fs.writeFileSync(
        path.join(__dirname, 'dist/sub-store-serverless.no-bundle.js'),
        content,
        { encoding: 'utf8' },
    );

    await build({
        entryPoints: ['dist/sub-store-serverless.no-bundle.js'],
        bundle: true,
        minify: true,
        sourcemap: false,
        platform: 'node',
        format: 'cjs',
        outfile: path.join(__dirname, '..', 'api/sub-store-serverless.min.js'),
    });
    fs.writeFileSync(
        path.join(__dirname, '..', 'api/sub-store-serverless.min.js'),
        `// SUB_STORE_BACKEND_VERSION: ${version}\n${fs.readFileSync(
            path.join(__dirname, '..', 'api/sub-store-serverless.min.js'),
            { encoding: 'utf8' },
        )}`,
        { encoding: 'utf8' },
    );
})()
    .catch((e) => {
        console.error(e);
        process.exitCode = 1;
    })
    .finally(() => {
        console.log('done');
    });
