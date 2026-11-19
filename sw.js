// 오프라인 실행용: 실행 프로그램 파일을 기기에 캐시 (게임 파일은 여기 없음)
const CACHE = "ed4-v1";
const FILES = ["./", "index.html", "emulators.js", "wdosbox.js", "wdosbox.wasm", "wlibzip.js", "wlibzip.wasm",
  "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // 새 버전이 있으면 받아서 갱신하고, 인터넷이 없으면 캐시본 사용
  e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true })));
});
