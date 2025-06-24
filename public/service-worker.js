self.addEventListener('install', (event) => {
    self.skipWaiting();
  });
  
  self.addEventListener('fetch', (event) => {
    // Just let requests go through for now
  });
  
  
self.addEventListener("push", function (event) {
    const data = event.data?.json() || {};
    const title = data.title || "Pool Update";
    const options = {
      body: data.body || "A new change has been made.",
      icon: "/icon-192.png",
      badge: "/icon-192.png"
    };
    event.waitUntil(self.registration.showNotification(title, options));
  });