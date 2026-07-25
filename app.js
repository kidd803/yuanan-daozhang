const posts = Array.isArray(window.YUANAN_POSTS) ? window.YUANAN_POSTS : [];
const archiveMeta = window.YUANAN_ARCHIVE_META || {};
const PAGE_SIZE = 60;
const DEFAULT_CATEGORY_ORDER = [
  '悟道真詮',
  '養生性命',
  '處世立命',
  '全真道脈',
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
const PUBLIC_PREVIEW_RATIO = 0.5;
const RECOMMENDATION_MIN_LENGTH = 320;
const ARTICLE_UNLOCK_KEY = 'yuanan-article-unlocked';
const SITE_URL = 'https://taoism.com.tw';
const PUBLIC_MEDIA_LIMIT = 6;
const PUBLIC_PHOTO_KEYWORDS = ['照片', '參訪', '参访', '法會', '法会', '生日', '花', '樹', '树', '宮', '宫', '廟', '庙', '山', '海', '道場', '道场', '祖庭', '鹿邑', '青羊宮', '青羊宫', '崑崙', '昆仑', '華陽觀', '华阳观'];
const SENSITIVE_MEDIA_KEYWORDS = ['符', '咒', '口訣', '口诀', '真訣', '真诀', '講義', '讲义', '教材', '架構', '架构', '圖解', '图解', '紫微', '斗數', '斗数', '命盤', '命盘', '生肖', '手印'];

const state = {
  category: '全部',
  query: '',
  sort: 'newest',
  year: '全部年份',
  series: '全部系列',
  visible: PAGE_SIZE,
  selectedId: null,
  recommendationHour: currentHourKey(),
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
const floatingSearchButton = document.querySelector('#floatingSearchButton');
const courseFrameworkOpen = document.querySelector('#courseFrameworkOpen');
const foundationSeriesOpen = document.querySelector('#foundationSeriesOpen');
const courseFrameworkLightbox = document.querySelector('#courseFrameworkLightbox');
const courseFrameworkClose = courseFrameworkLightbox?.querySelector('.image-lightbox-close');
const courseFrameworkLightboxImage = courseFrameworkLightbox?.querySelector('img');
let activeLightboxTrigger = null;

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

  floatingSearchButton?.addEventListener('click', returnToSearch);
  courseFrameworkOpen?.addEventListener('click', () => {
    openImageLightbox('assets/yuanan-course-framework.jpg', '圓安道長九科高階課程架構放大圖', courseFrameworkOpen);
  });
  foundationSeriesOpen?.addEventListener('click', () => {
    openImageLightbox('assets/yuanan-foundation-series.jpg', '全真基礎研讀六大系列放大圖', foundationSeriesOpen);
  });
  courseFrameworkClose?.addEventListener('click', closeImageLightbox);
  courseFrameworkLightbox?.addEventListener('click', (event) => {
    if (event.target === courseFrameworkLightbox) closeImageLightbox();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !courseFrameworkLightbox?.hidden) closeImageLightbox();
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

  setInterval(() => {
    const nextHour = currentHourKey();
    if (nextHour === state.recommendationHour) return;
    state.recommendationHour = nextHour;
    if (!state.selectedId) render();
  }, 60000);
}

function populateOptions() {
  yearSelect.append(...years.map((year) => option(year)));
  seriesSelect?.append(...seriesNames.map((series) => option(series)));
}

function render() {
  const filtered = matchPosts();
  const selected = selectedPost(filtered);
  document.body.classList.toggle('is-reading-article', Boolean(selected));
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
  const images = archiveMeta.publicImages || 0;
  summary.textContent = `已整理 ${formatCount(posts.length)} 篇公開文字文章、${formatCount(images)} 張文章圖片，分為 ${formatCount(CATEGORY_ORDER.length)} 個主題；目前符合 ${formatCount(filtered.length)} 篇。`;
}

function renderSeries() {
  const series = seriesNames;
  seriesBar.replaceChildren(...series.map((seriesName) => {
    const button = document.createElement('button');
    button.type = 'button';
    const count = seriesCounts.get(seriesName) || 0;
    button.append(filterLabel(seriesName, count));
    button.setAttribute('aria-pressed', String(state.series === seriesName));
    button.setAttribute('aria-label', `${seriesName}，${formatCount(count)} 篇`);
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
    button.append(filterLabel(category, count));
    button.setAttribute('aria-pressed', String(state.category === category));
    button.setAttribute('aria-label', `${category}，${formatCount(count)} 篇`);
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

function filterLabel(label, count) {
  const fragment = document.createDocumentFragment();
  const name = document.createElement('span');
  name.className = 'filter-label';
  name.textContent = label;
  const number = document.createElement('span');
  number.className = 'filter-count';
  number.textContent = formatCount(count);
  fragment.append(name, number);
  return fragment;
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
    statLine('公開圖片', formatCount(mediaCount))
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
    : publicExcerpt(post.body);
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
    renderHourlyRecommendation();
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

function renderHourlyRecommendation() {
  const recommendation = hourlyRecommendation();
  if (!recommendation) {
    const empty = document.createElement('p');
    empty.className = 'empty reader-empty';
    empty.textContent = '尚未匯入文章';
    reader.replaceChildren(empty);
    return;
  }

  const section = document.createElement('section');
  section.className = 'hourly-pick';

  const header = document.createElement('header');
  header.className = 'hourly-pick-head';
  const kicker = document.createElement('p');
  kicker.className = 'eyebrow';
  kicker.textContent = '本小時推薦道語';
  const title = document.createElement('h2');
  title.textContent = recommendation.title;
  const meta = document.createElement('div');
  meta.className = 'post-meta reader-meta';
  const time = document.createElement('time');
  time.textContent = recommendation.date;
  const category = document.createElement('span');
  category.className = 'category';
  category.textContent = recommendation.category || '未分類';
  meta.append(time, category);
  if (recommendation.series) meta.append(seriesBadge(recommendation, true));
  header.append(kicker, title, meta);

  const preview = document.createElement('div');
  preview.className = 'hourly-pick-preview';
  preview.replaceChildren(...paragraphBlocks(publicPreview(recommendation.body)).map((block) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = block;
    return paragraph;
  }));

  const actions = document.createElement('div');
  actions.className = 'reader-actions';
  const readButton = document.createElement('button');
  readButton.type = 'button';
  readButton.textContent = '閱讀這篇';
  readButton.addEventListener('click', () => openRecommendedPost(recommendation.id));
  actions.append(readButton);

  const note = document.createElement('p');
  note.className = 'hourly-pick-note';
  note.textContent = '每小時自動換一篇；完整內文需輸入已登記道名。';

  section.append(header, preview, actions, note);
  reader.replaceChildren(section);
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

  const preview = document.createElement('section');
  preview.className = 'public-preview';
  const previewHeading = document.createElement('h3');
  previewHeading.textContent = '公開預覽 約 50%';
  const previewBody = document.createElement('div');
  previewBody.className = 'reader-body';
  previewBody.replaceChildren(...paragraphBlocks(publicPreview(post.body)).map((block) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = block;
    return paragraph;
  }));
  preview.append(previewHeading, previewBody);
  const publicMedia = renderPublicMedia(post);

  const panel = document.createElement('form');
  panel.className = 'unlock-panel';
  const label = document.createElement('label');
  label.className = 'field unlock-field';
  const labelText = document.createElement('span');
  labelText.textContent = '道名';
  const input = document.createElement('input');
  input.type = 'text';
  input.lang = 'zh-Hant';
  input.inputMode = 'text';
  input.autocomplete = 'off';
  input.autocapitalize = 'off';
  input.spellcheck = false;
  input.placeholder = '請輸入道名';
  label.append(labelText, input);

  const hint = document.createElement('p');
  hint.textContent = '與林明心道長登記後，\n輸入您的道名，正確後即可閱讀全文。';

  const error = document.createElement('p');
  error.className = 'unlock-error';
  error.hidden = true;

  const button = document.createElement('button');
  button.type = 'submit';
  button.textContent = '開啟文章';

  panel.addEventListener('submit', (event) => {
    event.preventDefault();
    const matchedPhrase = SECRET_PHRASES.find((phrase) => normalizeSecret(phrase) === normalizeSecret(input.value));
    if (!matchedPhrase) {
      error.textContent = '道名不正確，請再確認。';
      error.hidden = false;
      input.select();
      return;
    }
    state.unlocked = true;
    writeUnlockState();
    trackArticleUnlock(post, matchedPhrase);
    render();
  });

  panel.append(hint, label, error, button);
  reader.replaceChildren(...[header, preview, publicMedia, panel].filter(Boolean));
  input.focus({ preventScroll: true });
}

function renderMedia(post) {
  const media = (post.media || []).filter((item) => item?.src);
  if (!media.length) return null;
  return mediaSection(post, media, `文章圖片 ${formatCount(media.length)} 張`, 'reader-media');
}

function renderPublicMedia(post) {
  const media = publicPhotoMedia(post);
  if (!media.length) return null;
  return mediaSection(post, media, `公開照片 ${formatCount(media.length)} 張`, 'reader-media reader-public-media');
}

function mediaSection(post, media, headingText, className) {
  const section = document.createElement('section');
  section.className = className;
  const heading = document.createElement('h3');
  heading.textContent = headingText;
  const grid = document.createElement('div');
  grid.className = 'media-grid';
  grid.replaceChildren(...media.map((item, index) => {
    const link = document.createElement('button');
    link.type = 'button';
    link.className = 'media-link';
    link.setAttribute('aria-label', `放大 ${post.title} 圖片 ${index + 1}`);
    const image = document.createElement('img');
    image.src = item.src;
    image.alt = `${post.title} 圖片 ${index + 1}`;
    image.loading = 'lazy';
    link.addEventListener('click', () => openImageLightbox(item.src, image.alt, link));
    link.append(image);
    return link;
  }));
  section.append(heading, grid);
  return section;
}

function publicPhotoMedia(post) {
  if (hasSensitiveMediaContext(post) && !hasPublicPhotoContext(post)) return [];
  return (post.media || []).filter((item) => item?.src).slice(0, PUBLIC_MEDIA_LIMIT);
}

function readerActions(post) {
  const actions = document.createElement('div');
  actions.className = 'reader-actions';
  const searchButton = document.createElement('button');
  searchButton.type = 'button';
  searchButton.className = 'reader-search-button';
  searchButton.textContent = '回到搜尋';
  searchButton.addEventListener('click', returnToSearch);

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

function openRecommendedPost(id) {
  state.category = '全部';
  state.year = '全部年份';
  state.series = '全部系列';
  state.query = '';
  state.visible = PAGE_SIZE;
  state.selectedId = id;
  searchInput.value = '';
  render();
  reader.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function returnToSearch() {
  state.selectedId = null;
  render();
  document.querySelector('.masthead')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  searchInput.focus({ preventScroll: true });
}

function openImageLightbox(src, alt, trigger = null) {
  if (!courseFrameworkLightbox || !courseFrameworkLightboxImage || !src) return;
  activeLightboxTrigger = trigger;
  courseFrameworkLightboxImage.src = src;
  courseFrameworkLightboxImage.alt = alt || '放大圖片';
  courseFrameworkLightbox.hidden = false;
  document.body.classList.add('has-open-lightbox');
  courseFrameworkClose?.focus({ preventScroll: true });
}

function closeImageLightbox() {
  if (!courseFrameworkLightbox) return;
  courseFrameworkLightbox.hidden = true;
  document.body.classList.remove('has-open-lightbox');
  const focusTarget = activeLightboxTrigger?.isConnected ? activeLightboxTrigger : courseFrameworkOpen;
  activeLightboxTrigger = null;
  focusTarget?.focus({ preventScroll: true });
}

function trackArticleUnlock(post, phrase) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', 'unlock_article_success', {
    event_label: `道名成功開啟文章（${phrase}）`,
    dao_name: phrase,
    article_title: post.title || '未命名文章',
    article_url: publicArticleUrl(post),
    article_id: post.id || '',
    article_category: post.category || '',
    article_series: post.series || ''
  });
}

function publicArticleUrl(post) {
  if (!post?.id) return SITE_URL;
  return `${SITE_URL}/articles/${post.id}.html`;
}

function hasPublicPhotoContext(post) {
  const text = `${post.title || ''}\n${post.body || ''}\n${post.category || ''}\n${(post.tags || []).join('\n')}`;
  return PUBLIC_PHOTO_KEYWORDS.some((keyword) => text.includes(keyword));
}

function hasSensitiveMediaContext(post) {
  const text = `${post.title || ''}\n${post.body || ''}\n${post.category || ''}\n${(post.tags || []).join('\n')}`;
  return SENSITIVE_MEDIA_KEYWORDS.some((keyword) => text.includes(keyword));
}

function hourlyRecommendation() {
  if (!posts.length) return null;
  const candidates = posts.filter((post) => (post.body || '').replace(/\s+/g, '').length >= RECOMMENDATION_MIN_LENGTH);
  const pool = candidates.length ? candidates : posts;
  return pool[(state.recommendationHour * 37) % pool.length];
}

function currentHourKey() {
  return Math.floor(Date.now() / 3600000);
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

function publicPreview(text) {
  const body = (text || '').toString().trim();
  if (!body || body.length <= 180) return body;
  const limit = Math.max(1, Math.ceil(body.length * PUBLIC_PREVIEW_RATIO));
  const slice = body.slice(0, limit);
  const cleanCut = slice.replace(/[，,。！？!?；;：:、\s]*[^\n，,。！？!?；;：:、\s]{0,18}$/, '');
  return `${(cleanCut || slice).trim()}...`;
}

function publicExcerpt(text) {
  const compact = publicPreview(text).replace(/\s+/g, ' ').trim();
  return compact.length > 180 ? `${compact.slice(0, 180)}...` : compact;
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
