/* ============================================
   sw.js — Service Worker (PWA 离线缓存)
   ============================================ */

const CACHE_NAME = "mind-journal-v0.23";
const STATIC_ASSETS = [
    "./",
    "./index.html",
    "./css/style.css",
    "./js/symptom-config.js",
    "./js/medication-db.js",
    "./js/ambient-sounds.js",
    "./js/db.js",
    "./js/medication.js",
    "./js/report.js",
    "./js/scales.js",
    "./js/export-csv.js",
    "./js/error-handler.js",
    "./js/onboarding.js",
    "./js/app.js",
    "./js/charts.js",
    "./js/music.js",
    "./js/contacts.js",
    "./js/sync.js",
    "./manifest.json",
    "./icons/icon.svg",
    "./js/vendor/chart.umd.min.js",
    "./js/vendor/dexie.min.js",
    "./js/vendor/html2pdf.bundle.min.js",
    "./js/vendor/jszip.min.js"
];

// 安装：预缓存静态资源
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn("SW: 部分资源缓存失败", err);
            });
        })
    );
    self.skipWaiting();
});

// 激活：清理旧缓存
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((names) => {
            return Promise.all(
                names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
            );
        })
    );
    self.clients.claim();
});

// 请求拦截：缓存优先策略
self.addEventListener("fetch", (event) => {
    // 跳过非 GET 请求
    if (event.request.method !== "GET") return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            // 缓存命中直接返回
            if (cached) return cached;

            // 否则走网络，成功后缓存
            return fetch(event.request).then((response) => {
                if (!response || response.status !== 200 || response.type !== "basic") {
                    return response;
                }
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, clone);
                });
                return response;
            }).catch(() => {
                // 网络失败时返回离线页面（对于HTML请求）
                if (event.request.headers.get("accept")?.includes("text/html")) {
                    return caches.match("./index.html");
                }
                return new Response("离线模式", { status: 503 });
            });
        })
    );
});
