import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import scss from 'rollup-plugin-scss';
import sass from 'sass';

export default {
  input: 'src/main.ts',
  output: {
    file: 'index.js',
    format: 'iife',
    name: 'LichessDemo',
  },
  plugins: [
    resolve(),
    typescript(),
    commonjs(),
    scss({
      include: ['scss/*.scss'],
      output: './style.css',
      failOnError: true,
      runtime: sass,
    }),
  ],
};
