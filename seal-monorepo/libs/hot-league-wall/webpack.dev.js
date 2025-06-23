const { NxWebpackPlugin } = require('@nx/webpack');
const { NxReactWebpackPlugin } = require('@nx/react');
const { join } = require('path');

module.exports = {
    output: {
        path: join(__dirname, '../../dist/libs/hot-league-wall'),
        publicPath: '/hot-league-wall/',
    },
    devServer: {
        port: 4201,
        historyApiFallback: {
            index: '/hot-league-wall/index.html',
        },
        headers: {
            'Access-Control-Allow-Origin': '*',
        },
    },
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
            sourceMap: false,
        }),
        new NxReactWebpackPlugin({
            // Uncomment this line if you don't want to use SVGR
            // See: https://react-svgr.com/
            svgr: true,
        }),
    ],
};
