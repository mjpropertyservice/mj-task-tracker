/* MJ TRACK — Service Worker (ทำให้ติดตั้งเป็นแอปได้)
   - หน้าเว็บ: ดึงจากเน็ตก่อนเสมอ (ได้รุ่นล่าสุดทุกครั้ง) ถ้าออฟไลน์ใช้ฉบับที่เก็บไว้
   - ไอคอน/ไฟล์ข้อมูลแอป: ใช้ฉบับที่เก็บไว้
   - ข้อมูลจาก Supabase และไลบรารีภายนอก: ไม่ยุ่ง (ไม่เก็บข้อมูลงานไว้ในเครื่อง)
   แก้ไฟล์นี้เมื่อไร ให้เปลี่ยนเลข VERSION ด้วย */
const VERSION = "v3";
const CACHE = "mj-tracker-" + VERSION;
const CORE = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png", "./brand-lockup.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("mj-tracker-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (req.mode === "navigate" || req.destination === "document") {
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); }
      return res;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
});
