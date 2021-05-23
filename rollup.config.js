import path from 'path';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';

// env: COMMIT, TARGET, FORMATS, TYPES, SOURCE_MAP
if (!process.env.TARGET) {
  throw new Error('TARGET package must be specified via --environment flag.');
}

const packagesDir = path.resolve(__dirname, 'packages');
const packageDir = path.resolve(packagesDir, process.env.TARGET);
const resolve = (p) => path.resolve(packageDir, p);
const pkg = require(resolve(`package.json`));
const packageOptions = pkg.buildOptions || {};
const name = packageOptions.fileName || path.basename(packageDir);

const extensions = ['.ts', '.tsx'];
const sourceMap = !!process.env.SOURCE_MAP;
const makeExternalPredicate = (externalArr) => {
  if (externalArr.length === 0) {
    return () => false;
  }
  const pattern = new RegExp(`^(${externalArr.join('|')})($|/)`);
  return (id) => pattern.test(id);
};
const makeTypescript = (declaration = true) => {
  return typescript({
    check: declaration,
    tsconfig: resolve('tsconfig.json'),
    cacheRoot: path.resolve(__dirname, 'node_modules/.rts2_cache'),
    useTsconfigDeclarationDir: true,
    tsconfigOverride: {
      compilerOptions: {
        sourceMap: sourceMap,
        declaration: declaration,
        declarationMap: declaration,
        declarationDir: resolve('temp/types')
      }
    }
  });
};

const globals = {
  'rxjs': 'rxjs',
  'rxjs/operators': 'rxjs.operators',
  'react': 'React',
  'vue': 'Vue'
};
const outputConfigs = {
  // common js
  cjs: {
    input: resolve('src/index.ts'),
    output: {
      file: resolve(`dist/${name}.js`),
      format: `cjs`
    },
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ]),
    plugins: [
      nodeResolve({
        extensions
      }),
      makeTypescript(true)
    ]
  },
  // ES
  'esm': {
    input: resolve('src/index.ts'),
    output: {
      file: resolve(`dist/${name}.esm.js`),
      format: `es`
    },
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ]),
    plugins: [
      nodeResolve({
        extensions
      }),
      commonjs({
        sourceMap: false
      }),
      makeTypescript(false)
    ]
  },
  // ES for Browsers
  'esm-browser': {
    input: resolve('src/index.ts'),
    output: {
      file: resolve(`dist/${name}.esm-browser.js`),
      format: `es`
    },
    external: makeExternalPredicate([
      ...Object.keys(pkg.dependencies || {}),
      ...Object.keys(pkg.peerDependencies || {})
    ]),
    plugins: [
      nodeResolve({
        extensions
      }),
      commonjs({
        sourceMap: false
      }),
      makeTypescript(false),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      terser({
        module: true,
        compress: {
          ecma: 2015,
          pure_getters: true
        },
        safari10: true
      })
    ]
  },
  // umd
  umd: {
    input: resolve('src/index.ts'),
    output: {
      file: resolve(`dist/${name}.umd.js`),
      name: packageOptions.name,
      format: `umd`,
      globals
    },
    external: makeExternalPredicate([
      ...Object.keys(pkg.peerDependencies || {})
    ]),
    plugins: [
      nodeResolve({
        extensions
      }),
      commonjs({
        sourceMap: false
      }),
      makeTypescript(true),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('development')
      })
    ]
  },
  // umd
  'umd-prod': {
    input: resolve('src/index.ts'),
    output: {
      file: resolve(`dist/${name}.umd.prod.js`),
      name: packageOptions.name,
      format: `umd`,
      globals
    },
    external: makeExternalPredicate([
      ...Object.keys(pkg.peerDependencies || {})
    ]),
    plugins: [
      nodeResolve({
        extensions
      }),
      commonjs({
        sourceMap: false
      }),
      makeTypescript(true),
      replace({
        preventAssignment: true,
        'process.env.NODE_ENV': JSON.stringify('production')
      }),
      terser({
        module: true,
        compress: {
          ecma: 2015,
          pure_getters: true
        },
        safari10: true
      })
    ]
  }
};

const defaultFormats = ['cjs', 'esm', 'esm-browser', 'umd', 'umd-prod'];
const inlineFormats = process.env.FORMATS && process.env.FORMATS.split(',');
const packageFormats =
  inlineFormats || packageOptions.formats || defaultFormats;
const packageConfigs = packageFormats.map((format) => {
  return {
    ...outputConfigs[format],
    onwarn: (msg, warn) => {
      if (!/Circular/.test(msg)) {
        warn(msg);
      }
    },
    treeshake: {
      moduleSideEffects: true
    }
  };
});

export default packageConfigs;
