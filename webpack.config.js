var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

var SRC_DIR = path.join(__dirname, '/react-client/src');
var DIST_DIR = path.join(__dirname, '/react-client/dist');


module.exports = {
  entry: `${SRC_DIR}/index.jsx`,
  output: {
    filename: 'bundle.js',
    path: DIST_DIR
  },
  module: {
    rules: [
      { test : /\.jsx?/, 
        use: {
          loader:'babel-loader',
          options: {
            presets: ['react', 'es2015'],
            plugins: ['transform-class-properties']
                    } 
              } 
        },
      { test: /\.css$/, use: ['style-loader', 'css-loader'] }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      // The template: will be served by the devServer, with the bundled
    // code inserted.
      template: SRC_DIR + '/index.html'
    })
  ],
  externals: {
    // These global symbols are brought in by <script> tags hitting a CDN in
    // SRC_DIR/index.html so any source code that requires or imports them
    // will be made to get them from global scope instead.
    //
    // This is because the NPM-bundled firebaseui package is packed in such a
    // way that it doesn't evaluate correctly when packed into a webpack
    // bundle. It tries to bundle its own npm.js style loader.
    firebase: 'firebase',
    firebaseui: 'firebaseui'
  },
  mode: 'development',
  devtool: 'eval',
  devServer: {
    port: 3000
  }
};

