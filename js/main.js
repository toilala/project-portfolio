const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
const themeToggle = document.querySelector('.theme-toggle');

const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
if (pointerQuery.matches) {
  const cursor = document.createElement('span');
  const trail = document.createElement('span');
  cursor.className = 'ink-cursor';
  trail.className = 'ink-cursor-trail';
  document.body.append(cursor, trail);
  document.body.classList.add('has-pointer');
  let trailX = -100;
  let trailY = -100;
  let pointerX = -100;
  let pointerY = -100;

  const moveCursor = (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
    cursor.style.left = `${pointerX}px`;
    cursor.style.top = `${pointerY}px`;
    cursor.style.opacity = '1';
    document.body.classList.toggle('cursor-hover', Boolean(event.target.closest('a, button, [role="button"], input, textarea')));
  };
  const followCursor = () => {
    trailX += (pointerX - trailX) * 0.16;
    trailY += (pointerY - trailY) * 0.16;
    trail.style.left = `${trailX}px`;
    trail.style.top = `${trailY}px`;
    trail.style.opacity = '1';
    window.requestAnimationFrame(followCursor);
  };
  document.addEventListener('pointermove', moveCursor, { passive: true });
  document.addEventListener('pointerleave', () => {
    cursor.style.opacity = '0';
    trail.style.opacity = '0';
  });
  followCursor();
}

const savedTheme = window.localStorage.getItem('portfolio-theme');
if (savedTheme === 'dark') document.documentElement.dataset.theme = 'dark';

const syncThemeToggle = () => {
  if (!themeToggle) return;
  const dark = document.documentElement.dataset.theme === 'dark';
  themeToggle.querySelector('span').textContent = dark ? '☀' : '☾';
  themeToggle.querySelector('b').textContent = dark ? 'light' : 'dark';
  themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
};
syncThemeToggle();
themeToggle?.addEventListener('click', () => {
  const dark = document.documentElement.dataset.theme !== 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  window.localStorage.setItem('portfolio-theme', dark ? 'dark' : 'light');
  syncThemeToggle();
});

const liveTime = document.querySelector('.live-time');
const boardTime = document.querySelector('.board-time');
const updateLiveTime = () => {
  const now = new Date();
  const value = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit'
  }).format(now).toUpperCase();

  if (liveTime) liveTime.textContent = value;
  if (boardTime) boardTime.textContent = value;
};
updateLiveTime();
window.setInterval(updateLiveTime, 30000);

document.body.classList.add('is-loading');
const revealPage = () => {
  document.body.classList.replace('is-loading', 'is-loaded');
};
if (document.readyState === 'complete') {
  revealPage();
} else {
  window.addEventListener('load', revealPage, { once: true });
  window.setTimeout(revealPage, 1200);
}

const updateScrollInk = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0;
  document.documentElement.style.setProperty('--scroll-progress', `${progress}%`);
};
window.addEventListener('scroll', updateScrollInk, { passive: true });
updateScrollInk();

menu?.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  menu.setAttribute('aria-expanded', String(open));
});

const revealItems = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      instance.unobserve(entry.target);
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

document.querySelectorAll('.tilt').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 3}deg) rotateX(${y * -3}deg)`;
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
});

document.querySelectorAll('.tool').forEach((tool) => {
  tool.addEventListener('click', () => {
    document.querySelectorAll('.tool').forEach((item) => item.classList.remove('active'));
    tool.classList.add('active');
    const detail = document.querySelector('#tool-detail');
    if (detail) detail.textContent = tool.dataset.detail;
  });
});

document.querySelector('#contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const status = document.querySelector('.form-status');
  status.textContent = 'NOTE PINNED // I will write back soon.';
  event.target.reset();
});

const board = document.querySelector('.hero-board');
board?.addEventListener('pointermove', (event) => {
  if (portrait?.classList.contains('is-dragging')) return;
  const box = board.getBoundingClientRect();
  const x = (event.clientX - box.left) / box.width - 0.5;
  const y = (event.clientY - box.top) / box.height - 0.5;
  board.style.transform = `rotate(2deg) perspective(800px) rotateY(${x * 3}deg) rotateX(${y * -3}deg)`;
});
board?.addEventListener('pointerleave', () => { board.style.transform = ''; });

const portrait = document.querySelector('.portrait-card');
if (portrait && board) {
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;
  let baseX = 0;
  let baseY = 0;

  portrait.addEventListener('pointerdown', (event) => {
    const card = portrait.getBoundingClientRect();
    const surface = board.getBoundingClientRect();
    dragging = true;
    portrait.setPointerCapture(event.pointerId);
    offsetX = event.clientX - card.left;
    offsetY = event.clientY - card.top;
    baseX = card.left - surface.left;
    baseY = card.top - surface.top;
    portrait.classList.add('is-dragging');
    event.preventDefault();
  });

  portrait.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const surface = board.getBoundingClientRect();
    const card = portrait.getBoundingClientRect();
    const nextX = Math.min(Math.max(8, event.clientX - surface.left - offsetX), surface.width - card.width - 8);
    const nextY = Math.min(Math.max(28, event.clientY - surface.top - offsetY), surface.height - card.height - 8);
    portrait.style.left = `${nextX}px`;
    portrait.style.top = `${nextY}px`;
    portrait.style.right = 'auto';
    portrait.style.bottom = 'auto';
    portrait.style.transform = `rotate(4deg) translate(${nextX - baseX}px, ${nextY - baseY}px)`;
  });

  const stopDragging = () => {
    if (!dragging) return;
    dragging = false;
    portrait.classList.remove('is-dragging');
  };
  portrait.addEventListener('pointerup', stopDragging);
  portrait.addEventListener('pointercancel', stopDragging);
  portrait.addEventListener('keydown', (event) => {
    const step = event.shiftKey ? 20 : 8;
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    const card = portrait.getBoundingClientRect();
    const surface = board.getBoundingClientRect();
    const left = card.left - surface.left + (event.key === 'ArrowLeft' ? -step : event.key === 'ArrowRight' ? step : 0);
    const top = card.top - surface.top + (event.key === 'ArrowUp' ? -step : event.key === 'ArrowDown' ? step : 0);
    portrait.style.left = `${Math.min(Math.max(8, left), surface.width - card.width - 8)}px`;
    portrait.style.top = `${Math.min(Math.max(28, top), surface.height - card.height - 8)}px`;
    portrait.style.right = 'auto';
    portrait.style.bottom = 'auto';
  });
}

document.querySelectorAll('.eyebrow, .note-code').forEach((label) => {
  label.addEventListener('pointerenter', () => label.classList.add('is-peeking'));
  label.addEventListener('pointerleave', () => label.classList.remove('is-peeking'));
});

document.querySelectorAll('.hero-margin > span').forEach((scrap) => {
  scrap.addEventListener('click', () => {
    const turns = [-4, 3, 7, -7];
    const turn = turns[Math.floor(Math.random() * turns.length)];
    scrap.style.transform = `rotate(${turn}deg) scale(1.08)`;
    window.setTimeout(() => { scrap.style.transform = ''; }, 520);
  });
});
