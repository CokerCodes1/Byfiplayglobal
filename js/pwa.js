/**
 * ByfiPlay PWA Module — byfiplayglobal.com.ng
 * ----------------------------------------------
 * 1. Registers service worker at /service-worker.js (scope: /)
 * 2. Navbar install button (beforeinstallprompt + iOS fallback)
 * 3. "New version available" update notification with one-click refresh
 */

(function () {
  'use strict';

  var deferredInstallPrompt = null;
  var updateBannerEl = null;
  var waitingWorker = null;

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
    setInterval(function () {
      registration.update();
    }, 60 * 60 * 1000);
  }

  /* ---------- Navbar Install Button ---------- */

  function showNavInstallButtons() {
    var navBtn = document.getElementById('pwa-nav-install-btn');
    var mobileWrap = document.getElementById('pwa-nav-install-mobile-wrap');

    if (navBtn) {
      navBtn.hidden = false;
    }
    if (mobileWrap) {
      mobileWrap.hidden = false;
    }
  }

  function hideNavInstallButtons() {
    var navBtn = document.getElementById('pwa-nav-install-btn');
    var mobileWrap = document.getElementById('pwa-nav-install-mobile-wrap');

    if (navBtn) {
      navBtn.hidden = true;
    }
    if (mobileWrap) {
      mobileWrap.hidden = true;
    }
  }

  function initNavInstallButtons() {
    var navBtn = document.getElementById('pwa-nav-install-btn');
    var mobileBtn = document.getElementById('pwa-nav-install-btn-mobile');

    function onInstallClick() {
      if (deferredInstallPrompt) {
        handleInstallClick();
        return;
      }

      if (isIosSafari()) {
        showIosInstallInstructions();
      }
    }

    if (navBtn) {
      navBtn.addEventListener('click', onInstallClick);
    }
    if (mobileBtn) {
      mobileBtn.addEventListener('click', onInstallClick);
    }
  }

  function handleInstallClick() {
    if (!deferredInstallPrompt) {
      return;
    }

    deferredInstallPrompt.prompt();

    deferredInstallPrompt.userChoice.then(function (choice) {
      if (choice.outcome === 'accepted') {
        hideNavInstallButtons();
      }
      deferredInstallPrompt = null;
    });
  }

  function showIosInstallInstructions() {
    window.alert(
      'To install ByfiPlay on your iPhone or iPad:\n\n' +
        '1. Tap the Share button (square with arrow)\n' +
        '2. Scroll down and tap "Add to Home Screen"\n' +
        '3. Tap "Add" to confirm'
    );
  }

  /* ---------- Platform Detection ---------- */

  function isIosSafari() {
    var ua = window.navigator.userAgent;
    var isIOS =
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    var isSafari =
      /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome/.test(ua);
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
      hideNavInstallButtons();
      return;
    }

    window.addEventListener('beforeinstallprompt', function (event) {
      event.preventDefault();
      deferredInstallPrompt = event;
      showNavInstallButtons();
    });

    window.addEventListener('appinstalled', function () {
      deferredInstallPrompt = null;
      hideNavInstallButtons();
    });

    if (isIosSafari()) {
      showNavInstallButtons();
    }
  }

  /* ---------- Boot ---------- */

  registerServiceWorker();
  initNavInstallButtons();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInstallPrompt);
  } else {
    initInstallPrompt();
  }
})();
