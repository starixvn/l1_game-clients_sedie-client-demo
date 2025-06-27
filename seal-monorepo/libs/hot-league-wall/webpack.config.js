const { NxWebpackPlugin } = require('@nx/webpack');
const { NxReactWebpackPlugin } = require('@nx/react');
const { join } = require('path');
const webpack = require('webpack');

const getPreviewAssets = (isDev) => {
    if (!isDev) return [];

    return [
        {
            glob: '**/*',
            input: 'libs/hot-league-wall/preview-template',
            output: '/',
        },
    ];
};

module.exports = {
    output: {
        path: join(__dirname, '../../dist/libs/hot-league-wall'),
    },
    devServer: {
        port: 4201,
        historyApiFallback: true,
    },
    plugins: [
        new NxWebpackPlugin({
            tsConfig: './tsconfig.app.json',
            compiler: 'babel',
            main: './src/main.tsx',
            index: process.env.NODE_ENV === 'development' ? './preview-template/index.html' : './src/index.html',
            assets: [
                ...getPreviewAssets(process.env.NODE_ENV === 'development'),
                {
                    glob: '**/*',
                    input: 'libs/hot-league-wall/src/assets',
                    output: '/assets',
                },
            ],

            styles: process.env.NODE_ENV === 'development' ? ['./preview-template/styles.scss'] : [],
            outputHashing: 'all',
            optimization: process.env.NODE_ENV === 'production',
            sourceMap: false,
        }),

        new NxReactWebpackPlugin({
            // Uncomment this line if you don't want to use SVGR
            // See: https://react-svgr.com/
            svgr: true,
        }),

        // Define environment variables for client-side access
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
            'process.env.SIMULATOR_CONFIG': JSON.stringify(
                process.env.SIMULATOR_CONFIG ||
                    '{"simulationMode":{"enabled":true},"simulatorConfigs":{"enabled":true,"defaultGameType":"rng-soccer"}}',
            ),
        }),
    ],
};
