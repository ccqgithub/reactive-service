import path from 'path';
import ts from 'rollup-plugin-typescript2';
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import virtual from '@rollup/plugin-virtual';

if (!process.env.TARGET) {
  throw new Error('TARGET package must be specified via --environment flag.');
}

const packagesDir = path.resolve(__dirname, 'packages');
const packageDir = path.resolve(packagesDir, process.env.TARGET);
const resolve = (p) => path.resolve(packageDir, p);
const pkg = require(resolve(`package.json`));
const packageOptions = pkg.buildOptions || {};
const name = packageOptions.fileName || path.basename(packageDir);

// ensure TS checks only once for each build
let hasTSChecked = false;

const outputConfigs = {
  // es6
  'esm-bundler': {
    file: resolve(`dist/${name}.esm-bundler.js`),
    format: `es`
  },
  // es6 for browser
  'esm-browser': {
    file: resolve(`dist/${name}.esm-browser.js`),
    format: `es`
  },
  // common js
  cjs: {
    file: resolve(`dist/${name}.cjs.js`),
    format: `cjs`
  },
  // window.libName =
  global: {
    file: resolve(`dist/${name}.global.js`),
    format: `iife`
  }
};

const defaultFormats = ['esm-bundler', 'cjs'];
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',');
const packageFormats =
  inlineFormats || packageOptions.formats || defaultFormats;
const packageConfigs = packageFormats.map((format) =>
  createConfig(format, outputConfigs[format])
);

// prod version, replace process.env.NODE_ENV with 'production'
packageFormats.forEach((format) => {
  // no need prod build
  if (packageOptions.prod === false) {
    return;
  }
  // no need minified for cjs
  if (format === 'cjs') {
    packageConfigs.push(createProductionConfig(format));
  }
  // minifiy
  if (/^(global|esm-browser)/.test(format)) {
    packageConfigs.push(createMinifiedConfig(format));
  }
});

export default packageConfigs;

function createConfig(format, output, plugins = []) {
  if (!output) {
    console.log(require('chalk').yellow(`invalid format: "${format}"`));
    process.exit(1);
  }

  output.sourcemap = !!process.env.SOURCE_MAP;
  output.externalLiveBindings = false;

  const isProductionBuild = /\.prod\.js$/.test(output.file);
  const isBundlerESMBuild = /esm-bundler/.test(format);
  const isBrowserESMBuild = /esm-browser/.test(format);
  const isNodeBuild = format === 'cjs';
  const isGlobalBuild = /global/.test(format);

  let virtualPlugin = [];
  if (isGlobalBuild) {
    output.name = packageOptions.name;
    output.globals = {
      ...(output.globals || {}),
      'rxjs': 'rxjs',
      'react': 'React'
    };
    virtualPlugin = [
      virtual({
        'rxjs/operators': `
           import rxjs from 'rxjs'; 
           const { skip } = rxjs.operators;
           export { skip };
        `
      })
    ];
  }

  // should generate .d.ts files
  const shouldEmitDeclarations = process.env.TYPES != null && !hasTSChecked;
  const tsPlugin = ts({
    check: !hasTSChecked,
    tsconfig: resolve('tsconfig.json'),
    cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: output.sourcemap,
        declaration: shouldEmitDeclarations,
        declarationMap: shouldEmitDeclarations
      }
    }
  });
  // we only need to check TS and generate declarations once for each build.
  // it also seems to run into weird issues when checking multiple times
  // during a single build.
  hasTSChecked = true;

  const entryFile = /runtime$/.test(format) ? `src/runtime.ts` : `src/index.ts`;

  const external =
    isGlobalBuild || isBrowserESMBuild
      ? [...Object.keys(pkg.peerDependencies || {})]
      : // Node / esm-bundler builds. Externalize everything.
        [
          ...Object.keys(pkg.dependencies || {}),
          ...Object.keys(pkg.peerDependencies || {}),
          ...['path', 'url', 'stream', 'rxjs/operators']
        ];

  const nodePlugins =
    format !== 'cjs'
      ? [
          require('@rollup/plugin-commonjs')({
            sourceMap: false
          }),
          require('rollup-plugin-node-polyfills')(),
          require('@rollup/plugin-node-resolve').nodeResolve()
        ]
      : [];

  return {
    input: resolve(entryFile),
    // Global and Browser ESM builds inlines everything so that they can be
    // used alone.
    external,
    plugins: [
      ...virtualPlugin,
      json({
        namedExports: false
      }),
      tsPlugin,
      createReplacePlugin({
        isBundlerESMBuild,
        isBrowserESMBuild,
        isGlobalBuild,
        isNodeBuild,
        isProductionBuild
      }),
      ...nodePlugins,
      ...plugins
    ],
    output,
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg);
      }
    },
    treeshake: {
      moduleSideEffects: true
    }
  };
}

function createReplacePlugin({
  isBundlerESMBuild,
  isBrowserESMBuild,
  isGlobalBuild,
  isNodeBuild,
  isProductionBuild
}) {
  let nodeEnv = `process.env.NODE_ENV`;
  if (isProductionBuild) {
    // no debug info
    nodeEnv = JSON.stringify('production');
  } else if (isBrowserESMBuild || isGlobalBuild) {
    // has debug info
    nodeEnv = JSON.stringify('development');
  }

  const replacements = {
    __COMMIT__: `"${process.env.COMMIT}"`,
    // __VERSION__: `"${masterVersion}"`,
    // this is only used during internal tests
    __TEST__: false,
    // If the build is expected to run directly in the browser (global / esm builds)
    __BROWSER__: isBrowserESMBuild || isGlobalBuild,
    __GLOBAL__: isGlobalBuild,
    __ESM_BUNDLER__: isBundlerESMBuild,
    __ESM_BROWSER__: isBrowserESMBuild,
    // is targeting Node (SSR)?
    __NODE_JS__: isNodeBuild
  };
  // allow inline overrides like
  //__RUNTIME_COMPILE__=true yarn build runtime-core
  Object.keys(replacements).forEach((key) => {
    if (key in process.env) {
      replacements[key] = process.env[key];
    }
  });
  replacements['process.env.NODE_ENV'] = process.env.NODE_ENV || nodeEnv;

  return replace({
    values: replacements,
    preventAssignment: true
  });
}

function createProductionConfig(format) {
  return createConfig(format, {
    file: resolve(`dist/${name}.${format}.prod.js`),
    format: outputConfigs[format].format
  });
}

function createMinifiedConfig(format) {
  const { terser } = require('rollup-plugin-terser');
  return createConfig(
    format,
    {
      file: outputConfigs[format].file.replace(/\.js$/, '.prod.js'),
      format: outputConfigs[format].format
    },
    [
      terser({
        module: /^esm/.test(format),
        compress: {
          ecma: 2015,
          pure_getters: true
        },
        safari10: true
      })
    ]
  );
}
