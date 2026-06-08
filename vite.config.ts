import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    define: {
      __SENTRY_DSN__: JSON.stringify(env.SENTRY_DSN || ''),
      __WORLDCUP_API_KEY__: JSON.stringify(env.WORLDCUP_API_KEY || ''),
      __WORLDCUP_HOST__: JSON.stringify(env.WORLDCUP_HOST || 'https://us.posthog.com'),
    },
    server: {
      proxy: {
        '/ingest/static': {
          target: 'https://us-assets.i.posthog.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ingest\/static/, '/static'),
        },
        '/ingest': {
          target: 'https://us.i.posthog.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/ingest/, ''),
        },
      },
    },
  }
})
