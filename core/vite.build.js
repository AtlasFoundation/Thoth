import path from 'path'
import { defineConfig } from 'vite'

export default defineConfig(() => {
  return {
    build: {
      lib: {
        entry: path.resolve(__dirname, 'index.ts'),
        name: '@latitudegames/thoth-core',
      },
      minify: 'esbuild',
      sourcemap: 'inline',
      rollupOptions: {
        input: path.resolve(__dirname, 'index.ts'),
        output: {
          dir: 'dist',
          format: 'es',
          sourcemap: true,
          inlineDynamicImports: true,
        },
        plugins: [],
      },
    },
  }
})
