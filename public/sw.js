/* eslint-disable no-restricted-globals */

self.addEventListener('push', function (event) {
    if (!event.data) return;

    try {
        var data = event.data.json();
        var title = data.title || 'Tasman Star Seafood';
        var options = {
            body: data.body || '',
            icon: '/assets/tasman-star-logo.png',
            badge: '/assets/tasman-star-logo.png',
            data: {
                url: data.url || '/',
            },
        };

        event.waitUntil(self.registration.showNotification(title, options));
    } catch (err) {
        console.error('Push event error:', err);
    }
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    var url = (event.notification.data && event.notification.data.url) || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            for (var i = 0; i < clientList.length; i++) {
                var client = clientList[i];
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
