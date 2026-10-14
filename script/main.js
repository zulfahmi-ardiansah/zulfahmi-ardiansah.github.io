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
    if (!rows.length) target.append(element('p', 'data-status', 'Nothing to show yet.'));
    return rows;
  } catch (error) {
    target.replaceChildren(element('p', 'data-status', 'This section could not be loaded. Please refresh the page.'));
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
  button.setAttribute('aria-pressed', String(index === 0));
  button.setAttribute('aria-controls', 'project-feature');
  button.append(element('span', 'project-choice-number', String(index + 1).padStart(2, '0')));
  const copy = element('span', 'project-choice-copy');
  copy.append(element('strong', '', item.title), element('small', '', item.domain || item.role));
  button.append(copy, element('span', 'project-choice-arrow', '↗'));
  return button;
}

function renderProjectFeature(item, index, total) {
  const article = element('article', 'feature-content');
  const top = element('div', 'feature-top');
  top.append(element('span', 'feature-domain', item.domain || 'Project'), element('span', 'feature-counter', `${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`));
  const details = element('dl', 'feature-meta');
  [['Client', item.client], ['My role', `${item.related} / ${item.role}`]].forEach(([label, value]) => {
    const pair = element('div', 'feature-meta-item');
    pair.append(element('dt', '', label), element('dd', '', value));
    details.append(pair);
  });
  article.append(top, element('h3', '', item.title), details, element('p', 'feature-description', item.description));
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

function renderBlog(item, index) {
  const link = element('a', 'blog-item');
  link.href = item.link;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.append(element('span', 'blog-number', String(index + 1).padStart(2, '0')), element('span', 'blog-source', item.source), element('h3', '', item.title), element('span', 'blog-action', `Read on ${item.source} ↗`));
  return link;
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
  const feature = document.getElementById('project-feature');
  const result = document.getElementById('project-result');
  const previous = document.getElementById('project-prev');
  const next = document.getElementById('project-next');
  if (!projects.length) {
    feature.replaceChildren(element('p', 'data-status', 'Project details are unavailable.'));
    result.textContent = '';
    return;
  }

  let selected = 0;
  function select(index, moveFocus = false, revealOnMobile = false) {
    selected = (index + projects.length) % projects.length;
    choices.forEach((choice, position) => choice.setAttribute('aria-pressed', String(position === selected)));
    feature.replaceChildren(renderProjectFeature(projects[selected], selected, projects.length));
    result.textContent = `Project ${selected + 1} of ${projects.length}`;
    if (moveFocus) choices[selected].focus();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      feature.firstElementChild.animate(
        [{ opacity: .45, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 280, easing: 'ease-out' }
      );
    }
    if (revealOnMobile && window.matchMedia('(max-width: 760px)').matches) {
      feature.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
    }
  }
  choices.forEach((choice, index) => {
    choice.addEventListener('click', () => select(index, false, true));
    choice.addEventListener('keydown', event => {
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') { event.preventDefault(); select(index + 1, true); }
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') { event.preventDefault(); select(index - 1, true); }
      if (event.key === 'Home') { event.preventDefault(); select(0, true); }
      if (event.key === 'End') { event.preventDefault(); select(projects.length - 1, true); }
    });
  });
  previous.disabled = projects.length < 2;
  next.disabled = projects.length < 2;
  previous.addEventListener('click', () => select(selected - 1, false, true));
  next.addEventListener('click', () => select(selected + 1, false, true));
  select(0);
}

function initPageMotion() {
  const progress = document.getElementById('reading-progress');
  let ticking = false;
  function updateProgress() {
    const available = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${available > 0 ? Math.min(100, window.scrollY / available * 100) : 0}%`;
    document.querySelector('.site-header').classList.toggle('is-scrolled', window.scrollY > 20);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { window.requestAnimationFrame(updateProgress); ticking = true; }
  }, { passive: true });
  updateProgress();

  const sections = document.querySelectorAll('main section[id]');
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('.site-nav a, .mobile-menu nav a').forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-25% 0px -65% 0px' });
    sections.forEach(section => navObserver.observe(section));
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const type = document.getElementById('accent-type');
  const words = ['Pinging', 'Coding', 'Designing'];
  let index = 0;
  window.setInterval(() => {
    type.classList.add('is-changing');
    window.setTimeout(() => {
      index = (index + 1) % words.length;
      type.textContent = words[index];
      type.classList.remove('is-changing');
    }, 220);
  }, 4200);
  if (!('IntersectionObserver' in window)) return;
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.animate(
        [{ opacity: .5, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 500, easing: 'cubic-bezier(.2,.7,.2,1)' }
      );
      reveal.unobserve(entry.target);
    });
  }, { threshold: .13 });
  document.querySelectorAll('.section-heading, .skill-card, .blog-item, .about-copy, .about-side').forEach(node => reveal.observe(node));
}

document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('year').textContent = new Date().getFullYear();
  initMenu();
  const [projects] = await Promise.all([
    loadData('projects', 'project-list', renderProjectChoice),
    loadData('experiences', 'experience-list', renderExperience),
    loadData('skillsets', 'skillset-list', renderSkill),
    loadData('blogs', 'blog-list', renderBlog)
  ]);
  initProjects(projects);
  initPageMotion();
});
