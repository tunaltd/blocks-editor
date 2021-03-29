const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.pcss$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('postcss-nested-ancestors'),
                  require('postcss-nested'),
                ],
              },
            },
          },
        ],
      },
      // {
      //   test: /\.svg$/,
      //   type: 'asset/inline',
      //   generator: {
      //     dataUrl: content => {
      //       content = content.toString();
      //       return svgToMiniDataURI(content);
      //     }
      //   }
      // }
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      title: 'Production',
    }),
  ],
  externals: {
    lodash: {
      commonjs: 'lodash',
      commonjs2: 'lodash',
      amd: 'lodash',
      root: '_',
    },
    react: { commonjs: "react", commonjs2: "react",amd: 'react', root: ['React'] },
    "react-dom": { commonjs: "react-dom", commonjs2: "react-dom", amd: 'react-dom', root: ['ReactDom'] },
    "react-redux": { commonjs: "react-redux", commonjs2: "react-redux", amd:"react-redux"},
    redux: { commonjs: "redux", commonjs2: "redux", amd: 'redux'},
    "prop-types": { commonjs: "prop-types", commonjs2: "prop-types",amd: 'prop-types' },
    "@editorjs/editorjs": { commonjs: "@editorjs/editorjs", commonjs2: "@editorjs/editorjs",amd: '@editorjs/editorjs', root: ['EditorJS'] }
  },
  output: {
    filename: 'blocks-editor.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'BlocksEditor',
    libraryExport: 'default',
    libraryTarget: 'umd',
  },
};