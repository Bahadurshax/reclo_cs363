import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node24',
  clean: true,
  sourcemap: true,
  // @reclo/shared ships TypeScript source, so it must be bundled into the output.
  noExternal: ['@reclo/shared'],
})
