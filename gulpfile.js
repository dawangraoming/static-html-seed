const { resolve, basename, relative, dirname } = require('path');
const { readdirSync, statSync } = require('fs');

const { series, src, dest, watch } = require('gulp');
const clean = require('gulp-clean');
const ejs = require('gulp-ejs');
const rename = require('gulp-rename');
// const useRef = require('gulp-useref');
const gulpIf = require('gulp-if');
const sass = require('gulp-sass');

const glob = require('glob');

const isString = (string) => typeof string === 'string';

const browserSync = require('browser-sync').create();

const SOURCE = './src';

// 基础配置
const CONFIG = {
  SOURCE,
  SCSS_PATH: resolve(SOURCE, './**/*.scss'),
  EJS_PATH: resolve(SOURCE, './**/*.ejs'),
  PAGES_PATH: resolve(SOURCE, './pages/**/*.ejs'),
  WATCH_DELAY: { delay: 500 }, // 监听器回调延迟
  DIST_PATH: resolve(__dirname, 'dist'), // 输出目录
};

const DIST = CONFIG.DIST_PATH;

function browserSyncServe() {
  browserSync.init({
    server: {
      baseDir: DIST,
    },
  });
  // 监听EJS文件的变更，如果添加了新文件或者有文件变动，则触发编译过程
  watch(CONFIG.EJS_PATH, CONFIG.WATCH_DELAY, function watchEjsFileChanged(cb) {
    console.log('EJS 文件更新');
    cb();
  })
    .on('add', compileEjsFile)
    .on('change', compileEjsFile);

  watch(CONFIG.SCSS_PATH, CONFIG.WATCH_DELAY, function watchSassFileChanged(
    cb,
  ) {
    console.log('Sass 文件更新');
    cb();
  }).on('all', compileSass);
}

/**
 * 删除文件或整个构建目录
 * @param [file] {string}
 * @returns {*}
 */
function delFileOrDistPath(file) {
  return src(isString(file) ? file : DIST, { read: false }).pipe(clean());
}

/**
 * 编译EJS为HTML文件
 * @param [file] {string}
 * @returns {*}
 */
function compileEjsFile(file) {
  return src(isString(file) ? file : CONFIG.PAGES_PATH)
    .pipe(ejs())
    .pipe(rename({ extname: '.html' }))
    .pipe(dest(DIST));
}

/**
 * 编译SASS文件
 * @param [file] {string}
 * @returns {*}
 */
function compileSass(file) {
  return src(isString(file) ? file : CONFIG.SCSS_PATH)
    .pipe(sass().on('error', sass.logError))
    .pipe(dest(DIST));
}

/**
 * 获取路径对象
 * @param item {string}
 * @returns {{path: *, name: string}}
 */

/**
 * 生成引导页面
 */
function generateGuidePage(cb) {
  const guide = resolve(CONFIG.SOURCE, 'index.ejs');
  // 获取匹配到的页面EJS
  // 并将其转换为 { path: 'xxx/name.ejs', name: 'name'} 的数组
  const pages = glob.sync(CONFIG.PAGES_PATH);
  // 从pages中过滤出一个只有目录的路径数组后进行去重操作
  // 最后形成一个  [{ name: xxx, path: xxx, pages: [{name: xxx, path: xxx}]}] 类型的地址
  const group = Array.from(
    new Set(pages.map((item) => dirname(item))),
  ).map((item) => ({ name: basename(item), path: item }));
  // 生成出所有子页面
  pages.forEach((item) => {
    for (let i = 0; i < group.length; i++) {
      const gItem = group[i];
      if (!gItem.pages) {
        gItem.pages = [];
      }
      // 与父路径匹配则属于一个目录， 添加到子页面中
      if (item.indexOf(gItem.path) >= 0) {
        return gItem.pages.push({
          // 将其转为相对地址，并且替换扩展名为.html
          path: relative(guide, item).replace(
            /^(\.{2}\/pages)(.+?)(\.ejs)$/,
            '.$2.html',
          ),
          name: basename(item, '.ejs'),
        });
      }
    }
  });
  return src(guide)
    .pipe(ejs({ group }))
    .pipe(rename({ extname: '.html' }))
    .pipe(dest(DIST));
}

/**
 * 初始化，目录清理，HTML和CSS编译
 */
const build = (exports.build = series(
  delFileOrDistPath,
  compileEjsFile,
  compileSass,
  generateGuidePage
));

exports.ejs = compileEjsFile;
exports.sass = compileSass;
exports.clean = delFileOrDistPath;
exports.serve = series(build, browserSyncServe);
exports.generateGuidePage = generateGuidePage;
exports.default = build;
