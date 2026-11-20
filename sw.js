// 오프라인 실행용: 실행 프로그램 파일을 기기에 캐시 (게임 파일은 여기 없음)
const CACHE = "ed4-v5";
const FILES = ["./", "index.html", "emulators.js", "wdosbox.js", "wdosbox.wasm", "wdosbox-x.js", "wdosbox-x.wasm", "wlibzip.js", "wlibzip.wasm",
  "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];
// 엔진 파일은 거의 안 바뀌니 기기에 있는 것을 먼저 씀 (바뀌면 CACHE 이름을 올림)
const ENGINE = /\/(emulators\.js|wdosbox(-x)?\.(js|wasm)|wlibzip\.(js|wasm))$/;
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
function fromNet(req) {
  return fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  });
}
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin === location.origin && ENGINE.test(url.pathname)) {
    e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fromNet(e.request))
      .catch(() => fromNet(e.request)));
    return;
  }
  // 페이지는 새 버전이 있으면 받아서 갱신하고, 인터넷이 없으면 캐시본 사용
  e.respondWith(fromNet(e.request).catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || Response.error())));
});
