import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'persist-portrait-middleware',
        configureServer(server) {
          server.middlewares.use('/__save_portrait', (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end('Method Not Allowed');
              return;
            }
            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });
            req.on('end', () => {
              try {
                const {cutoutUrl, avatarUrl} = JSON.parse(body);
                if (typeof cutoutUrl === 'string' && cutoutUrl.startsWith('data:image/')) {
                  fs.writeFileSync(
                    path.resolve(__dirname, 'src/data/savedPortrait.json'),
                    JSON.stringify({cutoutUrl, avatarUrl: avatarUrl || cutoutUrl}),
                  );
                }
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ok: true}));
              } catch (err) {
                res.statusCode = 500;
                res.end(String(err));
              }
            });
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
