const { NxWebpackPlugin } = require('@nx/webpack');
const { NxReactWebpackPlugin } = require('@nx/react');
const { join } = require('path');

module.exports = {
    output: {
        path: join(__dirname, '../../dist/libs/hot-league-wall'),
        publicPath: '/hot-league-wall/',
        devtoolModuleFilenameTemplate: 'file:///[absolute-resource-path]',
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
    devtool: process.env.NODE_ENV === 'production' ? 'source-map' : 'eval-source-map',
    module: {
        rules: [
            {
                test: /\.(js|ts|tsx)$/,
                enforce: 'pre',
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'source-map-loader',
                        options: {
                            filterSourceMappingUrl: (url, resourcePath) => {
                                if (resourcePath.includes('@sg/sg-game-client') || resourcePath.includes('@sg/sg-observer')) {
                                    return false;
                                }
                                return true;
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
        {
            module: /node_modules\/@inversifyjs/,
            message: /.*/,
        },
        {
            module: /node_modules\/inversify/,
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
                vendor: true,
            },
        }),
        new NxReactWebpackPlugin({
            // Uncomment this line if you don't want to use SVGR
            // See: https://react-svgr.com/
            svgr: true,
        }),
    ],
};
