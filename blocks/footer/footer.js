import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-content';
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  // Group authored heading/list pairs into responsive footer columns.
  const content = footer.querySelector('.section .default-content-wrapper');
  if (content) {
    const items = [];
    let group;
    [...content.children].forEach((item) => {
      if (/^H[2-4]$/.test(item.tagName)) {
        group = document.createElement('div');
        group.className = 'footer-group';
        group.append(item);
        items.push(group);
      } else if (group) {
        group.append(item);
        if (item.matches('ul, ol')) group = null;
      } else {
        items.push(item);
      }
    });
    content.replaceChildren(...items);

    const topLink = content.querySelector('p a[href="#top"]');
    if (topLink) {
      const actions = document.createElement('div');
      actions.className = 'footer-actions';

      const printLink = document.createElement('a');
      printLink.className = 'footer-print-link';
      printLink.href = '#';
      printLink.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 8V3h10v5M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z" /><path d="M17 11h1" /></svg><span>Diese Seite drucken</span>';
      printLink.addEventListener('click', (event) => {
        event.preventDefault();
        window.print();
      });

      topLink.classList.add('footer-back-to-top');
      topLink.closest('p')?.remove();
      actions.append(printLink, topLink);
      content.parentElement.insertBefore(actions, content);
    }

    content.querySelectorAll('.footer-group').forEach((footerGroup) => {
      if (footerGroup.querySelector('h2, h3, h4')?.textContent.trim() === 'Folgen Sie uns auf') {
        footerGroup.classList.add('footer-social');
        const socialIcons = {
          Facebook: '<path d="M14 21v-8h2.7l.4-3H14V8.1c0-.9.3-1.5 1.4-1.5h1.8V4c-.3 0-1.3-.1-2.5-.1-2.5 0-4 1.5-4 4.2V10H8v3h2.7v8H14z" />',
          YouTube: '<rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="m10 9 5 3-5 3z" />',
          LinkedIn: '<path d="M4 9h3v11H4zM5.5 4.5a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4ZM10 9h3v1.5c.6-1.1 1.6-1.8 3.2-1.8 3 0 3.8 1.8 3.8 4.6V20h-3v-5.8c0-1.4 0-2.6-1.7-2.6s-2 1.2-2 2.5V20h-3z" />',
          Instagram: '<rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" />',
          TikTok: '<path d="M14 3v11.1a3.5 3.5 0 1 1-3-3.5v3.2a.7.7 0 1 0 0 1.4c.5 0 .8-.4.8-.9V3H14c.3 2.2 1.5 3.7 4 4.1v3.2A8 8 0 0 1 14 8.7" />',
        };
        footerGroup.querySelectorAll('a').forEach((link) => {
          const path = socialIcons[link.textContent.trim()];
          if (!path) return;
          const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          icon.setAttribute('viewBox', '0 0 24 24');
          icon.setAttribute('aria-hidden', 'true');
          icon.setAttribute('focusable', 'false');
          icon.innerHTML = path;
          link.prepend(icon);
        });
      }
    });
  }

  block.append(footer);
}
