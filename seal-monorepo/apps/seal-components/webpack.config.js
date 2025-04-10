const { resolve } = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const { version } = require('./package.json');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const SEAL_COMPONENT_PROJECT = resolve(__dirname, 'dist'); // 打包給 seal-components 外部使用的所有檔案
const SEAL_COMPONENT_OUTPUT = resolve(SEAL_COMPONENT_PROJECT, 'dist'); // seal-components 產出檔案

module.exports = {
    mode: 'development',
    entry: resolve(__dirname, 'src/index.ts'),
    // Configure detailed stats output
    stats: {
        modules: true,
        errorDetails: true,
        logging: 'verbose',
    },
    output: {
        path: SEAL_COMPONENT_OUTPUT,
        filename: 'seal-components.js',
        library: 'SealComponents',
        libraryTarget: 'umd',
        // Custom source map URL template
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
                return `sources://hot-league-wall/${cleanPath}`;
            }

            // For seal-components files, use app prefix
            if (relativePath.includes('seal-components')) {
                const cleanPath = relativePath.split('seal-components/').pop();
                return `sources://seal-components/${cleanPath}`;
            }

            // For other files, use a loadable relative URL
            return `sources:///${relativePath.replace(/\\/g, '/')}`;
        },
    },
    // Enable source maps for development
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        alias: {
            '@SabaGamesGroup': resolve(__dirname, '../../libs/saba-games/src/index.tsx'),
            '@HotLeagueWall': resolve(__dirname, '../../libs/hot-league-wall/src/index.tsx'),
        },
    },
    // Ignore all source map warnings from node_modules
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
            message: /Failed to parse source map/,
        },
    ],
    module: {
        rules: [
            {
                test: /\.(js|ts|tsx|jsx)$/,
                enforce: 'pre',
                include: [
                    // resolve(__dirname, 'src'),
                    // resolve(__dirname, '../../libs/saba-games/src'),
                    resolve(__dirname, '../../libs/hot-league-wall/src'),
                    resolve(__dirname, '../../node_modules/@sg/sg-game-client'),
                    resolve(__dirname, '../../node_modules/@sg/sg-observer'),
                ],
                exclude: [
                    // Exclude all node_modules except @sg libraries
                    (path) => {
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

                                // For @sg libraries, ensure we process the source maps
                                if (resourcePath.includes('@sg/sg-game-client') || resourcePath.includes('@sg/sg-observer')) {
                                    return true;
                                }

                                // For hot-league-wall files, process them
                                if (resourcePath.includes('hot-league-wall')) {
                                    return true;
                                }

                                // For seal-components files, process them
                                if (resourcePath.includes('seal-components')) {
                                    return true;
                                }

                                // For all other files, skip source map processing
                                return false;
                            },
                        },
                    },
                ],
            },
            {
                test: /\.(js|jsx)$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react'],
                        plugins: ['@babel/plugin-transform-runtime'],
                    },
                },
                exclude: [/node_modules/, /libs\/saba-games\/preview-template/, /libs\/hot-league-wall\/preview-template/],
            },
            {
                test: /\.module\.(css|scss|sass)$/,
                exclude: [/node_modules/, /libs\/saba-games\/preview-template/],
                rules: [
                    {
                        use: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                            // CSS Modules https://github.com/css-modules/css-modules
                            modules: {
                                localIdentName: '[hash:base64:5]',
                            },
                        },
                    },
                    {
                        test: /\.(scss|sass)$/,
                        loader: 'sass-loader',
                    },
                ],
            },
            {
                test: /(?<!\.module)\.(css|scss|sass)$/,
                exclude: [/node_modules/, /libs\/saba-games\/preview-template/, /libs\/hot-league-wall\/preview-template/],
                rules: [
                    {
                        use: 'style-loader',
                    },
                    {
                        loader: 'css-loader',
                        options: {
                            importLoaders: 1,
                        },
                    },
                    {
                        test: /\.(scss|sass)$/,
                        loader: 'sass-loader',
                    },
                ],
            },
            {
                test: /\.(png|jp(e*)g|gif)$/,
                type: 'asset/inline',
            },
            {
                test: /\.(svg)$/,
                rules: [
                    {
                        include: resolve(__dirname, '../../libs'),
                        rules: [
                            {
                                issuer: /\.(js|jsx|mjs|ts|tsx)$/,
                                loader: '@svgr/webpack',
                            },
                            {
                                issuer: /\.(css|scss|sass)$/,
                                type: 'asset/inline',
                            },
                        ],
                    },
                ],
            },
            {
                test: /\.(woff(2)?|ttf|eot)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'src/fonts/',
                        },
                    },
                ],
            },
            {
                test: /\.txt$/i,
                use: 'raw-loader',
            },
            {
                test: /\.(ts|tsx)$/,
                exclude: [
                    /(node_modules|bower_components|typings)/,
                    /libs\/saba-games\/preview-template/,
                    /libs\/hot-league-wall\/preview-template/,
                ],
                loader: 'ts-loader',
                options: {
                    transpileOnly: true,
                },
            },
        ],
    },
    optimization: {
        splitChunks: false,
        runtimeChunk: false,
        minimize: true,
        minimizer: [
            new TerserPlugin({
                parallel: true,
                terserOptions: {
                    compress: {
                        drop_console: true,
                        drop_debugger: true,
                    },
                    format: {
                        comments: false,
                    },
                },
                extractComments: false,
            }),
            new CssMinimizerPlugin(),
        ],
    },
    externals: {
        react: {
            commonjs: 'react',
            commonjs2: 'react',
            amd: 'react',
            root: 'React',
        },
        'react-dom': {
            commonjs: 'react-dom',
            commonjs2: 'react-dom',
            amd: 'react-dom',
            root: 'ReactDOM',
        },
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.APP_ENV': JSON.stringify(process.env.APP_ENV),
            'process.env.DEBUG': JSON.stringify(process.env.DEBUG),
            'process.env.TAG_VERSION': JSON.stringify(version),
        }),
        new webpack.optimize.LimitChunkCountPlugin({
            maxChunks: 1,
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: resolve(__dirname, 'package.json'),
                    to: SEAL_COMPONENT_PROJECT,
                },
                {
                    from: resolve(__dirname, 'types'),
                    to: resolve(SEAL_COMPONENT_PROJECT, 'types'),
                },
            ],
        }),
        new BundleAnalyzerPlugin({
            generateStatsFile: true,
            openAnalyzer: false,
            analyzerMode: 'static',
            statsFilename: '../bundle-stats.json',
            reportFilename: '../bundle-report.html',
        }),
    ],
};
