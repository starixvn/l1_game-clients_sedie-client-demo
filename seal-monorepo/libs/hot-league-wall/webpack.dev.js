const { NxWebpackPlugin } = require('@nx/webpack');
const { NxReactWebpackPlugin } = require('@nx/react');
const { join } = require('path');
const path = require('path');

module.exports = {
    output: {
        path: join(__dirname, '../../dist/libs/hot-league-wall'),
        publicPath: '/hot-league-wall/',
        devtoolModuleFilenameTemplate: (info) => {
            const relativePath = info.resourcePath;

            // For node_modules except @sg libraries, ignore source maps
            if (relativePath.includes('node_modules')) {
                if (relativePath.includes('@sg')) {
                    // For @sg libraries, use a loadable URL format with relative paths
                    const sgPath = relativePath.replace(/.*node_modules\/@sg\//, '');
                    return `sources://@sg/${sgPath}`;
                }
                return 'ignored://ignored.js';
            }

            // For hot-league-wall files, use a proper URL format
            if (relativePath.includes('hot-league-wall')) {
                const cleanPath = relativePath.split('hot-league-wall/').pop();
                // Use a proper URL scheme that browsers can load
                return `sources://hot-league-wall/${cleanPath}`;
            }

            // For other files, use a loadable relative URL
            return `sources:///${relativePath.replace(/\\/g, '/')}`;
        },
    },
    devServer: {
        port: 4201,
        historyApiFallback: {
            index: '/hot-league-wall/index.html',
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
        static: {
            directory: join(__dirname, './src'),
            publicPath: '/src',
            watch: true,
        },
    },
    devtool: 'source-map',
    resolve: {
        alias: {
            // Map any inversify source requests to our empty module
            'inversify/src': join(__dirname, 'empty-module.js'),
            'inversify/lib/esm': join(__dirname, 'empty-module.js'),
            inversify$: join(__dirname, 'empty-module.js'),
        },
    },
    stats: {
        modules: true,
        errorDetails: true,
        logging: 'verbose',
    },
    module: {
        rules: [
            // Specifically disable source maps for inversify
            {
                test: /[\\/]node_modules[\\/]inversify[\\/]/,
                enforce: 'pre',
                loader: 'source-map-loader',
                options: {
                    filterSourceMappingUrl: () => false, // Always skip source maps for inversify
                },
            },
            // Specifically target inversify ESM files
            {
                test: /[\\/]node_modules[\\/]inversify[\\/]lib[\\/]esm[\\/]/,
                enforce: 'pre',
                loader: 'source-map-loader',
                options: {
                    filterSourceMappingUrl: () => false, // Always skip source maps for inversify ESM
                },
            },
            {
                test: /\.(js|ts|tsx)$/,
                enforce: 'pre',
                include: [
                    join(__dirname, 'src'),
                    join(__dirname, 'constant'),
                    join(__dirname, 'preview-template'),
                    join(__dirname, '../../node_modules/@sg/sg-game-client'),
                    join(__dirname, '../../node_modules/@sg/sg-observer'),
                ],
                exclude: [
                    // Exclude all node_modules except @sg libraries,
                    // but always exclude inversify
                    (path) => {
                        if (path.includes('inversify')) {
                            return true; // Always exclude inversify
                        }
                        if (path.includes('node_modules')) {
                            return !path.includes('@sg/sg-game-client') && !path.includes('@sg/sg-observer');
                        }
                        return false;
                    },
                ],
                use: [
                    {
                        loader: 'source-map-loader',
                        options: {
                            filterSourceMappingUrl: (url, resourcePath) => {
                                console.log('Processing source map:', url, resourcePath);

                                // Always skip inversify source maps
                                if (resourcePath.includes('inversify') || url.includes('inversify')) {
                                    return false;
                                }

                                // For @sg libraries, ensure we process the source maps
                                if (resourcePath.includes('@sg/sg-game-client') || resourcePath.includes('@sg/sg-observer')) {
                                    return true;
                                }

                                // For hot-league-wall files, process them
                                if (resourcePath.includes('hot-league-wall')) {
                                    return true;
                                }

                                // For all other files, skip source map processing
                                return false;
                            },
                        },
                    },
                ],
            },
        ],
    },
    ignoreWarnings: [
        /Failed to parse source map/,
        /Failed to load source map/,
        /ENOENT: no such file or directory/,
        /Error: ENOENT: no such file or directory, open '.*inversify.*'/,
        /Module Warning.*@inversifyjs/,
        /Failed to parse source map from '.*@inversifyjs.*/,
        /Failed to parse source map from '.*inversify.*\.ts' file: Error: ENOENT: no such file or directory/,
        /Failed to parse source map from '.*inversify.*\.ts'/,
        /Failed to parse source map from '.*node_modules.*'/,
        /Failed to parse source map from '.*inversify\/src\/utils\/serialization\.ts'/,
        /Failed to parse source map from '.*inversify[\\/]src[\\/]utils[\\/]serialization\.ts'/,
        /Failed to parse source map from '.*inversify[\\/]lib[\\/]esm[\\/].*'/,
        {
            module: /node_modules[\\/]inversify[\\/]lib[\\/]esm[\\/]/,
            message: /.*/,
        },
        {
            module: /node_modules\/@inversifyjs/,
            message: /.*/,
        },
        {
            module: /node_modules\/inversify/,
            message: /.*/,
        },
        {
            module: /node_modules/,
            message: /.*/,
        },
    ],
    plugins: [
        new NxWebpackPlugin({
            tsConfig: './tsconfig.app.json',
            compiler: 'babel',
            main: './src/main.tsx',
            index: './preview-template/index.html',
            baseHref: '/hot-league-wall/',
            assets: [
                {
                    glob: '**/*',
                    input: 'libs/hot-league-wall/preview-template',
                    output: '/',
                },
                {
                    glob: '**/*',
                    input: 'libs/hot-league-wall/src/assets',
                    output: '/assets',
                },
            ],
            styles: ['./preview-template/styles.scss'],
            outputHashing: process.env['NODE_ENV'] === 'production' ? 'all' : 'none',
            optimization: process.env['NODE_ENV'] === 'production',
            sourceMap: {
                scripts: true,
                styles: true,
                vendor: false,
                hidden: true,
                exclude: [/[\\/]node_modules[\\/]/],
            },
        }),
        new NxReactWebpackPlugin({
            svgr: true,
        }),
    ],
};
