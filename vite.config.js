import { defineConfig } from 'vite';
import { readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

export default defineConfig({
  base: './',
  plugins: [{
    name: 'fieldquote-offline-shell',
    apply: 'build',
    async closeBundle() {
      const assets = await readdir('dist/assets');
      const revision = createHash('sha256').update(assets.sort().join(',')).digest('hex').slice(0, 16);
      const paths = ['./', './index.html', ...assets.map(name => './assets/' + name)];
      await writeFile('dist/sw.js', `
const cacheName = 'fieldquote-${revision}';
const scope = self.registration.scope;
const paths = ${JSON.stringify(paths)}.map(path => new URL(path, scope).href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(paths)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith('fieldquote-') && key !== cacheName)
    .map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  if (request.mode === 'navigate' && new URL(request.url).href.startsWith(scope)) {
    event.respondWith(fetch(request).catch(() => caches.open(cacheName).then(cache => cache.match(paths[1]))));
  } else if (paths.includes(request.url)) {
    event.respondWith(caches.open(cacheName).then(cache => cache.match(request)).then(hit => hit || fetch(request)));
  }
});
`);
    },
  }],
});
