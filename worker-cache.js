const cacheDataName = 'data';

async function onFetchImage(event) {
    console.log(`request.destination 5: ${event.request.destination}`);

    let cachedResponse = null;
    if (event.request.method === 'GET' && event.request.destination === 'image') {
        const cache = await caches.open(cacheDataName);
        cachedResponse = await cache.match(event.request);
    }

    return cachedResponse || fetch(event.request);
}

/*self.addEventListener('fetch', (event) => {
    console.log(`request.destination 5: ${event.request.destination}`);
    if (event.request.destination === 'image') {
        event.respondWith(
            caches.open(cacheName).then((cache) =>
                cache.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;

                    // Если в кэше нет — идём в сеть, кэшируем и возвращаем
                    return fetch(event.request).then((networkResponse) => {
                        const responseClone = networkResponse.clone();
                        cache.put(event.request, responseClone);
                        return networkResponse;
                    });
                })
            )
        );
    }
});*/
