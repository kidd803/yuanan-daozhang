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
const SEARCH_TRACK_DELAY = 900;
const COPY_FEEDBACK_DELAY = 1400;
const DEFAULT_SORT = 'newest';
const SERIES_SORT = 'oldest';
const PUBLIC_PHOTO_KEYWORDS = ['照片', '參訪', '参访', '法會', '法会', '生日', '花', '樹', '树', '宮', '宫', '廟', '庙', '山', '海', '道場', '道场', '祖庭', '鹿邑', '青羊宮', '青羊宫', '崑崙', '昆仑', '華陽觀', '华阳观'];
const SENSITIVE_MEDIA_KEYWORDS = ['符', '咒', '口訣', '口诀', '真訣', '真诀', '講義', '讲义', '教材', '架構', '架构', '圖解', '图解', '紫微', '斗數', '斗数', '命盤', '命盘', '生肖', '手印'];
const SERIES_DISPLAY_NAMES = {
  '淺譯 道德經 81章': '淺譯《道德經》81 章',
  '黃元吉 道德經 81章': '黃元吉《道德經》81 章',
  '畫符 100講': '畫符 100 講',
  '紫微斗數推演 99': '紫微斗數推演 99 講'
};
const PILLAR_FILTERS = {
  '全真道入門': {
    categories: ['全真道脈', '道教經典'],
    series: ['全真道法統', '全真道歷史', '重陽立教十五論'],
    keywords: ['全真', '龍門', '法統', '道統', '宗脈', '祖庭', '師承', '冠巾', '皈依', '傳戒', '传戒', '王重陽', '王重阳', '丘處機', '丘处机', '北七真', '祖師', '祖师'],
    minScore: 3
  },
  '全真龍門道脈': {
    categories: ['全真道脈'],
    series: ['全真道法統', '全真道歷史', '重陽立教十五論'],
    keywords: ['全真', '龍門', '龙门', '道脈', '道脉', '王重陽', '王重阳', '丘處機', '丘处机', '太清宮', '太清宫', '鹿邑', '蓬萊', '蓬莱', '師承', '师承', '冠巾'],
    minScore: 2
  },
  '丹道修真': {
    categories: ['丹道修真', '龍門丹道', '養生性命'],
    series: ['圓安論氣功'],
    keywords: ['丹道', '內丹', '内丹', '性命', '築基', '筑基', '煉精', '炼精', '煉氣', '炼气', '煉神', '炼神', '打坐', '靜坐', '静坐', '火候', '綿息', '息法', '丹田', '任督'],
    minScore: 2
  },
  '修心煉性': {
    categories: ['修心煉性', '修身養性', '處世立命', '悟道真詮'],
    series: [],
    keywords: ['修心', '煉性', '炼性', '心性', '起心動念', '起心动念', '貪', '瞋', '癡', '放下', '無為', '无为', '虛靜', '虚静', '人情', '家庭', '工作', '煩惱', '烦恼'],
    minScore: 2
  },
  '經典講堂': {
    categories: ['道教經典'],
    series: ['龍門心法', '黃元吉 道德經 81章', '淺譯 道德經 81章', '重陽立教十五論'],
    keywords: ['道德經', '道德经', '清靜經', '清静经', '重陽立教十五論', '重阳立教十五论', '龍門心法', '龙门心法', '太乙金華', '太乙金华', '丘祖', '祖師著作', '經典', '经典'],
    minScore: 2
  }
};

const state = {
  category: '全部',
  query: '',
  sort: DEFAULT_SORT,
  year: '全部年份',
  series: '全部系列',
  pillar: '',
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
const pillarSections = document.querySelector('.pillar-sections');
const floatingSearchButton = document.querySelector('#floatingSearchButton');
const courseFrameworkOpen = document.querySelector('#courseFrameworkOpen');
const foundationSeriesOpen = document.querySelector('#foundationSeriesOpen');
const courseFrameworkLightbox = document.querySelector('#courseFrameworkLightbox');
const courseFrameworkClose = courseFrameworkLightbox?.querySelector('.image-lightbox-close');
const courseFrameworkLightboxImage = courseFrameworkLightbox?.querySelector('img');
let activeLightboxTrigger = null;
let searchTrackTimer = null;

const categoryCounts = countBy(posts, (post) => post.category || '未分類');
const seriesCounts = countSeries(posts);
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
    state.pillar = '';
    state.visible = PAGE_SIZE;
    state.selectedId = null;
    render();
    scheduleSearchTracking('search_input');
  });

  yearSelect.addEventListener('change', () => {
    state.year = yearSelect.value;
    state.category = '全部';
    state.series = '全部系列';
    state.pillar = '';
    state.query = '';
    searchInput.value = '';
    state.visible = PAGE_SIZE;
    state.selectedId = null;
    render();
    trackEvent('filter_year', {
      filter_year: state.year,
      result_count: matchPosts().length
    });
  });

  seriesSelect?.addEventListener('change', () => {
    selectSeries(seriesSelect.value);
  });

  sortSelect.addEventListener('change', () => {
    state.sort = sortSelect.value;
    state.visible = PAGE_SIZE;
    render();
    trackEvent('sort_articles', {
      sort_order: state.sort
    });
  });

  loadMoreButton.addEventListener('click', () => {
    state.visible += PAGE_SIZE;
    render();
    trackEvent('load_more_articles', {
      visible_count: state.visible,
      result_count: matchPosts().length
    });
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
    state.pillar = '';
    state.visible = PAGE_SIZE;
    state.selectedId = null;
    searchInput.value = state.query;
    render();
    trackEvent('quick_search', {
      search_term: state.query,
      result_count: matchPosts().length
    });
    scrollToResultsOnMobile();
  });

  pillarSections?.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-pillar]');
    if (!button) return;
    selectPillar(button);
  });

  bindAnalyticsLinks();

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
  document.body.classList.toggle('is-filtered-list', hasActiveFilter());
  renderSummary(filtered);
  renderSeries();
  renderCategories();
  renderStats(filtered);
  renderPosts(filtered, selected);
  renderReader(selected);
  yearSelect.value = state.year;
  if (seriesSelect) seriesSelect.value = state.series;
  sortSelect.value = currentSortOrder();
  sortSelect.disabled = state.series !== '全部系列';
}

function matchPosts() {
  const tokens = searchTokens(state.query);
  return posts
    .filter((post) => state.category === '全部' || post.category === state.category)
    .filter((post) => state.year === '全部年份' || post.date?.startsWith(state.year))
    .filter((post) => state.series === '全部系列' || postHasSeries(post, state.series))
    .filter((post) => !state.pillar || pillarScore(post, state.pillar) > 0)
    .filter((post) => {
      if (!tokens.length) return true;
      const text = [
        post.title,
        post.body,
        post.category,
        ...postSeriesNames(post),
        post.date,
        ...(post.tags || [])
      ].join('\n');
      const haystack = normalizeSearch(text);
      return tokens.every((token) => haystack.includes(token));
    })
    .sort((a, b) => {
      if (state.pillar) {
        const scoreDiff = pillarScore(b, state.pillar) - pillarScore(a, state.pillar);
        if (scoreDiff) return scoreDiff;
      }
      return currentSortOrder() === 'oldest' ? a.timestamp - b.timestamp : b.timestamp - a.timestamp;
    });
}

function currentSortOrder() {
  return state.series === '全部系列' ? state.sort : SERIES_SORT;
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
    button.append(filterLabel(seriesDisplayName(seriesName), count));
    button.setAttribute('aria-pressed', String(state.series === seriesName));
    button.setAttribute('aria-label', `${seriesDisplayName(seriesName)}，${formatCount(count)} 篇`);
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
      state.pillar = '';
      state.year = '全部年份';
      state.visible = PAGE_SIZE;
      state.selectedId = null;
      render();
      trackEvent('filter_category', {
        category_name: category,
        result_count: matchPosts().length
      });
      scrollToResultsOnMobile();
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

function seriesDisplayName(seriesName) {
  return SERIES_DISPLAY_NAMES[seriesName] || seriesName;
}

function hasActiveFilter() {
  return Boolean(
    state.query ||
    state.pillar ||
    state.category !== '全部' ||
    state.year !== '全部年份' ||
    state.series !== '全部系列'
  );
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
  const currentTitle = state.series !== '全部系列'
    ? seriesDisplayName(state.series)
    : state.pillar
      ? state.pillar
      : state.category === '全部'
        ? '全部文章'
        : state.category;
  resultTitle.textContent = currentTitle;
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
  appendSeriesBadges(node.querySelector('.post-meta'), post, true);
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
  const actions = document.createElement('div');
  actions.className = 'post-card-actions';
  actions.append(articleShareButton(post, {
    className: 'post-share-button',
    successLabel: '網址已複製'
  }));
  node.append(actions);
  node.addEventListener('click', () => selectPost(post.id, 'post_list'));
  node.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectPost(post.id, 'post_list_keyboard');
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
  appendSeriesBadges(meta, post, true);
  const title = document.createElement('h2');
  title.textContent = post.title;
  header.append(meta, title, readerActions(post, { includeText: true }));

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
    detailItem('系列', postSeriesNames(post).map((seriesName) => seriesLabel(post, seriesName)).join('、') || '-'),
    detailItem('原附件數', formatCount(post.mediaCount || 0)),
    detailItem('文章網址', publicArticleUrl(post))
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
  appendSeriesBadges(meta, recommendation, true);
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
  appendSeriesBadges(meta, post, true);
  const title = document.createElement('h2');
  title.textContent = post.title;
  header.append(meta, title, readerActions(post, { includeText: false }));

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

function readerActions(post, options = {}) {
  const includeText = options.includeText !== false;
  const actions = document.createElement('div');
  actions.className = 'reader-actions';
  const searchButton = document.createElement('button');
  searchButton.type = 'button';
  searchButton.className = 'reader-search-button';
  searchButton.textContent = '回到搜尋';
  searchButton.addEventListener('click', returnToSearch);

  const shareButton = articleShareButton(post, {
    className: 'reader-share-button',
    label: '複製網址',
    successLabel: '已複製網址'
  });

  actions.append(searchButton, shareButton);
  if (!includeText) return actions;

  const copyButton = document.createElement('button');
  copyButton.type = 'button';
  copyButton.textContent = '複製文字';
  copyButton.addEventListener('click', async () => {
    const ok = await copyText(`${post.title}\n\n${post.body}`.trim());
    copyButton.textContent = ok ? '已複製' : '複製失敗';
    trackArticleEvent(ok ? 'copy_article_text' : 'copy_article_text_failed', post);
    setTimeout(() => { copyButton.textContent = '複製文字'; }, COPY_FEEDBACK_DELAY);
  });
  actions.append(copyButton);
  return actions;
}

function articleShareButton(post, options = {}) {
  const button = document.createElement('button');
  const label = options.label || '複製網址';
  button.type = 'button';
  button.className = options.className || '';
  button.textContent = label;
  button.addEventListener('click', async (event) => {
    event.stopPropagation();
    const ok = await copyText(publicArticleUrl(post));
    button.textContent = ok ? (options.successLabel || '已複製') : '複製失敗';
    trackArticleEvent(ok ? 'copy_article_url' : 'copy_article_url_failed', post);
    setTimeout(() => { button.textContent = label; }, COPY_FEEDBACK_DELAY);
  });
  button.addEventListener('keydown', (event) => {
    event.stopPropagation();
  });
  return button;
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

function selectPost(id, source = 'post_list') {
  blurActiveControl();
  state.selectedId = id;
  render();
  const post = posts.find((item) => item.id === id);
  trackArticleEvent('select_article', post, { source });
  if (window.matchMedia('(max-width: 860px)').matches) reader.scrollIntoView({ block: 'start' });
}

function openRecommendedPost(id) {
  blurActiveControl();
  state.category = '全部';
  state.year = '全部年份';
  state.series = '全部系列';
  state.pillar = '';
  state.query = '';
  state.visible = PAGE_SIZE;
  state.selectedId = id;
  searchInput.value = '';
  render();
  trackArticleEvent('select_hourly_recommendation', posts.find((post) => post.id === id));
  reader.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function returnToSearch() {
  state.selectedId = null;
  render();
  trackEvent('return_to_search');
  document.querySelector('.masthead')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  searchInput.focus({ preventScroll: true });
}

function blurActiveControl() {
  const active = document.activeElement;
  if (active instanceof HTMLElement && active.matches('input, textarea, select, button')) active.blur();
}

function openImageLightbox(src, alt, trigger = null) {
  if (!courseFrameworkLightbox || !courseFrameworkLightboxImage || !src) return;
  activeLightboxTrigger = trigger;
  courseFrameworkLightboxImage.src = src;
  courseFrameworkLightboxImage.alt = alt || '放大圖片';
  courseFrameworkLightbox.hidden = false;
  document.body.classList.add('has-open-lightbox');
  trackEvent('open_image_lightbox', {
    image_alt: alt || '放大圖片',
    image_src: src
  });
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
  trackArticleEvent('unlock_article_success', post, {
    event_label: `道名成功開啟文章（${phrase}）`,
    dao_name: phrase
  });
}

function bindAnalyticsLinks() {
  document.querySelectorAll('.course-order-button, .course-order-image-link').forEach((link) => {
    link.addEventListener('click', () => {
      trackEvent('course_signup_click', {
        link_text: link.textContent.trim() || link.querySelector('img')?.alt || '圓安丹道入門線上試播課',
        link_url: link.href
      });
    });
  });

  document.querySelectorAll('.yuanan-ip-button, .yuanan-ip-image').forEach((link) => {
    link.addEventListener('click', () => {
      trackEvent('facebook_join_click', {
        link_text: link.textContent.trim() || link.querySelector('img')?.alt || '圓安道長 Facebook',
        link_url: link.href
      });
    });
  });
}

function scheduleSearchTracking(source) {
  window.clearTimeout(searchTrackTimer);
  if (!state.query) return;
  searchTrackTimer = window.setTimeout(() => {
    trackEvent('site_search', {
      search_term: state.query,
      source,
      result_count: matchPosts().length
    });
  }, SEARCH_TRACK_DELAY);
}

function trackArticleEvent(name, post, params = {}) {
  if (!post) return;
  trackEvent(name, {
    article_title: post.title || '未命名文章',
    article_url: publicArticleUrl(post),
    article_id: post.id || '',
    article_category: post.category || '',
    article_series: postSeriesNames(post).join('、'),
    ...params
  });
}

function trackEvent(name, params = {}) {
  if (typeof window.gtag !== 'function') return;
  window.gtag('event', name, {
    page_title: document.title,
    ...params
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

function pillarScore(post, pillar) {
  const filter = PILLAR_FILTERS[pillar];
  if (!filter) return 0;

  let score = 0;
  if ((filter.categories || []).includes(post.category)) score += 2;
  if ((filter.series || []).some((seriesName) => postHasSeries(post, seriesName))) score += 5;

  const title = normalizeSearch(post.title || '');
  const body = normalizeSearch(post.body || '');
  const tags = normalizeSearch((post.tags || []).join('\n'));

  for (const keyword of filter.keywords || []) {
    const token = normalizeSearch(keyword);
    if (!token) continue;
    if (title.includes(token)) score += 3;
    else if (tags.includes(token)) score += 2;
    else if (body.includes(token)) score += 1;
  }

  return score >= (filter.minScore || 1) ? score : 0;
}

function selectPillar(button) {
  const pillar = button.dataset.pillar || '';
  state.pillar = pillar;
  state.query = '';
  state.category = '全部';
  state.year = '全部年份';
  state.series = '全部系列';
  state.visible = PAGE_SIZE;
  state.selectedId = null;
  searchInput.value = '';
  render();
  const resultCount = matchPosts().length;
  const filter = PILLAR_FILTERS[pillar] || {};
  trackEvent('pillar_section_click', {
    pillar_name: pillar,
    category_name: (filter.categories || []).join('、'),
    series_name: (filter.series || []).join('、'),
    result_count: resultCount
  });
  if (scrollToResultsOnMobile()) return;
  document.querySelector('.layout')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
}

function selectSeries(series, source = 'series_tab') {
  state.series = state.series === series ? '全部系列' : series;
  state.category = '全部';
  state.pillar = '';
  state.sort = state.series === '全部系列' ? DEFAULT_SORT : SERIES_SORT;
  state.visible = PAGE_SIZE;
  state.selectedId = null;
  render();
  trackEvent('filter_series', {
    series_name: state.series,
    source,
    result_count: matchPosts().length
  });
  scrollToResultsOnMobile();
}

function scrollToResultsOnMobile() {
  if (!window.matchMedia('(max-width: 860px)').matches) return false;
  document.querySelector('.results')?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  return true;
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

function countSeries(items) {
  const map = new Map();
  for (const item of items) {
    for (const seriesName of postSeriesNames(item)) {
      map.set(seriesName, (map.get(seriesName) || 0) + 1);
    }
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

function appendSeriesBadges(container, post, clickable = false) {
  const badges = postSeriesNames(post).map((seriesName) => seriesBadge(post, clickable, seriesName));
  container.append(...badges);
}

function seriesBadge(post, clickable = false, seriesName = post.series) {
  const badge = document.createElement(clickable ? 'button' : 'span');
  badge.className = 'series-badge';
  if (clickable) {
    badge.type = 'button';
    badge.title = `查看 ${seriesName}`;
    badge.addEventListener('click', (event) => {
      event.stopPropagation();
      selectSeries(seriesName);
    });
    badge.addEventListener('keydown', (event) => {
      event.stopPropagation();
    });
  }
  badge.textContent = seriesLabel(post, seriesName);
  return badge;
}

function seriesLabel(post, seriesName = post.series) {
  if (!seriesName) return '';
  if (seriesName !== post.series) return seriesName;
  const index = post.seriesIndex ? ` ${post.seriesIndex}` : '';
  const unit = post.seriesUnit || '';
  return `${seriesName}${index}${unit}`;
}

function postSeriesNames(post) {
  return [...new Set([post.series, ...(post.seriesAliases || [])].filter(Boolean))];
}

function postHasSeries(post, seriesName) {
  return postSeriesNames(post).includes(seriesName);
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
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall back to a temporary textarea below.
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-1000px';
  textarea.style.left = '-1000px';
  document.body.append(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}
