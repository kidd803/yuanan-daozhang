import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';

const SITE_URL = 'https://taoism.com.tw';
const PREVIEW_RATIO = 0.5;
const STYLE_VERSION = '20260724-public-preview';
const ICON_VERSION = '20260724-mobile-course';
const outputDir = 'articles';

const source = await readFile('data/posts.js', 'utf8');
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context);

const posts = Array.isArray(context.window.YUANAN_POSTS) ? context.window.YUANAN_POSTS : [];

if (process.env.PRESERVE_ARTICLES_DIR !== '1') {
  await rm(outputDir, { recursive: true, force: true });
}
await mkdir(outputDir, { recursive: true });

await writeFile(path.join(outputDir, 'index.html'), articleIndex(posts), 'utf8');

for (const post of posts) {
  await writeFile(path.join(outputDir, `${post.id}.html`), articlePage(post), 'utf8');
}

await writeFile('sitemap.xml', sitemap(posts), 'utf8');
await writeFile('robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE_URL}/sitemap.xml\n`, 'utf8');

console.log(`Generated ${posts.length} public preview pages.`);

function articleIndex(items) {
  const cards = items.map((post) => `
        <article class="preview-card">
          <div class="post-meta">
            <time datetime="${escapeHtml(post.date || '')}">${escapeHtml(post.date || '')}</time>
            <span class="category">${escapeHtml(post.category || '未分類')}</span>
            ${post.series ? `<span class="series-badge">${escapeHtml(seriesLabel(post))}</span>` : ''}
          </div>
          <h2><a href="${escapeHtml(post.id)}.html">${escapeHtml(post.title || '未命名文章')}</a></h2>
          <p>${escapeHtml(shortText(publicPreview(post.body), 180))}</p>
        </article>`).join('\n');

  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
${faviconLinks('../')}
    <title>圓安道語公開文章預覽索引</title>
    <meta name="description" content="圓安道長公開文章預覽索引，提供約 50% 文章內文供搜尋與查找。">
    <link rel="canonical" href="${SITE_URL}/articles/">
    <link rel="stylesheet" href="../styles.css?v=${STYLE_VERSION}">
  </head>
  <body class="preview-page">
    <main class="preview-shell">
      <header class="preview-header">
        <a class="preview-home" href="../">圓安道語</a>
        <p class="eyebrow">公開文章預覽索引</p>
        <h1>圓安道語公開文章預覽索引</h1>
        <p>本頁提供每篇文章約 50% 公開預覽，方便搜尋引擎與信眾查找主題。完整內文請回主站輸入暗語閱讀。</p>
      </header>
      <section class="preview-list" aria-label="公開文章預覽">
${cards}
      </section>
    </main>
  </body>
</html>
`;
}

function articlePage(post) {
  const preview = publicPreview(post.body);
  const paragraphs = paragraphBlocks(preview)
    .map((block) => `        <p>${escapeHtml(block)}</p>`)
    .join('\n');
  const description = shortText(preview, 150);
  const url = `${SITE_URL}/articles/${post.id}.html`;

  return `<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
${faviconLinks('../')}
    <title>${escapeHtml(post.title || '未命名文章')}｜圓安道語公開預覽</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${url}">
    <link rel="stylesheet" href="../styles.css?v=${STYLE_VERSION}">
  </head>
  <body class="preview-page">
    <main class="preview-shell">
      <article class="preview-article">
        <header class="preview-header">
          <a class="preview-home" href="../">圓安道語</a>
          <p class="eyebrow">公開文章預覽 約 50%</p>
          <h1>${escapeHtml(post.title || '未命名文章')}</h1>
          <div class="post-meta">
            <time datetime="${escapeHtml(post.date || '')}">${escapeHtml(post.date || '')}</time>
            <span class="category">${escapeHtml(post.category || '未分類')}</span>
            ${post.series ? `<span class="series-badge">${escapeHtml(seriesLabel(post))}</span>` : ''}
          </div>
        </header>
        <section class="preview-body" aria-label="文章公開預覽">
${paragraphs}
        </section>
        <footer class="preview-lock">
          <p>以上為本文約 50% 公開預覽。完整內文請回主站搜尋文章，並輸入暗語閱讀。</p>
          <a class="course-order-button" href="../">回圓安道語主站</a>
        </footer>
      </article>
    </main>
  </body>
</html>
`;
}

function sitemap(items) {
  const urls = [
    { loc: `${SITE_URL}/`, lastmod: today() },
    { loc: `${SITE_URL}/articles/`, lastmod: today() },
    ...items.map((post) => ({
      loc: `${SITE_URL}/articles/${post.id}.html`,
      lastmod: validDate(post.date) ? post.date : today()
    }))
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((item) => `  <url>
    <loc>${escapeHtml(item.loc)}</loc>
    <lastmod>${escapeHtml(item.lastmod)}</lastmod>
  </url>`).join('\n')}
</urlset>
`;
}

function faviconLinks(prefix = '') {
  return `    <link rel="icon" type="image/png" sizes="512x512" href="${prefix}assets/favicon.png?v=${ICON_VERSION}">
    <link rel="apple-touch-icon" sizes="180x180" href="${prefix}assets/apple-touch-icon.png?v=${ICON_VERSION}">`;
}

function publicPreview(text) {
  const body = (text || '').toString().trim();
  if (!body || body.length <= 180) return body;
  const limit = Math.max(1, Math.ceil(body.length * PREVIEW_RATIO));
  const slice = body.slice(0, limit);
  const cleanCut = slice.replace(/[，,。！？!?；;：:、\s]*[^\n，,。！？!?；;：:、\s]{0,18}$/, '');
  return `${(cleanCut || slice).trim()}...`;
}

function paragraphBlocks(text) {
  return (text || '').split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
}

function shortText(text, limit) {
  const compact = (text || '').replace(/\s+/g, ' ').trim();
  return compact.length > limit ? `${compact.slice(0, limit)}...` : compact;
}

function seriesLabel(post) {
  if (!post.series) return '';
  const index = post.seriesIndex ? ` ${post.seriesIndex}` : '';
  const unit = post.seriesUnit || '';
  return `${post.series}${index}${unit}`;
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '');
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function escapeHtml(value) {
  return (value ?? '').toString()
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
