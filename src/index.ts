import type { Plugin } from 'esbuild';
import fs from 'fs/promises';
import { transform } from './transformer';

export const macroPlugin = (): Plugin => ({
  name: 'esbuild-macros',
  setup(build) {
    build.onLoad({ filter: /\.[jt]sx?$/ }, async (args) => {
      const contents = await fs.readFile(args.path, 'utf8');
      if (contents.includes('@macro')) {
        const transformedContents = transform(contents);
        return {
          contents: transformedContents,
          loader: args.path.endsWith('ts') ? 'ts' : 'js',
        };
      }
      return;
    });
  },
});
