import { loadScript } from './aem.js';

const alloyScript = 'https://cdn1.adoberesources.net/alloy/2.35.1/alloy.min.js';
const conciergeScript = 'https://experience.adobe.net/solutions/experience-platform-brand-concierge-web-agent/static-assets/main.js';
let conciergePromise;

function createAlloyQueue() {
  if (window.alloy) return;

  // Adobe Web SDK replaces this queue with its implementation when it loads.
  // eslint-disable-next-line no-underscore-dangle
  window.__alloyNS = window.__alloyNS || [];
  // eslint-disable-next-line no-underscore-dangle
  window.__alloyNS.push('alloy');
  window.alloy = function alloy(...args) {
    return new Promise((resolve, reject) => {
      window.alloy.q.push([resolve, reject, args]);
    });
  };
  window.alloy.q = [];
}

async function initializeBrandConcierge(mount) {
  const codeBasePath = window.hlx?.codeBasePath || '';
  const styleConfigurationUrl = `${codeBasePath.replace(/\/$/, '')}/styleConfigurations.js`;

  try {
    await loadScript(styleConfigurationUrl);
    if (!window.styleConfiguration) {
      throw new Error('styleConfigurations.js did not define window.styleConfiguration');
    }

    createAlloyQueue();
    await loadScript(alloyScript);
    await loadScript(conciergeScript);

    if (typeof window.adobe?.concierge?.bootstrap !== 'function') {
      throw new Error('Brand Concierge bootstrap is unavailable after loading its script');
    }

    await window.alloy('configure', {
      defaultConsent: 'in',
      edgeDomain: 'edge.adobedc.net',
      edgeBasePath: 'ee',
      datastreamId: 'e8e4d719-f452-49b6-b3bc-119ffa82232c',
      orgId: '0E061E2D61F93F260A495FD6@AdobeOrg',
      debugEnabled: false,
      idMigrationEnabled: false,
      thirdPartyCookiesEnabled: false,
      prehidingStyle: '.personalization-container { opacity: 0 !important }',
      conversation: {
        region: 'va7',
      },
    });
    window.alloy('sendEvent', {}).catch((error) => {
      // The Concierge service can reject a local preview origin not registered on the datastream.
      // eslint-disable-next-line no-console
      console.warn('[Buderus Brand Concierge] Initial event was rejected', error);
    });

    await window.adobe.concierge.bootstrap({
      instanceName: 'alloy',
      stylingConfigurations: window.styleConfiguration,
      selector: '#brand-concierge-mount',
      stickySession: false,
    });
  } catch (error) {
    const status = document.createElement('p');
    status.className = 'brand-concierge-error';
    status.setAttribute('role', 'alert');
    status.textContent = 'Der Assistent ist gerade nicht verfügbar. Bitte versuchen Sie es später erneut.';
    mount.replaceChildren(status);
    // eslint-disable-next-line no-console
    console.error('[Buderus Brand Concierge] Initialization failed', error);
  }
}

export default function loadBrandConcierge(mount) {
  if (!conciergePromise) conciergePromise = initializeBrandConcierge(mount);
  return conciergePromise;
}
