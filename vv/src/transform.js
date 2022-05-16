import { transformSync } from 'esbuild';
import { existsSync } from 'fs';
import { extname, dirname, join } from 'path';

export function transformCode(opts) {
  return transformSync(opts.code, {
    loader: opts.loader || 'js',
    sourcemap: true,
    format: 'esm'
  })
}

export function transformCss(opts) {
  return `
    import { updateStyle } from '/@vite/client';
    const id = '${opts.path}';
    const css = "${opts.code.replace(/\n/g, '')}";

    updateStyle(id, css);
    export default css;
  `.trim();
}

export function transformJSX(opts) {
  const ext = extname(opts.path).slice(1); // 'jsx'
  // jsx -> js
  const ret = transformCode({
    loader: ext,
    code: opts.code
  });
  let { code } = ret;
  // import type { xxx } from 'xxx.ts'
  code = code.replace(
    /\bimport(?!\s+type)(?:[\w*{}\n\r\t, ]+from\s*)?\s*("([^"]+)"|'([^']+)')/gm, // 0差断言？  "([^"]+)" 避免回溯
    (a, b, c) => {
      let from;
      if (c.charAt(0) === '.') {  // 本地文件
        from = join(dirname(opts.path), c);
        // for window
        from = from.replace(/\\/g, '/');
        console.log('form ?>>>', opts.path, dirname(opts.path), from)
        const filePath = join(opts.appRoot, from);
        if (!existsSync(filePath)) {
          if (existsSync(`${filePath}.js`)) {
            from = `${from}.js`
          }
        }
        if (['svg'].includes(extname(from).slice(1))) {
          from = `${from}?import` // 特殊资源加下标，特殊标识
        }
      } else {  // 从 node_modules 中取
        from = `/target/.cache/${c}/cjs/${c}.development.js`;
      }
      return a.replace(b, `"${from}"`);
    }
  );
  return {
    ...ret,
    code
  };
}