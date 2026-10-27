let consentGranted = false;
let conciergePromise;

function setStatus(mount, message) {
  const status = document.createElement('p');
  status.className = 'brand-concierge-pending';
  status.setAttribute('role', 'status');
  status.textContent = message;
  mount.replaceChildren(status);
}

function createBrandConciergeShell() {
  const root = document.createElement('div');
  root.id = 'brand-concierge-root';
  root.className = 'brand-concierge-root';

  const launcher = document.createElement('button');
  launcher.id = 'brand-concierge-launcher';
  launcher.type = 'button';
  launcher.className = 'brand-concierge-launcher';
  launcher.setAttribute('aria-label', 'Buderus Chat öffnen');
  launcher.setAttribute('aria-controls', 'brand-concierge-panel');
  launcher.setAttribute('aria-expanded', 'false');
  launcher.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 5.5h16v11H9l-5 3v-14Z" /></svg>';

  const panel = document.createElement('div');
  panel.id = 'brand-concierge-panel';
  panel.className = 'brand-concierge-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Buderus digitaler Assistent');
  panel.setAttribute('aria-modal', 'false');
  panel.hidden = true;

  const close = document.createElement('button');
  close.id = 'brand-concierge-close';
  close.type = 'button';
  close.className = 'brand-concierge-close';
  close.setAttribute('aria-label', 'Chat schließen');
  close.textContent = '×';

  const mount = document.createElement('div');
  mount.id = 'brand-concierge-mount';
  mount.className = 'brand-concierge-mount';
  mount.setAttribute('role', 'region');
  mount.setAttribute('aria-label', 'Buderus digitaler Assistent');
  setStatus(mount, 'Der Buderus Assistent wird derzeit eingerichtet. Bitte versuchen Sie es später erneut.');

  panel.append(close, mount);
  root.append(launcher, panel);
  document.body.append(root);

  const loadAssistant = async () => {
    if (!consentGranted) {
      setStatus(mount, 'Der Buderus Assistent wird derzeit eingerichtet. Bitte versuchen Sie es später erneut.');
      return;
    }
    if (!conciergePromise) {
      setStatus(mount, 'Der Assistent wird geladen …');
      conciergePromise = import('./consented.js')
        .then(({ default: loadBrandConcierge }) => loadBrandConcierge(mount))
        .catch(() => {
          setStatus(mount, 'Der Assistent ist gerade nicht verfügbar. Bitte versuchen Sie es später erneut.');
        });
    }
    await conciergePromise;
  };

  const openPanel = () => {
    panel.hidden = false;
    root.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    close.focus();
    loadAssistant();
  };

  const closePanel = () => {
    root.classList.remove('is-open');
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.focus();
  };

  launcher.addEventListener('click', openPanel);
  close.addEventListener('click', closePanel);
  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.classList.contains('is-open')) closePanel();
  });

  window.addEventListener('consent.update', (event) => {
    consentGranted = event.detail?.consented === true;
    if (consentGranted && root.classList.contains('is-open')) loadAssistant();
    if (!consentGranted && root.classList.contains('is-open')) {
      conciergePromise = undefined;
      setStatus(mount, 'Der Buderus Assistent wird derzeit eingerichtet. Bitte versuchen Sie es später erneut.');
    }
  });
}

createBrandConciergeShell();
