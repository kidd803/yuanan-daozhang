const posts = Array.isArray(window.YUANAN_POSTS) ? window.YUANAN_POSTS : [];
const archiveMeta = window.YUANAN_ARCHIVE_META || {};
const PAGE_SIZE = 60;
const DEFAULT_CATEGORY_ORDER = [
  '【悟道真詮】',
  '養生性命',
  '處世立命',
  '【全真道脈】',
  '修身養性',
  '人間修行',
  '丹道修真',
  '修心煉性',
  '龍門丹道',
  '道教經典'
];
const CATEGORY_ORDER = Array.isArray(archiveMeta.categoryOrder) && archiveMeta.categoryOrder.length
  ? archiveMeta.categoryOrder
  : DEFAULT_CATEGORY_ORDER;
const countFormat = new Intl.NumberFormat('zh-Hant');
const SECRET_PHRASES = ['林明心', '林明毅', '林圓安'];
const ARTICLE_UNLOCK_KEY = 'yuanan-article-unlocked';

const state = {
  category: '全部',
  query: '',
  sort: 'newest',
  year: '全部年份',
  series: '全部系列',
  visible: PAGE_SIZE,
  selectedId: null,
  unlocked: readUnlockState()
};

const summary = document.querySelector('#summary');
const seriesBar = document.querySelector('#seriesBar');
const categoryBar = document.querySelector('#categoryBar');
const stats = document.querySelector('.stats');
const postList = document.querySelector('#postList');
const reader = document.querySelector('#reader');
const searchInput = document.querySelector('#searchInput');
const yearSelect = document.querySelector('#yearSelect');
const seriesSelect = document.querySelector('#seriesSelect');
const sortSelect = document.querySelector('#sortSelect');
const resultTitle = document.querySelector('#resultTitle');
const resultMeta = document.querySelector('#resultMeta');
const loadMoreButton = document.querySelector('#loadMoreButton');
const template = document.querySelector('#postTemplate');
const quickSearches = document.querySelector('.quick-searches');

const categoryCounts = countBy(posts, (post) => post.category || '未分類');
const seriesCounts = countBy(posts, (post) => post.series);
const years = [...new Set(posts.map((post) => post.date?.slice(0, 4)).filter(Boolean))]
  .sort((a, b) => b.localeCompare(a));
const seriesNames = [...seriesCounts.keys()].sort((a, b) => a.localeCompare(b, 'zh-Hant'));
const earliestPost = posts.reduce((earliest, post) => !earliest || post.timestamp < earliest.timestamp ? post : earliest, null);
const latestPost = posts.reduce((latest, post) => !latest || post.timestamp > latest.timestamp ? post : latest, null);

populateOptions();
bindEvents();
render();

function bindEvents() {
  searchInput.addEventListener('input', () => {
    state.query = searchInput.value.trim();
    state.category = '全部';
    state.year = '全部年份';
    state.series = '全部系列';
    state.visible = PAGE_SIZE;
    state.selectedId = null;
    render();
  });

  yearSelect.addEventListener('change', () => {
    state.year = yearSelect.value;
    state.category = '全部';
    state.series = '全部系列';
    state.query = '';
    searchInput.value = '';
    state.visible = PAGE_SIZE;
    state.selectedId = null;
    render();
  });

  seriesSelect?.addEventListener('change', () => {
    selectSeries(seriesSelect.value);
  });

  sortSelect.addEventListener('change', () => {
    state.sort = sortSelect.value;
    state.visible = PAGE_SIZE;
    render();
  });

  loadMoreButton.addEventListener('click', () => {
    state.visible += PAGE_SIZE;
    render();
  });

  quickSearches.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-query]');
    if (!button) return;
    state.query = button.dataset.query || '';
    state.category = '全部';
    state.year = '全部年份';
    state.series = '全部系列';
    state.visible = PAGE_SIZE;
    state.selectedId = null;
    searchInput.value = state.query;
    render();
  });
}

function populateOptions() {
  yearSelect.append(...years.map((year) => option(year)));
  seriesSelect?.append(...seriesNames.map((series) => option(series)));
}

function render() {
  const filtered = matchPosts();
  const selected = selectedPost(filtered);
  renderSummary(filtered);
  renderSeries();
  renderCategories();
  renderStats(filtered);
  renderPosts(filtered, selected);
  renderReader(selected);
  yearSelect.value = state.year;
  if (seriesSelect) seriesSelect.value = state.series;
}

function matchPosts() {
  const tokens = searchTokens(state.query);
  return posts
    .filter((post) => state.category === '全部' || post.category === state.category)
    .filter((post) => state.year === '全部年份' || post.date?.startsWith(state.year))
    .filter((post) => state.series === '全部系列' || post.series === state.series)
    .filter((post) => {
      if (!tokens.length) return true;
      const text = [
        post.title,
        post.body,
        post.category,
        post.series,
        post.date,
        ...(post.tags || [])
      ].join('\n');
      const haystack = normalizeSearch(text);
      return tokens.every((token) => haystack.includes(token));
    })
    .sort((a, b) => state.sort === 'oldest' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp);
}

function renderSummary(filtered) {
  if (!posts.length) {
    summary.textContent = '尚未匯入文章';
    return;
  }
  const omitted = archiveMeta.omittedImageOnlyPosts || 0;
  const duplicates = archiveMeta.omittedDuplicatePosts || 0;
  const images = archiveMeta.publicImages || 0;
  const duplicateText = duplicates ? `，已合併 ${formatCount(duplicates)} 筆重複影片分段` : '';
  const omittedText = omitted ? `，另存 ${formatCount(omitted)} 篇純媒體原始貼文` : '';
  summary.textContent = `已整理 ${formatCount(posts.length)} 篇公開文字文章、${formatCount(images)} 張文章圖片，分為 ${formatCount(CATEGORY_ORDER.length)} 個主題；目前符合 ${formatCount(filtered.length)} 篇${duplicateText}${omittedText}。`;
}

function renderSeries() {
  const series = seriesNames;
  seriesBar.replaceChildren(...series.map((seriesName) => {
    const button = document.createElement('button');
    button.type = 'button';
    const count = seriesCounts.get(seriesName) || 0;
    button.textContent = `${seriesName} ${formatCount(count)}`;
    button.setAttribute('aria-pressed', String(state.series === seriesName));
    button.addEventListener('click', () => selectSeries(seriesName));
    return button;
  }));
}

function renderCategories() {
  const extraCategories = [...categoryCounts.keys()].filter((category) => !CATEGORY_ORDER.includes(category));
  const categories = ['全部', ...CATEGORY_ORDER, ...extraCategories];
  categoryBar.replaceChildren(...categories.map((category) => {
    const button = document.createElement('button');
    button.type = 'button';
    const count = category === '全部' ? posts.length : categoryCounts.get(category) || 0;
    button.textContent = `${category} ${formatCount(count)}`;
    button.setAttribute('aria-pressed', String(state.category === category));
    button.addEventListener('click', () => {
      state.category = category;
      state.series = '全部系列';
      state.year = '全部年份';
      state.visible = PAGE_SIZE;
      state.selectedId = null;
      render();
    });
    return button;
  }));
}

function renderStats(filtered) {
  const linkCount = posts.reduce((sum, post) => sum + (post.links || []).length, 0);
  const mediaCount = archiveMeta.publicImages || posts.reduce((sum, post) => sum + (post.media || []).length, 0);
  stats.replaceChildren(
    statLine('公開文章', formatCount(posts.length)),
    statLine('符合條件', formatCount(filtered.length)),
    statLine('分類數', formatCount(CATEGORY_ORDER.length)),
    statLine('系列數', formatCount(seriesCounts.size)),
    statLine('最早日期', earliestPost?.date || '-'),
    statLine('最新日期', latestPost?.date || '-'),
    statLine('保留連結', formatCount(linkCount)),
    statLine('公開圖片', formatCount(mediaCount)),
    statLine('合併重複', formatCount(archiveMeta.omittedDuplicatePosts || 0))
  );
}

function renderPosts(filtered, selected) {
  const visiblePosts = filtered.slice(0, state.visible);
  resultTitle.textContent = state.series !== '全部系列'
    ? state.series
    : state.category === '全部'
      ? '全部文章'
      : state.category;
  resultMeta.textContent = filtered.length
    ? `顯示 ${formatCount(visiblePosts.length)} / ${formatCount(filtered.length)} 篇`
    : '0 篇';

  if (!filtered.length) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = '沒有符合條件的文章';
    postList.replaceChildren(empty);
    loadMoreButton.hidden = true;
    return;
  }

  postList.replaceChildren(...visiblePosts.map((post) => postCard(post, selected)));
  loadMoreButton.hidden = visiblePosts.length >= filtered.length;
}

function postCard(post, selected) {
  const node = template.content.firstElementChild.cloneNode(true);
  const isSelected = selected?.id === post.id;
  node.dataset.postId = post.id;
  node.setAttribute('aria-current', String(isSelected));
  node.querySelector('time').textContent = post.date;
  node.querySelector('.category').textContent = post.category || '未分類';
  if (post.series) node.querySelector('.post-meta').append(seriesBadge(post, true));
  node.querySelector('h2').textContent = post.title;
  node.querySelector('.excerpt').textContent = state.unlocked
    ? excerpt(post.body)
    : '需輸入暗語才可閱讀文章內容。';
  const tags = node.querySelector('.tags');
  const tagNodes = (post.tags || []).slice(0, 6).map((tag) => {
    const item = document.createElement('li');
    item.textContent = tag;
    return item;
  });
  if ((post.media || []).length) {
    const mediaBadge = document.createElement('li');
    mediaBadge.className = 'media-badge';
    mediaBadge.textContent = `圖片 ${formatCount(post.media.length)}`;
    tagNodes.push(mediaBadge);
  }
  tags.replaceChildren(...tagNodes);
  node.addEventListener('click', () => selectPost(post.id));
  node.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectPost(post.id);
    }
  });
  return node;
}

function renderReader(post) {
  if (!post) {
    const empty = document.createElement('p');
    empty.className = 'empty reader-empty';
    empty.textContent = posts.length ? '請從左側選擇文章，輸入暗語後閱讀。' : '尚未匯入文章';
    reader.replaceChildren(empty);
    return;
  }

  if (!state.unlocked) {
    renderLockedReader(post);
    return;
  }

  const header = document.createElement('header');
  header.className = 'reader-head';
  const meta = document.createElement('div');
  meta.className = 'post-meta reader-meta';
  const time = document.createElement('time');
  time.textContent = post.date;
  const category = document.createElement('span');
  category.className = 'category';
  category.textContent = post.category || '未分類';
  meta.append(time, category);
  if (post.series) meta.append(seriesBadge(post, true));
  const title = document.createElement('h2');
  title.textContent = post.title;
  header.append(meta, title, readerActions(post));

  const body = document.createElement('div');
  body.className = 'reader-body';
  body.replaceChildren(...paragraphBlocks(post.body).map((block) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = block;
    return paragraph;
  }));

  const details = document.createElement('dl');
  details.className = 'reader-details';
  details.append(
    detailItem('文章 ID', post.id),
    detailItem('系列', seriesLabel(post) || '-'),
    detailItem('原附件數', formatCount(post.mediaCount || 0))
  );

  const sections = [header];
  const media = renderMedia(post);
  if (media) sections.push(media);
  sections.push(body);
  if ((post.links || []).length) sections.push(linkList(post.links));
  if ((post.tags || []).length) sections.push(tagList(post.tags));
  sections.push(details);
  reader.replaceChildren(...sections);
}

function renderLockedReader(post) {
  const header = document.createElement('header');
  header.className = 'reader-head';
  const meta = document.createElement('div');
  meta.className = 'post-meta reader-meta';
  const time = document.createElement('time');
  time.textContent = post.date;
  const category = document.createElement('span');
  category.className = 'category';
  category.textContent = post.category || '未分類';
  meta.append(time, category);
  if (post.series) meta.append(seriesBadge(post, true));
  const title = document.createElement('h2');
  title.textContent = post.title;
  header.append(meta, title);

  const panel = document.createElement('form');
  panel.className = 'unlock-panel';
  const label = document.createElement('label');
  label.className = 'field unlock-field';
  const labelText = document.createElement('span');
  labelText.textContent = '暗語';
  const input = document.createElement('input');
  input.type = 'password';
  input.autocomplete = 'off';
  input.placeholder = '請輸入暗語';
  label.append(labelText, input);

  const hint = document.createElement('p');
  hint.textContent = '文章內容已鎖定，暗語正確後即可閱讀全文。';

  const error = document.createElement('p');
  error.className = 'unlock-error';
  error.hidden = true;

  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = '開啟文章';

  panel.addEventListener('submit', (event) => {
    event.preventDefault();
    const ok = SECRET_PHRASES.some((phrase) => normalizeSecret(phrase) === normalizeSecret(input.value));
    if (!ok) {
      error.textContent = '暗語不正確，請再確認。';
      error.hidden = false;
      input.select();
      return;
    }
    state.unlocked = true;
    writeUnlockState();
    render();
  });

  panel.append(hint, label, error, button);
  reader.replaceChildren(header, panel);
  input.focus({ preventScroll: true });
}

function renderMedia(post) {
  const media = (post.media || []).filter((item) => item?.src);
  if (!media.length) return null;

  const section = document.createElement('section');
  section.className = 'reader-media';
  const heading = document.createElement('h3');
  heading.textContent = `文章圖片 ${formatCount(media.length)} 張`;
  const grid = document.createElement('div');
  grid.className = 'media-grid';
  grid.replaceChildren(...media.map((item, index) => {
    const link = document.createElement('a');
    link.href = item.src;
    link.className = 'media-link';
    link.target = '_blank';
    link.rel = 'noreferrer';
    const image = document.createElement('img');
    image.src = item.src;
    image.alt = `${post.title} 圖片 ${index + 1}`;
    image.loading = 'lazy';
    link.append(image);
    return link;
  }));
  section.append(heading, grid);
  return section;
}

function readerActions(post) {
  const actions = document.createElement('div');
  actions.className = 'reader-actions';
  const searchButton = document.createElement('button');
  searchButton.type = 'button';
  searchButton.className = 'reader-search-button';
  searchButton.textContent = '回到搜尋';
  searchButton.addEventListener('click', () => {
    document.querySelector('.masthead')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    searchInput.focus({ preventScroll: true });
  });

  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.textContent = '複製文字';
  copyButton.addEventListener('click', async () => {
    const ok = await copyText(`${post.title}\n\n${post.body}`.trim());
    copyButton.textContent = ok ? '已複製' : '複製失敗';
    setTimeout(() => { copyButton.textContent = '複製文字'; }, 1300);
  });
  actions.append(searchButton, copyButton);
  return actions;
}

function linkList(links) {
  const section = document.createElement('section');
  section.className = 'link-section';
  const heading = document.createElement('h3');
  heading.textContent = '文章連結';
  const list = document.createElement('ul');
  list.replaceChildren(...links.map((href) => {
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = href;
    link.textContent = href;
    link.rel = 'noreferrer';
    item.append(link);
    return item;
  }));
  section.append(heading, list);
  return section;
}

function tagList(tags) {
  const list = document.createElement('ul');
  list.className = 'tags reader-tags';
  list.replaceChildren(...tags.map((tag) => {
    const item = document.createElement('li');
    item.textContent = tag;
    return item;
  }));
  return list;
}

function selectPost(id) {
  state.selectedId = id;
  render();
  if (window.matchMedia('(max-width: 860px)').matches) reader.scrollIntoView({ block: 'start' });
}

function selectSeries(series) {
  state.series = state.series === series ? '全部系列' : series;
  state.category = '全部';
  state.visible = PAGE_SIZE;
  state.selectedId = null;
  render();
}

function selectedPost(filtered) {
  if (!filtered.length) return null;
  if (!state.selectedId) return null;
  return filtered.find((post) => post.id === state.selectedId) || null;
}

function countBy(items, keyFn) {
  const map = new Map();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return new Map([...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant')));
}

function statLine(label, value) {
  const row = document.createElement('div');
  row.className = 'stat';
  const term = document.createElement('span');
  term.textContent = label;
  const data = document.createElement('strong');
  data.textContent = value;
  row.append(term, data);
  return row;
}

function detailItem(label, value) {
  const fragment = document.createDocumentFragment();
  const term = document.createElement('dt');
  term.textContent = label;
  const description = document.createElement('dd');
  description.textContent = value || '-';
  fragment.append(term, description);
  return fragment;
}

function seriesBadge(post, clickable = false) {
  const badge = document.createElement(clickable ? 'button' : 'span');
  badge.className = 'series-badge';
  if (clickable) {
    badge.type = 'button';
    badge.title = `查看 ${post.series}`;
    badge.addEventListener('click', (event) => {
      event.stopPropagation();
      selectSeries(post.series);
    });
    badge.addEventListener('keydown', (event) => {
      event.stopPropagation();
    });
  }
  badge.textContent = seriesLabel(post);
  return badge;
}

function seriesLabel(post) {
  if (!post.series) return '';
  const index = post.seriesIndex ? ` ${post.seriesIndex}` : '';
  const unit = post.seriesUnit || '';
  return `${post.series}${index}${unit}`;
}

function paragraphBlocks(text) {
  return (text || '').split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
}

function excerpt(text) {
  const compact = (text || '').replace(/\s+/g, ' ').trim();
  return compact.length > 120 ? `${compact.slice(0, 120)}...` : compact;
}

function searchTokens(query) {
  return normalizeSearch(query).split(/\s+/).filter(Boolean);
}

function normalizeSearch(text) {
  return (text || '').toString().toLowerCase().normalize('NFKC');
}

function normalizeSecret(text) {
  return (text || '').toString().trim().normalize('NFKC');
}

function readUnlockState() {
  try {
    return window.sessionStorage.getItem(ARTICLE_UNLOCK_KEY) === 'true';
  } catch {
    return false;
  }
}

function writeUnlockState() {
  try {
    window.sessionStorage.setItem(ARTICLE_UNLOCK_KEY, 'true');
  } catch {
    // Session storage can be unavailable in strict browser modes; keep the in-memory unlock.
  }
}

function option(value) {
  const node = document.createElement('option');
  node.value = value;
  node.textContent = value;
  return node;
}

function formatCount(value) {
  return countFormat.format(Number(value) || 0);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
