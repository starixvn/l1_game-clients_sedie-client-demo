const { NxWebpackPlugin } = require('@nx/webpack');
const { NxReactWebpackPlugin } = require('@nx/react');
const { join } = require('path');

const getPreviewAssets = (isDev) => {
  if (!isDev) return [];

  return [
    {
      glob: '**/*',
      input: 'libs/saba-games/preview-template',
      output: '/',
    },
  ];
};

module.exports = {
  output: {
    path: join(__dirname, '../../dist/libs/saba-games'),
  },
  devServer: {
    port: 4200,
    historyApiFallback: true,
  },
  plugins: [
    new NxWebpackPlugin({
      tsConfig: './tsconfig.app.json',
      compiler: 'babel',
      main: './src/main.tsx',
      index:
        process.env.NODE_ENV === 'development'
          ? './preview-template/index.html'
          : './src/index.html',
      assets: [
        ...getPreviewAssets(process.env.NODE_ENV === 'development'),
        {
          glob: '**/*',
          input: 'libs/saba-games/src/assets',
          output: '/assets',
        },
      ],

      styles:
        process.env.NODE_ENV === 'development'
          ? ['./preview-template/styles.scss']
          : [],
      outputHashing: 'all',
      optimization: process.env.NODE_ENV === 'production',
      sourceMap: false,
    }),

    new NxReactWebpackPlugin({
      // Uncomment this line if you don't want to use SVGR
      // See: https://react-svgr.com/
      svgr: true,
    }),
  ],
};
