const CACHE_NAME = 'qace-v1';
const URLS = [
  '/istqb-quiz/',
  '/istqb-quiz/index.html'
];

// 설치: 핵심 파일 캐싱
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(URLS);
    })
  );
  self.skipWaiting();
});

// 활성화: 구버전 캐시 정리
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// 네트워크 우선 → 실패 시 캐시 사용 (항상 최신 콘텐츠 유지)
self.addEventListener('fetch', function(e) {
  e.respondWith(
    fetch(e.request)
      .then(function(response) {
        // 성공 시 캐시 업데이트
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(e.request, clone);
        });
        return response;
      })
      .catch(function() {
        // 네트워크 실패 시 캐시에서 응답
        return caches.match(e.request);
      })
  );
});
