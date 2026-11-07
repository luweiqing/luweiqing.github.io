(() => {
  'use strict';
  const dialog = document.querySelector('.lightbox');
  const modalBody = dialog.querySelector('.lightbox-body');
  document.querySelectorAll('[data-full-image], [data-figures]').forEach(button => button.addEventListener('click', () => {
    const figures = button.dataset.figures ? JSON.parse(button.dataset.figures) : [{
      src: button.dataset.fullImage,
      alt: button.dataset.imageAlt,
      caption: button.dataset.imageAlt
    }];
    modalBody.replaceChildren(...figures.map((item, index) => {
      const figure = document.createElement('figure');
      figure.className = 'lightbox-figure';
      if (figures.length > 1) {
        const heading = document.createElement('h3');
        heading.className = 'lightbox-figure-title';
        heading.textContent = `${index + 1}. ${item.title}`;
        figure.append(heading);
      }
      const image = document.createElement('img');
      image.src = item.src;
      image.alt = item.alt;
      const caption = document.createElement('figcaption');
      caption.className = 'lightbox-caption';
      caption.textContent = item.caption || item.alt;
      figure.append(image, caption);
      return figure;
    }));
    dialog.querySelector('.lightbox-title').textContent = button.dataset.imageTitle;
    dialog.showModal();
    modalBody.scrollTop = 0;
  }));
  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  const copyButton = document.querySelector('.copy-button');
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('lwq0924@hnu.edu.cn');
      copyButton.textContent = 'Copied!';
    } catch {
      const field = document.createElement('textarea');
      field.value = 'lwq0924@hnu.edu.cn';
      field.style.cssText = 'position:fixed;left:-9999px;top:0';
      document.body.appendChild(field);
      field.select();
      const success = document.execCommand('copy');
      field.remove();
      copyButton.textContent = success ? 'Copied!' : 'Select email';
    }
    setTimeout(() => { copyButton.textContent = 'Copy email'; }, 2200);
  });
  const navigation = [...document.querySelectorAll('.side-nav a')];
  const sections = navigation.map(link => document.querySelector(link.getAttribute('href')));
  let navigationFrame = null;
  let navigationTarget = sections.find(section => '#' + section.id === location.hash) || null;
  let navigatingToTarget = Boolean(navigationTarget);
  let wasAtPageEnd = false;
  const updateNavigation = () => {
    navigationFrame = null;
    let current = sections[0];
    const boundary = Math.min(innerHeight * .25, 220);
    sections.forEach(section => { if (section.getBoundingClientRect().top <= boundary) current = section; });
    const atPageEnd = scrollY > 0 && scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
    if (wasAtPageEnd && !atPageEnd && !navigatingToTarget) navigationTarget = null;
    if (atPageEnd) {
      const targetTop = navigationTarget?.getBoundingClientRect().top;
      current = targetTop >= 0 && targetTop < innerHeight ? navigationTarget : sections[sections.length - 1];
    }
    if (navigationTarget && navigatingToTarget) {
      current = navigationTarget;
      const scrollPadding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const targetY = Math.max(0, Math.min(
        navigationTarget.getBoundingClientRect().top + scrollY - scrollPadding,
        document.documentElement.scrollHeight - innerHeight
      ));
      if (Math.abs(scrollY - targetY) <= 2) navigatingToTarget = false;
    }
    wasAtPageEnd = atPageEnd;
    navigation.forEach(link => {
      const active = link.getAttribute('href') === '#' + current.id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  };
  const scheduleNavigation = () => { if (navigationFrame === null) navigationFrame = requestAnimationFrame(updateNavigation); };
  const releaseNavigationTarget = () => { navigationTarget = null; navigatingToTarget = false; scheduleNavigation(); };
  navigation.forEach(link => link.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    navigationTarget = sections.find(section => '#' + section.id === link.getAttribute('href'));
    navigatingToTarget = Boolean(navigationTarget);
    scheduleNavigation();
  }));
  addEventListener('hashchange', () => {
    navigationTarget = sections.find(section => '#' + section.id === location.hash) || null;
    navigatingToTarget = Boolean(navigationTarget);
    scheduleNavigation();
  });
  addEventListener('wheel', releaseNavigationTarget, { passive: true });
  addEventListener('touchstart', releaseNavigationTarget, { passive: true });
  addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) releaseNavigationTarget();
  });
  addEventListener('scroll', scheduleNavigation, { passive: true });
  addEventListener('resize', scheduleNavigation);
  updateNavigation();
})();
