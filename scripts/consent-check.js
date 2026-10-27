/**
 * Fail-closed placeholder until the site's real CMP is integrated.
 * Never infer consent from a query string or other URL-controlled value.
 * @returns {boolean} false until a CMP supplies an explicit consent decision
 */
function hasConsent() {
  return false;
}

/**
 * Notifies the local launcher; it loads no third-party code until the real CMP
 * replaces this fail-closed placeholder and explicitly grants consent.
 */
function onConsentUpdate() {
  const consented = hasConsent();
  window.dispatchEvent(new CustomEvent('consent.update', { detail: { consented } }));
}

onConsentUpdate();
