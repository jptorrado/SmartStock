import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const port = Number(process.env.FRONTEND_PORT) || Number(env.FRONTEND_PORT);

  return {
    plugins: [react()],
    server: {
      port: port,
      host: '0.0.0.0',
      strictPort: true, //
    }
  }
});