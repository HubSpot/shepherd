import atImport from 'postcss-import';
import autoprefixer from 'autoprefixer';
import babel from 'rollup-plugin-babel';
import browsersync from 'rollup-plugin-browsersync';
import commonjs from 'rollup-plugin-commonjs';
import { eslint } from 'rollup-plugin-eslint';
import fs from 'fs';
import license from 'rollup-plugin-license';
import postcss from 'postcss';
import filesize from 'rollup-plugin-filesize';
import resolve from 'rollup-plugin-node-resolve';
import sass from 'rollup-plugin-sass';
import stylelint from 'rollup-plugin-stylelint';
import { uglify } from 'rollup-plugin-uglify';

const pkg = require('./package.json');
const banner = ['/*!', pkg.name, pkg.version, '*/\n'].join(' ');

const sassOptions = {
  output(styles, styleNodes) {
    fs.mkdirSync('dist/css', { recursive: true }, (err) => {
      if (err) {
        throw err;
      }
    });

    styleNodes.forEach(({ id, content }) => {
      const scssName = id.substring(id.lastIndexOf('/') + 1, id.length);
      const name = scssName.split('.')[0];
      fs.writeFileSync(`dist/css/${name}.css`, content);
    });
  },
  processor: css => postcss([
    atImport(),
    autoprefixer({
      grid: false
    })
  ])
    .process(css)
    .then(result => result.css)
};

const plugins = [
  resolve(),
  commonjs(),
  stylelint({
    fix: false,
    include: ['src/**.scss'],
    syntax: 'scss',
    quiet: false
  }),
  eslint(),
  babel({
    exclude: 'node_modules/**'
  })
];

if (!process.env.DEVELOPMENT) {
  plugins.push(sass({
    output: false
  }));
}

// If we are running with --environment DEVELOPMENT, serve via browsersync for local development
if (process.env.DEVELOPMENT) {
  plugins.push(browsersync({
    host: 'localhost',
    watch: true,
    port: 3000,
    notify: false,
    open: true,
    server: {
      baseDir: 'docs/welcome',
      routes: {
        '/shepherd/dist/css/shepherd-theme-default.css': 'dist/css/shepherd-theme-default.css',
        '/shepherd/dist/js/shepherd.js': 'dist/js/shepherd.js',
        '/shepherd/docs/welcome/js/prism.js': 'docs/welcome/js/prism.js',
        '/shepherd/docs/welcome/js/welcome.js': 'docs/welcome/js/welcome.js',
        '/shepherd/docs/welcome/css/prism.css': 'docs/welcome/css/prism.css',
        '/shepherd/docs/welcome/css/welcome.css': 'docs/welcome/css/welcome.css',
        '/shepherd/docs/welcome/sheep.svg': 'docs/welcome/sheep.svg'
      }
    }
  }));

  plugins.push(sass(sassOptions));
}

plugins.push(license({ banner }));
plugins.push(filesize());

const rollupBuilds = [
  // Generate unminifed bundle
  {
    input: './src/js/shepherd.js',

    output: [
      {
        file: pkg.main,
        format: 'umd',
        name: 'Shepherd',
        sourcemap: true
      },
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins
  }
];

if (!process.env.DEVELOPMENT) {
  rollupBuilds.push(
    // Generate minifed bundle
    {
      input: './src/js/shepherd.js',
      output: {
        file: 'dist/js/shepherd.min.js',
        format: 'umd',
        name: 'Shepherd',
        sourcemap: true
      },
      plugins: [
        resolve(),
        commonjs(),
        babel({
          exclude: 'node_modules/**'
        }),
        license({
          banner
        }),
        sass(sassOptions),
        uglify(),
        filesize()
      ]
    });
}

export default rollupBuilds;