# npmとwebpackで作るいい感じのフロントエンド開発環境（React.js使わない）、sass-loaderを使う。2016年5月の場合。

css-loader、style-loader、sass-loaderを使わないでSassをnpmでコマンドからコンパイルするものがシンプルでいいなと思ってましたがwebpackのloaderを使うものも作ってみた。
SassのコンパイルやらCSSをrequireしないと？と思ってたけどプラグインを使えばできた。

## 必要なものあるかどうか確認

```
node -v
```
まずはお決まりのNode.js入ってるか確認。

```
npm -v
```
npm（Node.jsのパッケージマネージャー）も入ってるか確認。

```
webpack -v
```
webpackも入っているか確認。  
もし入ってなかったら

```
npm install -g webpack
```
-gオプションはGlobalオプションのこと。

## ファイル・フォルダ構成

```
git clone https://github.com/shigekitakeguchi/npm-webpack-sass-loader.git
```

[https://github.com/shigekitakeguchi/npm-webpack-sass-loader](https://github.com/shigekitakeguchi/npm-webpack-sass-loader)

GitHubから落として使ってください。  
カスタマイズなりなんなりして。

```
cd npm-webpack-sass
```
落としたフォルダ内に移動する。

```
├── LICENSE
├── README.md
├── app
│   ├── scripts
│   └── styles
├── bs-config.json
├── package.json
├── src
│   ├── scripts
│   │   └── app.js
│   └── scss
│       ├── _normalize.css
│       └── app.scss
└── webpack.config.js
```

ファイル・フォルダ構成はこんな感じ。README.mdやLICENSEは開発するには不要。

```
npm install
```
これで必要なパッケージがインストールされるはず。  

## package.json

```json
{
  "name": "npm + webpack + sass-loader",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "devDependencies": {
    "concurrently": "^2.1.0",
    "css-loader": "^0.23.1",
    "extract-text-webpack-plugin": "^1.0.1",
    "lite-server": "^2.2.0",
    "sass-loader": "^3.2.0",
    "style-loader": "^0.13.1",
    "webpack": "^1.13.0"
  },
  "scripts": {
    "webpack": "webpack -w",
    "lite": "lite-server",
    "start": "concurrently \"npm run lite\" \"npm run webpack\""
  },
  "keywords": [],
  "author": "shigeki.takeguchi",
  "license": "MIT"
}
```
中身はこんな感じ。

### パッケージの説明

落としてきたpackage.jsonからインストールすればいいんですがそれぞれのパッケージの説明を。

```
npm install --save-dev concurrently
```
[https://github.com/kimmobrunfeldt/concurrently](https://github.com/kimmobrunfeldt/concurrently)

concurrentlyは複数のコマンド実行できるようにするため。具体的に何をしているかは後ほど説明。

```
npm install --save-dev lite-server
```
[https://github.com/johnpapa/lite-server](https://github.com/johnpapa/lite-server)

webpackにもwebpack dev serverというのがあるみたいだけどlite-serverのがシンプルで良さそうなので使ってみた。  
ただし設定ファイルは必要でした。

```
npm install --save-dev css-loader
```
webpack的な使い方であるJavaScriptファイルにCSSをロードしたりしないけどCSSを扱うなら必要らしいのでインストール。またCSSを最適化（minimize）はこのパッケージの機能を利用。

```
npm install --save-dev style-loader
```
こちらもCSSを扱うためにインストール。css-loaderとあわせて使うことが推奨されているみたい。

```
npm install --save-dev sass-loader
```
Sassのコンパイルには必要らしいのでインストール。

```
npm install --save-dev extract-text-webpack-plugin
```
webpackは本来、JavaScirptのファイルの中にCSSを読みこんで使うようになっているけどこのプラグインを使うと読み込まずに使うことが可能になる（後述）。

```
npm install --save-dev webpack
```
[https://github.com/webpack/webpack](https://github.com/webpack/webpack)

webpack。もうすでに何をするツールなのか説明しがたいくらい機能がある。  
静的なファイル（JavaScript系、CSS系、画像ファイル）の依存関係を解決するためのビルドツールってことなんだけど、ここでははJavaScriptだけを扱うようにしている。

## package.jsonの中のscriptsで何をしているか

```json
"scripts": {
"webpack": "webpack -w",
"lite": "lite-server",
"start": "concurrently \"npm run lite\" \"npm run webpack\""
},
```

```
npm start
```
このコマンドでlite-serverを立ち上げwebpackでwatchを行う。  

```json
"start": "concurrently \"npm run lite\" \"npm run webpack\""
```
scriptsの中にあるstartがこれにあたる。

```
npm run lite
```
```
npm run webpack
```

これらのコマンドはそれぞれ独立したコマンドですが、最初にちょっと触れたがconcurrentlyにダブルクオーテーションでくくってスペースで区切って引数で渡せば並行して実行することになる。便利。

```json
"webpack": "webpack -w",
```
これはwebpackのwatch（監視）を走らせている。こちらも後ほど触れるがwebpack.config.jsonで記述されたことをもとに監視している。

```json
"lite": "lite-server",
```
lite-serverを立ち上げている。bs-config.jsonに設定ないようを記述している（こちらも後ほど触れる）。

## bs-config.json

```json
{
  "injectChanges": "true",
  "files": ["./app/**/*.{html,htm,css,js}"],
  "watchOptions": { "ignored": "node_modules" },
  "server": { "baseDir": "./app" }
}
```
lite-serverの設定はドキュメントルートをappの直下にしたかったのと監視対象のファイル（html、css、js）が変更されたらリロードしてinjectChangesというBrowsersyncを動すため。

## webpack.config.json

```javascript
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = [{
  entry: {
    bundle: './src/scripts/app.js',
  },
  output: {
    path: __dirname + '/app/scripts',
    filename: 'bundle.js',
		publicPath: '/app/',
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin()
  ]
},{
  entry: {
    style: './src/scss/app.scss'
  },
  output: {
    path: __dirname + '/app/styles',
    filename: 'style.css'
  },
  module: {
    loaders: [
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract("style-loader", "css-loader?minimize!sass-loader")
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("style.css")
  ]
}];
```
webpackの設定は複数のモジュール機能（この場合はJavaScriptとSass）なので以下のように配列で持たせるようになっている。

```javascript
module.exports = [{},{}]
```

ひとつのモジュールだとこんな感じ。オブジェクトがひとつだけでいい。

```javascript
module.exports = {}
```
entryにもとファイルJavaScriptは./src/scripts/app.js、CSS（Sass）は./src/scss/app.scssですね。それぞれ/app内のscriptsとstylesに出力している。  
JavaScriptはwebpackのUglifyJsPluginで圧縮している。  
CSS（Sass）の場合はExtractTextPluginで普通のCSSファイルに出力している。

```javascript
module: {
  loaders: [
    {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader")
    }
  ]
},
```
最適化（minimize）しない場合はこのように記述することでSassファイルがコンパイルされつつoutputで指定した場所とファイル名（/app/styles/style.css）で出力される。

```javascript
module: {
  loaders: [
    {
      test: /\.scss$/,
      loader: ExtractTextPlugin.extract("style-loader", "css-loader?minimize!sass-loader")
    }
  ]
},
```
minimizeしたい場合はこのようにcss-loaderにminimizeオプションを引き数で渡す。

---

まだwebpackをはじめて数日とかという状態なので間違えや指摘をいただけると助かります。