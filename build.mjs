import { build, context } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const watch = process.argv.includes('--watch');
const outdir = resolve('.');

const cssAsTextPlugin = {
  name: 'css-as-text',
  setup(b) {
    b.onLoad({ filter: /\.css$/ }, async (args) => {
      const css = await readFile(args.path, 'utf8');
      return { contents: `export default ${JSON.stringify(css)};`, loader: 'js' };
    });
  },
};

const common = {
  bundle: true,
  format: 'iife',
  target: ['chrome110'],
  platform: 'browser',
  sourcemap: false,
  legalComments: 'none',
  minify: !watch,
  logLevel: 'info',
  plugins: [cssAsTextPlugin],
};

const entries = [
  { entryPoints: ['src/injected.ts'], outfile: `${outdir}/injected.js` },
  { entryPoints: ['src/content.ts'], outfile: `${outdir}/content.js` },
];

if (watch) {
  for (const e of entries) {
    const ctx = await context({ ...common, ...e });
    await ctx.watch();
  }
  console.log('watching for changes...');
} else {
  await Promise.all(entries.map((e) => build({ ...common, ...e })));
  console.log('built injected.js and content.js');
}
