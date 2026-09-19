(() => {
  const measurementId = 'G-KDCX6XW5FF';
  const storageKey = 'heicglide_analytics_consent';
  let analyticsLoaded = false;
  let banner;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

  window.gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });
  window.gtag('set', 'ads_data_redaction', true);

  function currentChoice() {
    try { return localStorage.getItem(storageKey); } catch (_) { return null; }
  }

  function saveChoice(value) {
    try { localStorage.setItem(storageKey, value); } catch (_) {}
  }

  function loadAnalytics() {
    if (analyticsLoaded) return;
    analyticsLoaded = true;
    window.gtag('consent', 'update', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    script.dataset.heicGlideAnalytics = 'true';
    document.head.appendChild(script);
  }

  window.trackHeicGlideEvent = (name, parameters = {}) => {
    if (currentChoice() !== 'accepted' || !analyticsLoaded) return;
    window.gtag('event', name, parameters);
  };

  function hideBanner() {
    if (banner) banner.hidden = true;
  }

  function showBanner() {
    if (banner) {
      banner.hidden = false;
      const heading = banner.querySelector('h2');
      if (heading) heading.focus();
    }
  }

  function choose(value) {
    saveChoice(value);
    if (value === 'accepted') {
      loadAnalytics();
    } else {
      window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }
    hideBanner();
  }

  function buildControls() {
    banner = document.createElement('section');
    banner.className = 'consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'true');
    banner.setAttribute('aria-labelledby', 'consent-title');
    banner.innerHTML = `
      <div class="consent-copy">
        <h2 id="consent-title" tabindex="-1">Your privacy choices</h2>
        <p>We use Google Analytics only with your permission to understand visits and improve HEIC Glide. Your photos and filenames are never sent to analytics. <a href="/privacy.html">Learn more</a>.</p>
      </div>
      <div class="consent-actions">
        <button type="button" class="consent-button secondary" data-consent="declined">Decline</button>
        <button type="button" class="consent-button primary" data-consent="accepted">Accept analytics</button>
      </div>`;
    banner.querySelectorAll('[data-consent]').forEach((button) => {
      button.addEventListener('click', () => choose(button.dataset.consent));
    });
    document.body.appendChild(banner);

    const privacyButton = document.createElement('button');
    privacyButton.type = 'button';
    privacyButton.className = 'privacy-choice-button';
    privacyButton.textContent = 'Privacy choices';
    privacyButton.addEventListener('click', showBanner);
    const footerNav = document.querySelector('.site-footer nav');
    if (footerNav) footerNav.appendChild(privacyButton);
    else document.body.appendChild(privacyButton);

    const choice = currentChoice();
    if (choice === 'accepted') {
      hideBanner();
      loadAnalytics();
    } else if (choice === 'declined') {
      hideBanner();
    } else {
      showBanner();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', buildControls, { once: true });
  } else {
    buildControls();
  }
})();
