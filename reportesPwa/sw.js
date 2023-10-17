const STATIC = "staticv1";
const STATIC_LIMIT = 15;
const INMUTABLE = "inmutablev1";
const DYNAMIC = "dynamicv1";
const DYNAMIC_LIMIT = 30;
//todos los recursos propios de la aplicacion
const APP_SHELL = [
  "/",
  "/index.html",
  "css/styles.css",
  "img/delta.jpg",
  "js/app.js",
];

const OFFLINE_URL = ["/pages/offline.html"];
//TODOS AQUELLOS RECURSOS QUE NO VAN A CAMBIAR
const APP_SHELL_INMUTABLE = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
];

self.addEventListener("install", (event) => {
  // event.skipWaiting();
  const staticCache = caches.open(STATIC).then((cache) => {
    cache.addAll(APP_SHELL);
  });
  const inmutableCache = caches.open(INMUTABLE).then((cache) => {
    cache.addAll(APP_SHELL_INMUTABLE);
  });
  const offlineCache = caches.open(OFFLINE_URL).then((cache) => {
    cache.addAll(OFFLINE_URL);
  });

  event.waitUntil(Promise.all([staticCache, offlineCache, inmutableCache]));
});

self.addEventListener("activate", (event) => {
  console.log("activado");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request).catch(() => {}));

  // 1. cache only
  // event.respondWith(caches.match(event.request));
  //2. cache with network fallback
  /*const source = caches.match(event.request).then((response) => {
    if (response) return response;
    return fetch(event.request).then((newResponse) => {
      caches.open(DYNAMIC).then((cache) => {
        cache.put(event.request, newResponse);
      });
      return newResponse.clone();
    });
  });
  event.respondWith(source);*/
  //3. network with cache fallback
  const source = fetch(event.request)
    .then((res) => {
      if (!res) {
        return caches.match(OFFLINE_URL);

        //revisar si el recurso ya existe en cache
        caches.open(DYNAMIC).then((cache) => {
          cache.put(event.request, res);
        });
        return res.clone();
      } else {
        return caches.match(OFFLINE_URL);
      }
    })
    .catch((err) => {
      return caches.match(event.request);
    });
  event.respondWith(source);
  //4. cache with network update
  // rendimiento critico, si es bajo usar esta estrategia, desventaja, toda la aplicacion esta un paso atras
  /*if (e.request.url.includes("bootstrap"))
    return e.respondWith(caches.match(e.request));
  const source = caches.open(STATIC).then((cache) => {
    fetch(e.request).then((res) => {
      cache.put(e.request, res);
    });
    return cache.match(e.request);
  });
  e.respondWith(source);*/
  //5 Cache and Network Race
  /*const source = new Promise((resolve, reject) => {
    let reject = false;
    const failsOnce = () => {
      if (reject) {
        if (/\.(png|jpg)/i.test(event.request.url)) {
          resolve(caches.match("/img/not-found.png"));
        } else {
          throw Error("Source not found");
        }
      } else {
        reject = true;
      }
    };
    fetch(event.request)
      .then((res) => {
        res.ok ? resolve(res) : failsOnce();
      })
      .catch(failsOnce);
    caches.match(event.request).then((cacheRes) => {
      cacheRes ? resolve(cacheRes) : failsOnce();
    });
  });
  event.respondWith(source);*/
});

self.addEventListener("push", (event) => {
  console.log("PUSH NOTIFICATION");
});

self.addEventListener("sync", (event) => {
  console.log("SYNC EVENT");
});
