const { NxWebpackPlugin } = require('@nx/webpack');
const { NxReactWebpackPlugin } = require('@nx/react');
const { join } = require('path');

module.exports = {
    output: {
        path: join(__dirname, '../../dist/libs/saba-games'),
        publicPath: '/saba-games/',
    },
    devServer: {
        port: 4200,
        historyApiFallback: {
            index: '/saba-games/index.html',
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
            baseHref: '/saba-games/',
            assets: [
                {
                    glob: '**/*',
                    input: 'libs/saba-games/preview-template',
                    output: '/',
                },
                {
                    glob: '**/*',
                    input: 'libs/saba-games/src/assets',
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
