import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

const isDesktop = window.matchMedia('(min-width: 900px)');

function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-drop > button').forEach((button) => {
    button.setAttribute('aria-expanded', `${expanded}`);
  });
}

function setMenuState(nav, sections, hamburger, expanded) {
  const open = !isDesktop.matches && expanded;
  if (isDesktop.matches) nav.removeAttribute('aria-expanded');
  else nav.setAttribute('aria-expanded', `${open}`);
  document.body.classList.toggle('nav-open', open);
  document.body.style.overflowY = open ? 'hidden' : '';
  if (hamburger) hamburger.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
  toggleAllNavSections(sections);
}

function closeOnEscape(event) {
  if (event.key !== 'Escape') return;
  const nav = document.getElementById('nav');
  const sections = nav?.querySelector('.nav-sections');
  const expanded = sections?.querySelector('.nav-drop > button[aria-expanded="true"]');
  if (expanded) {
    toggleAllNavSections(sections);
    expanded.focus();
  } else if (!isDesktop.matches && nav?.getAttribute('aria-expanded') === 'true') {
    const hamburger = nav.querySelector('.nav-hamburger button');
    setMenuState(nav, sections, hamburger, false);
    hamburger?.focus();
  }
}

function closeOnFocusLost(event) {
  const nav = event.currentTarget;
  if (event.relatedTarget && nav.contains(event.relatedTarget)) return;
  const sections = nav.querySelector('.nav-sections');
  if (sections?.querySelector('.nav-drop > button[aria-expanded="true"]')) toggleAllNavSections(sections);
  if (!isDesktop.matches) {
    setMenuState(nav, sections, nav.querySelector('.nav-hamburger button'), false);
  }
}

function updateScrolledHeader(block) {
  const scrolled = isDesktop.matches && window.scrollY > 96;
  block.classList.toggle('is-scrolled', scrolled);
  document.body.classList.toggle('nav-is-scrolled', scrolled);
}

function createSearchTools(tools) {
  const wrapper = tools.querySelector('.default-content-wrapper');
  if (!wrapper) return;
  wrapper.replaceChildren();

  const utilityLinks = [...tools.closest('nav').querySelectorAll('.nav-utility a')];
  const mobileActions = document.createElement('div');
  mobileActions.className = 'nav-mobile-actions';
  mobileActions.setAttribute('aria-label', 'Schnellzugriff');
  const quickActions = [
    {
      label: 'Angebot anfordern',
      href: utilityLinks[0]?.href || 'https://www.buderus.de/de/angebot-anfordern',
      icon: '<path d="M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 15h6M9 18h4" />',
    },
    {
      label: 'Kontaktformular',
      href: 'https://www.buderus.de/de/services-tools/kontaktformular-18800',
      icon: '<path d="M5 4h14v13H9l-4 3zM8 8h8M8 11h8M8 14h5" />',
    },
    {
      label: 'Beratungshotline',
      href: 'tel:08000203000',
      icon: '<path d="M7 3h3l2 5-2 2a14 14 0 0 0 4 4l2-2 5 2v3a2 2 0 0 1-2 2C11 18 6 13 5 5a2 2 0 0 1 2-2z" />',
    },
    {
      label: 'Fachbetriebe in Ihrer Nähe',
      href: utilityLinks.find((link) => link.pathname.includes('/fachbetriebe'))?.href || 'https://www.buderus.de/de/fachbetriebe',
      icon: '<path d="M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12z" /><circle cx="12" cy="9" r="2.4" />',
    },
  ];
  quickActions.forEach(({ label, href, icon }) => {
    const action = document.createElement('a');
    action.className = 'nav-mobile-action';
    action.href = href;
    action.setAttribute('aria-label', label);
    action.title = label;
    action.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${icon}</svg>`;
    mobileActions.append(action);
  });

  const askLink = document.createElement('a');
  askLink.className = 'nav-ask';
  askLink.href = 'https://www.buderus.de/de#askBuderus';
  askLink.textContent = 'AskBuderus';
  wrapper.append(askLink);

  const search = document.createElement('details');
  search.className = 'nav-search';
  const summary = document.createElement('summary');
  summary.textContent = 'Suche';
  const form = document.createElement('form');
  form.action = 'https://www.buderus.de/de/suche';
  form.method = 'get';
  const label = document.createElement('label');
  label.className = 'sr-only';
  label.htmlFor = 'buderus-search-query';
  label.textContent = 'Suchbegriff';
  const input = document.createElement('input');
  input.id = 'buderus-search-query';
  input.name = 'query';
  input.type = 'search';
  input.placeholder = 'Suchen';
  input.autocomplete = 'off';
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'nav-search-submit';
  submit.textContent = 'Finden';
  form.append(label, input, submit);
  search.append(summary, form);
  wrapper.append(mobileActions, askLink, search);
}

function createAllTopicsPanel(sections) {
  const firstItem = sections.querySelector('.default-content-wrapper > ul > li');
  const firstToggle = firstItem?.querySelector(':scope > .nav-dropdown-toggle');
  const firstList = firstItem?.querySelector(':scope > .nav-dropdown-list');
  if (!firstToggle || !firstList) return;

  const panel = document.createElement('div');
  panel.id = firstList.id;
  panel.className = 'nav-dropdown-list nav-mega-panel';
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-label', 'Alle Themen');

  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'nav-mega-close';
  close.setAttribute('aria-label', 'Menü schließen');
  close.textContent = '×';
  close.addEventListener('click', () => {
    toggleAllNavSections(sections);
    firstToggle.focus();
  });

  const categories = document.createElement('ul');
  categories.className = 'nav-mega-categories';
  categories.append(...firstList.children);

  const sidebar = document.createElement('div');
  sidebar.className = 'nav-mega-sidebar';
  sidebar.setAttribute('role', 'navigation');
  sidebar.setAttribute('aria-label', 'Themenbereiche');
  sidebar.append(categories);

  const content = document.createElement('div');
  content.className = 'nav-mega-content';
  [...sections.querySelectorAll('.default-content-wrapper > ul > li')].slice(1).forEach((item) => {
    const toggle = item.querySelector(':scope > .nav-dropdown-toggle');
    const list = item.querySelector(':scope > .nav-dropdown-list');
    if (!toggle || !list) return;

    const group = document.createElement('section');
    group.className = 'nav-mega-group';
    const heading = document.createElement('h2');
    heading.textContent = toggle.textContent.trim();
    const links = list.cloneNode(true);
    links.className = 'nav-mega-links';
    links.removeAttribute('id');
    links.querySelectorAll('[id]').forEach((element) => element.removeAttribute('id'));
    group.append(heading, links);
    content.append(group);
  });

  panel.append(close, sidebar, content);
  firstList.replaceWith(panel);
}

/**
 * Loads and decorates the Buderus navigation fragment.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Hauptnavigation');
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  ['brand', 'utility', 'sections', 'tools'].forEach((name, index) => {
    const section = nav.children[index];
    if (section) section.classList.add(`nav-${name}`);
  });

  const brand = nav.querySelector('.nav-brand .default-content-wrapper');
  if (brand) {
    const home = document.createElement('a');
    home.href = '/';
    home.className = 'nav-logo';
    home.setAttribute('aria-label', 'Buderus – Startseite');
    const logo = document.createElement('img');
    logo.src = `${window.hlx.codeBasePath}/icons/buderus.svg`;
    logo.alt = 'Buderus';
    logo.width = 143;
    logo.height = 29;
    home.append(logo);
    brand.replaceChildren(home);
  }

  const sections = nav.querySelector('.nav-sections');
  if (sections) {
    sections.querySelectorAll('.default-content-wrapper > ul > li').forEach((item, index) => {
      const subList = item.querySelector(':scope > ul');
      if (!subList) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'nav-dropdown-toggle';
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', `buderus-menu-${index + 1}`);
      subList.id = `buderus-menu-${index + 1}`;
      subList.classList.add('nav-dropdown-list');
      subList.querySelectorAll('li > ul').forEach((nestedList) => {
        nestedList.classList.add('nav-nested-list');
      });
      [...item.childNodes].forEach((node) => {
        if (node !== subList) button.append(node);
      });
      item.prepend(button);
      item.classList.add('nav-drop');
      button.addEventListener('click', () => {
        const willExpand = button.getAttribute('aria-expanded') !== 'true';
        toggleAllNavSections(sections);
        button.setAttribute('aria-expanded', `${willExpand}`);
      });
    });
    createAllTopicsPanel(sections);
  }

  const utilityCta = nav.querySelector('.nav-utility ul:first-child li:first-child a');
  utilityCta?.classList.add('nav-utility-cta');

  const tools = nav.querySelector('.nav-tools');
  if (tools) createSearchTools(tools);

  const hamburgerWrapper = document.createElement('div');
  hamburgerWrapper.className = 'nav-hamburger';
  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger-toggle';
  hamburger.setAttribute('aria-controls', 'nav');
  hamburger.setAttribute('aria-label', 'Menü öffnen');
  hamburger.innerHTML = '<span class="nav-hamburger-icon" aria-hidden="true"></span>';
  hamburger.addEventListener('click', () => {
    setMenuState(nav, sections, hamburger, nav.getAttribute('aria-expanded') !== 'true');
  });
  hamburgerWrapper.append(hamburger);
  nav.prepend(hamburgerWrapper);

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  const breadcrumb = document.createElement('div');
  breadcrumb.className = 'nav-breadcrumb';
  const currentPage = document.createElement('span');
  currentPage.textContent = 'Startseite';
  breadcrumb.append(currentPage);
  block.append(navWrapper, breadcrumb);

  setMenuState(nav, sections, hamburger, false);
  window.addEventListener('keydown', closeOnEscape);
  nav.addEventListener('focusout', closeOnFocusLost);
  window.addEventListener('scroll', () => updateScrolledHeader(block), { passive: true });
  isDesktop.addEventListener('change', () => {
    setMenuState(nav, sections, hamburger, false);
    updateScrolledHeader(block);
  });
  updateScrolledHeader(block);
}
