import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
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
                  fs.mkdirSync(path.resolve(__dirname, 'src/data'), {recursive: true});
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

          server.middlewares.use('/api/bookings', (req, res) => {
            const bookingsFile = path.resolve(__dirname, 'src/data/bookings.json');
            fs.mkdirSync(path.dirname(bookingsFile), {recursive: true});
            const readBookings = () => {
              try {
                if (fs.existsSync(bookingsFile)) {
                  return JSON.parse(fs.readFileSync(bookingsFile, 'utf8'));
                }
              } catch {
                // ignore parse errors
              }
              return [];
            };

            if (req.method === 'GET') {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({bookings: readBookings()}));
              return;
            }

            if (req.method === 'POST') {
              let body = '';
              req.on('data', (chunk) => {
                body += chunk;
              });
              req.on('end', () => {
                try {
                  const payload = JSON.parse(body || '{}');
                  const bookings = readBookings();
                  const newBooking = {
                    id: `bk_${Date.now()}`,
                    name: String(payload.name || '').trim(),
                    email: String(payload.email || '').trim(),
                    notes: String(payload.notes || '').trim(),
                    dateKey: String(payload.dateKey || '').trim(),
                    dateLabel: String(payload.dateLabel || '').trim(),
                    slot24: String(payload.slot24 || '').trim(),
                    slotLabel: String(payload.slotLabel || '').trim(),
                    timezone: String(payload.timezone || '').trim(),
                    createdAt: new Date().toISOString(),
                  };
                  bookings.push(newBooking);
                  fs.writeFileSync(bookingsFile, JSON.stringify(bookings, null, 2));
                  res.statusCode = 200;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ok: true, booking: newBooking, bookings}));
                } catch (err) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ok: false, error: String(err)}));
                }
              });
              return;
            }

            res.statusCode = 405;
            res.end('Method Not Allowed');
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
