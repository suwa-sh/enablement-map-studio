import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@enablement-map-studio/dsl': path.resolve(__dirname, '../../packages/dsl/src'),
      '@enablement-map-studio/store': path.resolve(__dirname, '../../packages/store/src'),
      '@enablement-map-studio/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@enablement-map-studio/editor-cjm': path.resolve(__dirname, '../../packages/editor-cjm/src'),
      '@enablement-map-studio/editor-sbp': path.resolve(__dirname, '../../packages/editor-sbp/src'),
      '@enablement-map-studio/editor-outcome': path.resolve(__dirname, '../../packages/editor-outcome/src'),
      '@enablement-map-studio/editor-em': path.resolve(__dirname, '../../packages/editor-em/src'),
    },
  },
})
