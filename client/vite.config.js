import fs from 'fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from 'dotenv'
import PkgConfig from 'vite-plugin-package-config'
import path from 'path'
import inject from '@rollup/plugin-inject'
import analyze from 'rollup-plugin-analyzer'

// https://vitejs.dev/config/
export default defineConfig(async command => {
  dotenv.config({
    path: './.env',
  })

  
  const returned = {
    plugins: [PkgConfig(), react()],
    server: {
      hmr: false,
      host: true,
      port: process.env.PORT || 3003,
      https: {
        key: fs.readFileSync('./certs/key.pem'),
        cert: fs.readFileSync('./certs/cert.pem'),
        maxSessionMemory: 100,
      },
    },
    resolve: {
      alias: {
        handlebars: 'handlebars/dist/handlebars.min.js',
        '@': path.resolve(__dirname, 'src'),
        '@thoth': path.resolve(__dirname, 'src/screens/Thoth'),
        '@components': path.resolve(__dirname, 'src/components'),
      },
    },
    build: {
      target: 'esnext',
      sourcemap: 'inline',
      minify: 'esbuild',
      dynamicImportVarsOptions: {
        warnOnError: true,
      },
      rollupOptions: {
        plugins: [],
        external: ['dotenv-flow'],
        output: {
          dir: 'build',
          format: 'es',
        },
      },
    },
  }

  const isAnalyze = typeof process.env.BUNDLE_ANALYZE !== 'undefined'

  if (isAnalyze) {
    returned.build.rollupOptions.plugins.push(analyze())
  }

  if (command.command === 'build' && process.env.VITE_LOCAL_BUILD !== 'true') {
    returned.build.rollupOptions.plugins = [
      inject({
        process: 'process',
      }),
    ]
  }

  if (command.command !== 'build' || process.env.VITE_LOCAL_BUILD === 'true') {
    returned.define = {
      'process.env': process.env,
      'process.browser': process.browser,
    }
  }
  return returned
})
