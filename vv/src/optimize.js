// node_modules中的包，预先编译，并缓存
import { build } from 'esbuild';
import { join } from 'path';

const appRoot = join(__dirname, '..');
const cache = join(appRoot, 'target', '.cache');

export async function optimize (pkgs = ['react', 'react-dom']) {
  const ep = pkgs.reduce((c, n) => {
    c.push(join(appRoot, 'node_modules', n, `cjs/${n}.development.js`));
    return c;
  }, []);

  await build({
    entryPoints: ep,
    bundle: true,
    format: 'esm',
    logLevel: 'error',
    splitting: true,
    sourcemap: true,
    outdir: cache,
    treeShaking: 'ignore-annotations',
    metafile: true,
    define: {
      'process.env.NODE_ENV': JSON.stringify('development')
    }
  })
}