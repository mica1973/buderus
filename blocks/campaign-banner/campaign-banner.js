const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

function buildButton(label, className, handler) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  button.addEventListener('click', handler);
  return button;
}

function getSlideData(row, index) {
  const image = row.querySelector('picture img, img');
  const imageCell = image?.closest('picture')?.parentElement || image?.parentElement;
  const contentCell = [...row.children].find((cell) => cell !== imageCell) || row;
  const heading = contentCell.querySelector('h2, h3, h4, strong');
  const link = contentCell.querySelector('a[href]');
  const paragraphs = [...contentCell.querySelectorAll('p')];
  const description = paragraphs.find((paragraph) => !paragraph.contains(link));
  return {
    description,
    heading,
    image,
    index,
    link,
  };
}

/**
 * Decorates a two-cell-per-row Buderus campaign banner block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children].filter((row) => (
    row.querySelector('h2, h3, h4, a[href], img, picture')
  ));
  const slidesData = rows.map(getSlideData).filter((slide) => (
    slide.heading || slide.image || slide.link
  ));
  if (!slidesData.length) return;

  const carousel = document.createElement('div');
  carousel.className = 'campaign-banner-carousel';
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-roledescription', 'Karussell');
  carousel.setAttribute('aria-label', 'Buderus Highlights');

  const slides = slidesData.map((data, index) => {
    const slide = document.createElement('article');
    slide.className = 'campaign-banner-slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'Meldung');
    slide.setAttribute('aria-label', `${index + 1} von ${slidesData.length}`);
    slide.hidden = index !== 0;

    if (data.image) {
      const originalPicture = data.image.closest('picture');
      const picture = originalPicture ? originalPicture.cloneNode(true) : document.createElement('picture');
      picture.className = 'campaign-banner-picture';
      let image = picture.querySelector('img');
      if (!image) {
        image = data.image.cloneNode(true);
        picture.append(image);
      }
      if (!image.alt || /^[\w-]+$/.test(image.alt)) {
        image.alt = data.heading?.textContent.trim() || '';
      }
      image.loading = index === 0 ? 'eager' : 'lazy';
      image.decoding = 'async';
      if (index === 0) image.fetchPriority = 'high';
      slide.append(picture);
    }

    const shade = document.createElement('div');
    shade.className = 'campaign-banner-shade';
    shade.setAttribute('aria-hidden', 'true');
    slide.append(shade);

    const content = document.createElement('div');
    content.className = 'campaign-banner-content';
    const title = document.createElement('h2');
    title.textContent = data.heading?.textContent.trim() || '';
    content.append(title);
    if (data.description?.textContent.trim()) {
      const description = document.createElement('p');
      description.textContent = data.description.textContent.trim();
      content.append(description);
    }
    if (data.link) {
      const link = document.createElement('a');
      link.className = 'campaign-banner-cta';
      link.href = data.link.href;
      link.textContent = data.link.textContent.trim();
      content.append(link);
    }
    slide.append(content);
    return slide;
  });

  let activeIndex = 0;
  let timer;
  let isPlaying = !motionPreference.matches && slides.length > 1;
  let isTemporarilyPaused = false;
  let pause;
  let count;
  let dots = [];
  let showSlide;

  const restartTimer = () => {
    window.clearInterval(timer);
    if (!isPlaying || isTemporarilyPaused || slides.length < 2) return;
    timer = window.setInterval(() => showSlide(activeIndex + 1, false), 7000);
  };

  showSlide = (index, manual) => {
    activeIndex = (index + slides.length) % slides.length;
    [slides[activeIndex], slides[(activeIndex + 1) % slides.length]].forEach((slide) => {
      const image = slide.querySelector('img');
      if (image) image.loading = 'eager';
    });
    if (manual) isPlaying = false;
    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === activeIndex;
      slide.hidden = !active;
      if (active) slide.removeAttribute('aria-hidden');
      else slide.setAttribute('aria-hidden', 'true');
      dots[slideIndex]?.setAttribute('aria-current', `${active}`);
    });
    if (count) count.textContent = `${activeIndex + 1} / ${slides.length}`;
    if (pause) {
      pause.setAttribute('aria-label', isPlaying ? 'Diashow pausieren' : 'Diashow fortsetzen');
      pause.textContent = isPlaying ? 'Pause' : 'Abspielen';
    }
    restartTimer();
  };

  const controls = document.createElement('div');
  controls.className = 'campaign-banner-controls';
  const previous = buildButton('Vorherige Meldung', 'campaign-banner-previous', () => {
    showSlide(activeIndex - 1, true);
  });
  previous.textContent = '‹';
  const next = buildButton('Nächste Meldung', 'campaign-banner-next', () => {
    showSlide(activeIndex + 1, true);
  });
  next.textContent = '›';
  const pagination = document.createElement('div');
  pagination.className = 'campaign-banner-pagination';
  pagination.setAttribute('role', 'group');
  pagination.setAttribute('aria-label', 'Meldung auswählen');
  dots = slides.map((slide, index) => {
    const dot = buildButton(`Gehe zu Meldung ${index + 1} von ${slides.length}`, 'campaign-banner-dot', () => {
      showSlide(index, true);
    });
    if (index === 0) dot.setAttribute('aria-current', 'true');
    pagination.append(dot);
    return dot;
  });
  pause = buildButton('Diashow pausieren', 'campaign-banner-pause', () => {
    isPlaying = !isPlaying;
    restartTimer();
    pause.setAttribute('aria-label', isPlaying ? 'Diashow pausieren' : 'Diashow fortsetzen');
    pause.textContent = isPlaying ? 'Pause' : 'Abspielen';
  });
  pause.textContent = isPlaying ? 'Pause' : 'Abspielen';
  count = document.createElement('span');
  count.className = 'campaign-banner-count';
  count.setAttribute('aria-live', 'polite');
  count.textContent = `1 / ${slides.length}`;
  controls.append(previous, pagination, next, pause, count);
  carousel.append(...slides, controls);
  block.replaceChildren(carousel);

  carousel.addEventListener('mouseenter', () => {
    isTemporarilyPaused = true;
    restartTimer();
  });
  carousel.addEventListener('mouseleave', () => {
    isTemporarilyPaused = false;
    restartTimer();
  });
  carousel.addEventListener('focusin', () => {
    isTemporarilyPaused = true;
    restartTimer();
  });
  carousel.addEventListener('focusout', (event) => {
    if (event.relatedTarget && carousel.contains(event.relatedTarget)) return;
    isTemporarilyPaused = false;
    restartTimer();
  });
  carousel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') showSlide(activeIndex - 1, true);
    if (event.key === 'ArrowRight') showSlide(activeIndex + 1, true);
  });
  document.addEventListener('visibilitychange', () => {
    isTemporarilyPaused = document.hidden;
    restartTimer();
  });
  motionPreference.addEventListener('change', (event) => {
    if (event.matches) isPlaying = false;
    pause.setAttribute('aria-label', isPlaying ? 'Diashow pausieren' : 'Diashow fortsetzen');
    pause.textContent = isPlaying ? 'Pause' : 'Abspielen';
    restartTimer();
  });
  showSlide(0, false);
}
