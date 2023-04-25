import typescript from 'rollup-plugin-typescript2';
import del from 'rollup-plugin-delete';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from "rollup-plugin-terser";
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const pkg = JSON.parse(readFileSync(resolve(__dirname, './package.json'), 'utf8'));
export default {
  input: [
    'src/index.ts',
  ],
  output: [
    {
      file: pkg.module,
      format: 'es',
    },
    {
      file: pkg.main,
      format: 'cjs',
    },
  ],
  plugins: [
    del({ targets: 'dist' }),
    nodeResolve({
      browser: true
    }),
    commonjs(),
    typescript({
      tsconfig: './tsconfig.node.json',
      useTsconfigDeclarationDir: true,
    }),
    terser()
  ],
};
