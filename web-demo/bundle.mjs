import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

await build({
  entryPoints: [resolve(__dirname, '../packages/analyzer/src/index.ts')],
  bundle: true,
  format: 'esm',
  outfile: resolve(__dirname, 'analyzer-bundle.mjs'),
  platform: 'browser',
  target: 'es2022',
  external: [],
  alias: {
    '@dsa-analyzer/shared': resolve(__dirname, '../packages/shared/src/index.ts'),
  },
  tsconfig: resolve(__dirname, '../tsconfig.json'),
  minify: false,
});

console.log('✅ analyzer-bundle.mjs created successfully!');
