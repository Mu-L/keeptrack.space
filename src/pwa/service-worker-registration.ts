const UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000; // 60 minutes

/**
 * Registers the service worker and sets up update detection.
 * When a new version is detected, a notification banner is shown
 * so the user can choose when to activate the update.
 */
export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    return;
  }

  navigator.serviceWorker
    .register('./serviceWorker.js')
    .then((registration) => {
      // Check for updates periodically — KeepTrack is an SPA with no
      // page navigations, so the browser's automatic check on navigate
      // never fires after initial load.
      setInterval(() => {
        registration.update().catch(() => {
          // Silently ignore update check failures (offline, etc.)
        });
      }, UPDATE_CHECK_INTERVAL_MS);

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;

        if (!newWorker) {
          return;
        }

        newWorker.addEventListener('statechange', () => {
          // Show notification only when the new SW is waiting AND there is
          // an existing controller (i.e. this is an update, not first install).
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateNotification_(registration);
          }
        });
      });
    })
    .catch((err: unknown) => {
      console.warn('Service worker registration failed:', err);
    });

  // After the waiting SW calls skipWaiting(), it becomes the active controller.
  // Reload the page so all resources are served by the new SW.
  // Guard: only reload on controller *change* (update), not on first install.
  // On first visit clients.claim() sets a controller where there was none,
  // which fires controllerchange — without this guard, the page reloads
  // unnecessarily (causing a double splash screen).
  const hadController = !!navigator.serviceWorker.controller;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController) {
      window.location.reload();
    }
  });
}

/**
 * Displays an update notification banner allowing the user to refresh
 * the page to activate a waiting service worker update.
 *
 * @param registration - The service worker registration object.
 */
function showUpdateNotification_(registration: ServiceWorkerRegistration): void {
  // Prevent duplicate banners
  if (document.getElementById('sw-update-banner')) {
    return;
  }

  const banner = document.createElement('div');

  banner.id = 'sw-update-banner';
  banner.setAttribute('role', 'alert');
  banner.style.cssText = [
    'position: fixed',
    'bottom: 70px',
    'left: 50%',
    'transform: translateX(-50%)',
    'z-index: 999999',
    'background: #1f1f1f',
    'color: #e0e0e0',
    'border: 1px solid #dd382f',
    'border-radius: 8px',
    'padding: 12px 20px',
    'display: flex',
    'align-items: center',
    'gap: 16px',
    'font-family: system-ui, -apple-system, sans-serif',
    'font-size: 14px',
    'box-shadow: 0 4px 12px rgba(0,0,0,0.5)',
  ].join(';');

  const message = document.createElement('span');

  message.textContent = 'A new version of KeepTrack is available.';

  const refreshBtn = document.createElement('button');

  refreshBtn.textContent = 'Refresh';
  refreshBtn.style.cssText = [
    'background: #dd382f',
    'color: #fff',
    'border: none',
    'border-radius: 4px',
    'padding: 6px 16px',
    'cursor: pointer',
    'font-size: 14px',
    'font-weight: 600',
    'white-space: nowrap',
  ].join(';');
  refreshBtn.addEventListener('click', () => {
    registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
  });

  const dismissBtn = document.createElement('button');

  dismissBtn.textContent = '\u00D7';
  dismissBtn.setAttribute('aria-label', 'Dismiss update notification');
  dismissBtn.style.cssText = [
    'background: none',
    'border: none',
    'color: #888',
    'cursor: pointer',
    'font-size: 20px',
    'padding: 0 4px',
    'line-height: 1',
  ].join(';');
  dismissBtn.addEventListener('click', () => {
    banner.remove();
  });

  banner.appendChild(message);
  banner.appendChild(refreshBtn);
  banner.appendChild(dismissBtn);
  document.body.appendChild(banner);
}
