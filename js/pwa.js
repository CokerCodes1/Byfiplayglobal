/**
 * ByfiPlay PWA Module — byfiplayglobal.com.ng
 * ----------------------------------------------
 * 1. Registers service worker at /service-worker.js (scope: /)
 * 2. Custom install banner (beforeinstallprompt + iOS fallback)
 * 3. "New version available" update notification with one-click refresh
 */

(function () {
  'use strict';

  var deferredInstallPrompt = null;
  var installBannerEl = null;
  var updateBannerEl = null;
  var waitingWorker = null;

  var DISMISS_KEY = 'byfiplay-pwa-install-dismissed';
  var DISMISS_DAYS = 7;

  /* ---------- Service Worker Registration ---------- */

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('/service-worker.js', { scope: '/' })
        .then(function (registration) {
          listenForUpdates(registration);

          /* Check for an already-waiting worker on page load */
          if (registration.waiting && navigator.serviceWorker.controller) {
            waitingWorker = registration.waiting;
            showUpdateBanner();
          }

          registration.addEventListener('updatefound', function () {
            var newWorker = registration.installing;
            if (!newWorker) {
              return;
            }

            newWorker.addEventListener('statechange', function () {
              if (
                newWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                waitingWorker = newWorker;
                showUpdateBanner();
              }
            });
          });
        })
        .catch(function (err) {
          console.warn('[PWA] Service worker registration failed:', err);
        });

      /* Reload once the new service worker takes control */
      var refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', function () {
        if (refreshing) {
          return;
        }
        refreshing = true;
        window.location.reload();
      });
    });
  }

  /* ---------- Update Banner ---------- */

  function showUpdateBanner() {
    if (updateBannerEl) {
      updateBannerEl.classList.add('is-visible');
      return;
    }

    updateBannerEl = document.createElement('aside');
    updateBannerEl.className = 'pwa-update-banner is-visible';
    updateBannerEl.setAttribute('role', 'alert');
    updateBannerEl.setAttribute('aria-live', 'polite');
    updateBannerEl.innerHTML =
      '<div class="pwa-update-banner__content">' +
      '<p class="pwa-update-banner__title">New Version Available</p>' +
      '<p class="pwa-update-banner__text">An updated version of ByfiPlay is ready.</p>' +
      '</div>' +
      '<div class="pwa-update-banner__actions">' +
      '<button type="button" class="pwa-update-banner__btn" id="pwa-update-btn">Refresh</button>' +
      '<button type="button" class="pwa-update-banner__btn pwa-update-banner__btn--dismiss" id="pwa-update-dismiss" aria-label="Dismiss">&times;</button>' +
      '</div>';

    document.body.appendChild(updateBannerEl);

    document.getElementById('pwa-update-btn').addEventListener('click', applyUpdate);
    document.getElementById('pwa-update-dismiss').addEventListener('click', function () {
      updateBannerEl.classList.remove('is-visible');
    });
  }

  function applyUpdate() {
    if (!waitingWorker) {
      window.location.reload();
      return;
    }

    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  }

  function listenForUpdates(registration) {
    /* Re-check every hour while the tab is open */
    setInterval(function () {
      registration.update();
    }, 60 * 60 * 1000);
  }

  /* ---------- Install Banner ---------- */

  function wasRecentlyDismissed() {
    try {
      var dismissedAt = localStorage.getItem(DISMISS_KEY);
      if (!dismissedAt) {
        return false;
      }
      var elapsed = Date.now() - parseInt(dismissedAt, 10);
      return elapsed < DISMISS_DAYS * 24 * 60 * 60 * 1000;
    } catch (e) {
      return false;
    }
  }

  function dismissInstallBanner() {
    if (installBannerEl) {
      installBannerEl.classList.remove('is-visible');
    }
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch (e) {
      /* storage unavailable */
    }
  }

  function createInstallBanner(options) {
    if (installBannerEl || wasRecentlyDismissed()) {
      return;
    }

    installBannerEl = document.createElement('aside');
    installBannerEl.className = 'pwa-install-banner';
    installBannerEl.setAttribute('role', 'dialog');
    installBannerEl.setAttribute('aria-label', 'Install ByfiPlay app');

    installBannerEl.innerHTML =
      '<img class="pwa-install-banner__icon" src="/img/IMG-20251201-WA0006.jpg" alt="" width="44" height="44">' +
      '<div class="pwa-install-banner__content">' +
      '<p class="pwa-install-banner__title">Install ByfiPlay</p>' +
      '<p class="pwa-install-banner__text">' +
      (options.message ||
        'Add ByfiPlay to your home screen for quick access.') +
      '</p>' +
      '</div>' +
      '<div class="pwa-install-banner__actions">' +
      (options.showInstallButton
        ? '<button type="button" class="pwa-install-banner__btn pwa-install-banner__btn--install" id="pwa-install-btn">Install</button>'
        : '') +
      '<button type="button" class="pwa-install-banner__btn pwa-install-banner__btn--dismiss" id="pwa-dismiss-btn" aria-label="Dismiss">&times;</button>' +
      '</div>';

    document.body.appendChild(installBannerEl);

    document.getElementById('pwa-dismiss-btn').addEventListener('click', dismissInstallBanner);

    if (options.showInstallButton) {
      document.getElementById('pwa-install-btn').addEventListener('click', handleInstallClick);
    }

    requestAnimationFrame(function () {
      installBannerEl.classList.add('is-visible');
    });
  }

  function handleInstallClick() {
    if (!deferredInstallPrompt) {
      return;
    }

    deferredInstallPrompt.prompt();

    deferredInstallPrompt.userChoice.then(function (choice) {
      if (choice.outcome === 'accepted') {
        dismissInstallBanner();
      }
      deferredInstallPrompt = null;
    });
  }

  /* ---------- Platform Detection ---------- */

  function isIosSafari() {
    var ua = window.navigator.userAgent;
    var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome/.test(ua);
    return isIOS && isSafari;
  }

  function isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  /* ---------- Install Prompt Init ---------- */

  function initInstallPrompt() {
    if (isStandalone()) {
      return;
    }

    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      deferredInstallPrompt = event;
      createInstallBanner({
        showInstallButton: true,
        message:
          'Install ByfiPlay on your device for a fast, app-like experience.'
      });
    });

    window.addEventListener('appinstalled', function () {
      deferredInstallPrompt = null;
      dismissInstallBanner();
    });

    if (isIosSafari()) {
      createInstallBanner({
        showInstallButton: false,
        message:
          'Tap the Share button, then choose "Add to Home Screen" to install ByfiPlay.'
      });
    }
  }

  /* ---------- Boot ---------- */

  registerServiceWorker();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInstallPrompt);
  } else {
    initInstallPrompt();
  }
})();
