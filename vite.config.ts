import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 5173,
    proxy: {
      // Proxy cho Pancake POS API để bypass CORS
      '/api/pancake': {
        target: 'https://api.pancake.vn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pancake/, '/v1'),
        secure: true,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('Pancake proxy error', err);
          });
        },
      },
      '/api/pancake-pos': {
        target: 'https://pos.pancake.vn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pancake-pos/, '/api'),
        secure: true,
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
