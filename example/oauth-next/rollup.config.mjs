import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/main.ts',
  output: {
    file: 'index.js',
    format: 'iife',
    name: 'ExampleApp',
  },
  plugins: [resolve(), typescript()],
};
