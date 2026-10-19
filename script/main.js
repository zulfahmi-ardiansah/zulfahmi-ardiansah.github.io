const imagePath = name => `./image/${encodeURIComponent(name)}.svg`;

function element(tag, className = '', value) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (value !== undefined) node.textContent = value;
  return node;
}

function icon(name) {
  const img = element('img');
  img.src = imagePath(name);
  img.alt = '';
  img.loading = 'lazy';
  return img;
}

async function loadData(file, targetId, render) {
  const target = document.getElementById(targetId);
  try {
    const response = await fetch(`./data/${file}.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error('Expected an array');
    target.replaceChildren(...rows.map(render));
    target.removeAttribute('data-static');
    if (!rows.length) target.append(element('p', 'data-status', 'Nothing to show yet.'));
    return rows;
  } catch (error) {
    if (!target.hasAttribute('data-static')) {
      target.replaceChildren(element('p', 'data-status', 'This section could not be loaded. Please refresh the page.'));
    }
    console.error(`Could not load ${file}:`, error);
    return [];
  }
}

function renderExperience(item) {
  const row = element('article', 'experience-item');
  row.append(element('span', 'experience-period', item.period));
  const body = element('div');
  body.append(element('h4', '', `${item.company} (${item.region})`), element('p', '', item.role));
  row.append(body);
  return row;
}

function updateExperienceYears(periods) {
  const currentYear = new Date().getFullYear();
  const years = periods
    .map(period => Number(String(period).match(/^\s*(\d{4})\b/)?.[1]))
    .filter(year => Number.isInteger(year) && year <= currentYear);
  if (years.length) {
    document.getElementById('experience-years').textContent = currentYear - Math.min(...years);
  }
}

function renderSkill(item, index) {
  const card = element('article', 'skill-card');
  card.id = `skill-${item.title.toLowerCase()}`;
  const top = element('div', 'skill-top');
  top.append(element('span', 'skill-index', String(index + 1).padStart(2, '0')), icon(item.icon));
  card.append(top, element('h3', '', item.title), element('p', 'skill-tagline', item.description), element('p', 'skill-summary', item.summary));
  const roles = element('ul', 'skill-roles');
  (item.skills || []).forEach(skill => roles.append(element('li', '', skill)));
  card.append(roles);
  const tools = element('ul', 'tool-list');
  (item.sets || []).forEach(set => {
    const tool = element('li');
    tool.append(icon(set), element('span', '', set.replaceAll('-', ' ')));
    tools.append(tool);
  });
  card.append(element('p', 'stack-label', 'TOOLS I USE'), tools);
  return card;
}

function renderProjectChoice(item, index) {
  const button = element('button', 'project-choice');
  button.type = 'button';
  button.dataset.index = String(index);
  if (document.documentElement.classList.contains('motion-ready')) button.dataset.revealPending = '';
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-controls', 'project-dialog');
  button.setAttribute('aria-label', `View details for ${item.title}`);
  button.append(element('span', 'project-choice-number', String(index + 1).padStart(2, '0')));
  const copy = element('span', 'project-choice-copy');
  copy.append(element('strong', '', item.title), element('span', 'project-choice-client', item.client));
  const arrow = element('span', 'project-choice-arrow', '↗');
  arrow.setAttribute('aria-hidden', 'true');
  button.append(copy, arrow);
  return button;
}

function renderProjectFeature(item) {
  const article = element('article', 'feature-content');
  const details = element('dl', 'feature-meta');
  [['Client', item.client], ['My role', `${item.related} / ${item.role}`]].forEach(([label, value]) => {
    const pair = element('div', 'feature-meta-item');
    pair.append(element('dt', '', label), element('dd', '', value));
    details.append(pair);
  });
  const title = element('h3', '', item.title);
  title.id = 'project-dialog-title';
  article.append(title, details, element('p', 'feature-description', item.description));
  const scope = element('div', 'feature-group');
  scope.append(element('h4', '', 'What it covers'));
  const scopeList = element('ul', 'scope-list');
  (item.scope || []).forEach(value => scopeList.append(element('li', '', value)));
  scope.append(scopeList);
  article.append(scope);
  const stack = element('div', 'feature-group');
  stack.append(element('h4', '', 'Tools used'));
  const tools = element('ul', 'project-stack');
  (item.sets || []).forEach(set => {
    const tool = element('li');
    tool.append(icon(set), element('span', '', set.replaceAll('-', ' ')));
    tools.append(tool);
  });
  stack.append(tools);
  article.append(stack);
  return article;
}

function renderTool(item, index) {
  const link = element('a', 'tool-item');
  link.href = item.link;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  const action = element('span', 'tool-action', 'View on GitHub ');
  const arrow = element('span', '', '↗');
  arrow.setAttribute('aria-hidden', 'true');
  action.append(arrow);
  link.append(element('span', 'tool-number', String(index + 1).padStart(2, '0')), element('h3', '', item.title), element('p', '', item.description), action);
  return link;
}

function renderBlog(item, index) {
  const link = element('a', 'blog-item');
  link.href = item.link;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  const action = element('span', 'blog-action');
  const actionArrow = element('span', '', '↗');
  actionArrow.setAttribute('aria-hidden', 'true');
  action.append(element('span', '', `Read on ${item.source}`), actionArrow);
  link.append(element('span', 'blog-number', String(index + 1).padStart(2, '0')), element('span', 'blog-source', item.source), element('h3', '', item.title), action);
  return link;
}

function renderSetupColumn(group) {
  const column = element('div', 'gear-column');
  const items = element('ul');
  (group.items || []).forEach(item => {
    const row = element('li');
    row.append(element('strong', '', item.name), element('span', '', item.description));
    items.append(row);
  });
  column.append(element('h3', '', group.category), items);
  return column;
}

function initMenu() {
  const button = document.querySelector('.menu-toggle');
  const dialog = document.getElementById('mobile-menu');
  const closeButton = dialog.querySelector('.menu-close');
  button.addEventListener('click', () => {
    dialog.showModal();
    button.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  });
  function closeMenu() {
    if (dialog.open) dialog.close();
  }
  closeButton.addEventListener('click', closeMenu);
  dialog.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  dialog.addEventListener('close', () => {
    button.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
    if (event.matches) closeMenu();
  });
}

function initProjects(projects) {
  const choices = [...document.querySelectorAll('.project-choice')];
  const dialog = document.getElementById('project-dialog');
  const feature = document.getElementById('project-feature');
  const counter = document.getElementById('project-dialog-counter');
  const domain = document.getElementById('project-dialog-domain');
  const previous = document.getElementById('project-prev');
  const next = document.getElementById('project-next');
  if (!projects.length) {
    previous.disabled = true;
    next.disabled = true;
    return;
  }

  let selected = 0;
  let returnFocus = null;
  function openProject(index, trigger) {
    selected = (index + projects.length) % projects.length;
    counter.textContent = `${String(selected + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`;
    domain.textContent = projects[selected].domain || 'Project';
    feature.replaceChildren(renderProjectFeature(projects[selected]));
    feature.scrollTop = 0;
    if (!dialog.open) {
      returnFocus = trigger;
      document.body.classList.add('project-dialog-open');
      dialog.showModal();
      dialog.querySelector('.project-dialog-close').focus();
    }
  }
  dialog.querySelector('.project-dialog-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('keydown', event => {
    if (projects.length < 2) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); openProject(selected - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); openProject(selected + 1); }
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('project-dialog-open');
    returnFocus?.focus();
  });
  choices.forEach((choice, index) => {
    choice.addEventListener('click', () => openProject(index, choice));
    choice.addEventListener('keydown', event => {
      const columns = window.matchMedia('(max-width: 760px)').matches ? 1 : 2;
      let targetIndex;
      if (event.key === 'ArrowRight') targetIndex = index + 1;
      if (event.key === 'ArrowLeft') targetIndex = index - 1;
      if (event.key === 'ArrowDown') targetIndex = index + columns;
      if (event.key === 'ArrowUp') targetIndex = index - columns;
      if (event.key === 'Home') targetIndex = 0;
      if (event.key === 'End') targetIndex = projects.length - 1;
      if (targetIndex !== undefined) {
        event.preventDefault();
        choices[Math.max(0, Math.min(projects.length - 1, targetIndex))].focus();
      }
    });
  });
  previous.disabled = projects.length < 2;
  next.disabled = projects.length < 2;
  previous.addEventListener('click', () => openProject(selected - 1));
  next.addEventListener('click', () => openProject(selected + 1));
}

function initScrollEffects() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const smallScreen = window.matchMedia('(max-width: 760px)');
  const hero = document.querySelector('.hero');
  const layers = [
    [document.querySelector('.hero-kicker'), 32],
    [document.querySelector('.hero h1'), 82],
    [document.querySelector('.hero-intro'), 46],
    ...[...document.querySelectorAll('.section-heading h2')].map(node => [node, 42]),
    ...[...document.querySelectorAll('.heading-split > p')].map(node => [node, 24]),
    [document.querySelector('.contact-inner h2'), 54]
  ].filter(([node]) => node);
  layers.forEach(([node]) => node.classList.add('scroll-depth'));

  let depthFrame = 0;
  function paintDepth() {
    depthFrame = 0;
    if (reducedMotion.matches) return;
    const viewportHeight = window.innerHeight;
    const scale = smallScreen.matches ? .35 : 1;
    const sectionRects = new Map();
    const offsets = layers.map(([node, distance]) => {
      const section = node.closest('section');
      if (!sectionRects.has(section)) sectionRects.set(section, section.getBoundingClientRect());
      const rect = sectionRects.get(section);
      const progress = Math.max(0, Math.min(1, (viewportHeight - rect.top) / (viewportHeight + rect.height)));
      return [node, Math.round((progress - .5) * distance * scale)];
    });
    offsets.forEach(([node, offset]) => node.style.setProperty('--scroll-offset', `${offset}px`));
    const heroTravel = Math.max(0, Math.min(window.scrollY, hero.offsetHeight));
    hero.style.setProperty('--hero-glow-shift', `${Math.round(heroTravel * (smallScreen.matches ? .05 : .14))}px`);
  }
  function queueDepth() {
    if (!depthFrame && !reducedMotion.matches) depthFrame = window.requestAnimationFrame(paintDepth);
  }
  function resetDepth() {
    if (depthFrame) window.cancelAnimationFrame(depthFrame);
    depthFrame = 0;
    layers.forEach(([node]) => node.style.removeProperty('--scroll-offset'));
    hero.style.removeProperty('--hero-glow-shift');
  }

  const revealSelector = '.section-heading, .about-copy, .about-side, .skill-card, .project-choice[data-reveal-pending], .tool-item, .blog-item, .gear-column, .contact-bottom';
  let revealObserver;
  function observeReveals() {
    if (reducedMotion.matches || !document.documentElement.classList.contains('motion-ready')) return;
    if (!('IntersectionObserver' in window)) {
      document.documentElement.classList.remove('motion-ready');
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          revealObserver.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: .08 });
    }
    document.querySelectorAll(revealSelector).forEach(node => {
      if (!node.classList.contains('is-revealed')) revealObserver.observe(node);
    });
  }

  window.addEventListener('scroll', queueDepth, { passive: true });
  window.addEventListener('resize', queueDepth);
  smallScreen.addEventListener('change', queueDepth);
  document.addEventListener('focusin', event => {
    const target = event.target.closest(revealSelector);
    if (!target) return;
    target.classList.add('is-revealed');
    revealObserver?.unobserve(target);
  });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) {
      revealObserver?.disconnect();
      document.documentElement.classList.remove('motion-ready');
      resetDepth();
    } else {
      document.documentElement.classList.add('motion-ready');
      observeReveals();
      queueDepth();
    }
  });
  window.clearTimeout(window.portfolioRevealFallback);
  observeReveals();
  queueDepth();
  return observeReveals;
}

function initPageMotion() {
  const progress = document.getElementById('reading-progress');
  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.site-nav a, .mobile-menu nav a')];
  let activeSectionId = '';
  let ticking = false;
  function updateProgress() {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${available > 0 ? Math.min(100, window.scrollY / available * 100) : 0}%`;
    document.querySelector('.site-header').classList.toggle('is-scrolled', window.scrollY > 20);
    const marker = window.innerHeight * .35;
    let currentSectionId = '';
    for (const section of sections) {
      if (section.getBoundingClientRect().top > marker) break;
      currentSectionId = section.id;
    }
    if (currentSectionId !== activeSectionId) {
      navLinks.forEach(link => {
        if (link.hash === `#${currentSectionId}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      activeSectionId = currentSectionId;
    }
    ticking = false;
  }
  function queueUpdate() {
    if (!ticking) { window.requestAnimationFrame(updateProgress); ticking = true; }
  }
  window.addEventListener('scroll', queueUpdate, { passive: true });
  window.addEventListener('resize', queueUpdate);
  updateProgress();

  return initScrollEffects();
}

function initPreloader() {
  const preloader = document.getElementById('preloader');
  const pageContent = [...document.body.children].filter(element => element !== preloader);
  const inertBeforeLoading = pageContent.map(element => element.inert);
  pageContent.forEach(element => { element.inert = true; });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const minimum = reducedMotion ? 400 : 2200;
  let exiting = false;
  let waiting = false;
  window.clearTimeout(window.preloaderFallback);

  function exitPreloader() {
    if (exiting) return;
    exiting = true;
    window.clearTimeout(window.preloaderFallback);
    preloader.classList.add('is-exiting');
    window.setTimeout(() => {
      document.documentElement.classList.remove('is-loading');
      preloader.hidden = true;
      pageContent.forEach((element, index) => { element.inert = inertBeforeLoading[index]; });
    }, 550);
  }

  function waitForMinimum() {
    if (waiting) return;
    waiting = true;
    if (!preloader.getAnimations) {
      window.setTimeout(exitPreloader, Math.max(reducedMotion ? 0 : 1800, minimum - performance.now()));
      return;
    }
    const animations = preloader.getAnimations({ subtree: true });
    Promise.all(animations.map(animation => animation.finished.catch(() => {}))).then(() => {
      window.setTimeout(exitPreloader, Math.max(250, minimum - performance.now()));
    });
  }

  if (document.readyState === 'complete') waitForMinimum();
  else {
    window.addEventListener('load', waitForMinimum, { once: true });
    window.setTimeout(waitForMinimum, 5000);
  }
}

initPreloader();

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  updateExperienceYears([...document.querySelectorAll('#experience-list .experience-period')].map(node => node.textContent));
  initMenu();
  const observeReveals = initPageMotion();
  const [projects] = await Promise.all([
    loadData('projects', 'project-list', renderProjectChoice).then(rows => {
      observeReveals();
      return rows;
    }),
    loadData('experiences', 'experience-list', renderExperience).then(rows => updateExperienceYears(rows.map(row => row.period))),
    loadData('skillsets', 'skillset-list', renderSkill),
    loadData('tools', 'tools-list', renderTool),
    loadData('blogs', 'blog-list', renderBlog),
    loadData('setup', 'setup-list', renderSetupColumn)
  ]);
  initProjects(projects);
  observeReveals();
});
