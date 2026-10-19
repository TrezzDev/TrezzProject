window.registerPortfolioPage('projects', () => {
  const scope = new AbortController();
  const on = (target, type, handler) =>
    target.addEventListener(type, handler, { signal: scope.signal });
  const stopWallpaper = window.mountPortfolioWallpaper(
    document.querySelector('.projects-screen'),
    scope.signal,
    'projects'
  );
  // Verified against the owner's GitHub repositories and local Poseto project.
  const projects = [
    {
      title: 'Pemilos Website',
      description:
        'Online school voting platform with secure login, candidate information, and real-time vote results.',
      url: 'https://github.com/Aiosssss/pemilihan-osis',
    },
    {
      title: 'Photobooth Web',
      description:
        'Poseto photo booth with custom frames, filters, stickers, HD downloads, and remote photo sessions.',
      url: 'https://poseto.vercel.app',
    },
    {
      title: 'Persona 3 Portfolio',
      description:
        'Interactive portfolio inspired by Persona 3 Reload, with animated menus, video backgrounds, and game sound effects.',
      url: 'https://github.com/Aiosssss/porto-persona3',
    },
    { title: 'AIOS — Try Out UTBK', titleOnly: true },
    { title: 'Creatix Digital Agency', titleOnly: true },
    { title: 'Persona 5 Portfolio', titleOnly: true },
    { title: 'Persona 3 Pause Menu', titleOnly: true },
  ];
  const list = document.querySelector('#project-list');
  const template = document.querySelector('#project-item-template');
  const spark = document.querySelector('.project-menu-spark');
  const caption = document.querySelector('#project-caption');
  const sfx = document.querySelector('#menu-sfx');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let captionAnimation = null;
  let selected = 0;
  const buttons = projects.map((project, index) => {
    const item = template.content.cloneNode(true);
    const button = item.querySelector('button');
    button.dataset.project = index;
    item.querySelector('li').style.setProperty('--project-index', index);
    button.querySelector('.project-item-title').textContent = project.title;
    list.append(item);
    return button;
  });
  function sound(volume = 0.42) {
    try {
      sfx.currentTime = 0;
      sfx.volume = volume;
      sfx.play().catch(() => {});
    } catch {
      /* Audio availability does not block navigation. */
    }
  }
  function updateSpark() {
    const button = buttons[selected];
    const buttonRect = button.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    const menuRect = list.parentElement.getBoundingClientRect();
    // Keep the halo outside the list's clipping/scrolling box.
    spark.style.top = `${buttonRect.top - menuRect.top - (window.innerWidth <= 760 ? 9 : 13)}px`;
    spark.classList.toggle(
      'is-visible',
      buttonRect.bottom > listRect.top && buttonRect.top < listRect.bottom
    );
  }
  function select(index, withSound = false) {
    const changed = selected !== index;
    selected = index;
    buttons.forEach((button, i) => {
      button.classList.toggle('is-active', i === selected);
      if (i === selected) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    updateSpark();
    caption.textContent = projects[selected].description || '';
    if (changed) {
      captionAnimation?.cancel();
      if (!reducedMotion.matches) {
        captionAnimation = caption.animate(
          [
            { opacity: 0, transform: 'translateY(3px)' },
            { opacity: 1, transform: 'translateY(0)' },
          ],
          { duration: 220, easing: 'ease-out' }
        );
      }
    }
    if (changed && withSound) sound();
  }
  function openProject(withConfirm = false) {
    const project = projects[selected];
    if (withConfirm) window.playConfirmSfx();
    else sound(0.65);
    if (project.titleOnly) return;
    if (project.url) window.open(project.url, '_blank', 'noopener,noreferrer');
  }
  buttons.forEach((button, index) => {
    on(button, 'pointerenter', (event) => {
      if (event.pointerType !== 'touch') select(index);
    });
    on(button, 'focus', () => select(index));
    on(button, 'click', () => {
      select(index);
      openProject();
    });
  });
  on(document.querySelector('.return-link'), 'click', (event) => {
    if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey)
      return;
    event.preventDefault();
    window.navigateWithBackSfx('index.html');
  });
  on(document, 'keydown', (event) => {
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.target.closest("input, select, textarea, [contenteditable='true']")
    )
      return;
    if (['ArrowDown', 'ArrowUp', 'ArrowRight', 'ArrowLeft'].includes(event.key)) {
      event.preventDefault();
      const delta = ['ArrowDown', 'ArrowRight'].includes(event.key) ? 1 : -1;
      select((selected + delta + projects.length) % projects.length, true);
      buttons[selected].scrollIntoView({
        block: 'nearest',
        behavior: reducedMotion.matches ? 'instant' : 'smooth',
      });
      buttons[selected].focus({ preventScroll: true });
    } else if (event.key === 'Enter' && !event.target.closest('a')) {
      event.preventDefault();
      if (!event.repeat) openProject(true);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      if (!event.repeat) window.navigateWithBackSfx('index.html');
    }
  });
  on(list, 'scroll', updateSpark);
  on(window, 'resize', updateSpark);
  select(selected);
  return () => {
    scope.abort();
    stopWallpaper();
    captionAnimation?.cancel();
  };
});
