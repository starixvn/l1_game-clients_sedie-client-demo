const { join } = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: {
        main: join(__dirname, 'src/main.tsx'),
    },
    output: {
        path: join(__dirname, '../../dist/libs/saba-games-standalone'),
        publicPath: '/saba-games-standalone/',
        filename: '[name].[contenthash].js',
    },
    devServer: {
        port: 4200,
        historyApiFallback: true,
        hot: true,
        open: {
            app: {
                name: 'google-chrome',
                arguments: ['--new-window'],
            },
        },
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.(png|jpg|gif|svg)$/,
                type: 'asset/resource',
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: join(__dirname, 'preview-template/index.html'),
            baseHref: '/saba-games-standalone/',
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: 'preview-template',
                    to: '',
                },
                {
                    from: 'src/assets',
                    to: 'assets',
                },
            ],
        }),
    ],
};
