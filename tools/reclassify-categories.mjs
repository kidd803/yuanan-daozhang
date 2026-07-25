import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

const DATA_FILE = new URL('../data/posts.js', import.meta.url);
const SUMMARY_FILE = new URL('../data/summary.json', import.meta.url);

const CATEGORY_ORDER = [
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

const MARKER_RULES = [
  [/悟道真詮/, '悟道真詮'],
  [/全真道脈/, '全真道脈'],
  [/【養生性命】|養生性命/, '養生性命'],
  [/【處世立命】|處世立命|【修心處世】|修心處世/, '處世立命'],
  [/【修身養性】|修身養性/, '修身養性'],
  [/【人間修行】|人間修行/, '人間修行'],
  [/【丹道修真】|丹道修真/, '丹道修真'],
  [/【修心煉性】|修心煉性/, '修心煉性'],
  [/【道教經典】|道教經典/, '道教經典']
];

const TITLE_RULES = [
  [/全真龍門方便法門/, '龍門丹道'],
  [/龍門.*(丹|修煉|清修|上品|方便|心法)|龍門丹|丹.*龍門/, '龍門丹道'],
  [/紫微|斗數|命理|五術|姓名學|梅花易數|測字|鐵板神數|大六壬|八字|手面相|生肖|流年|命盤|命運|立命|陽宅|陰宅|風水/, '處世立命'],
  [/通靈|乩童|出馬仙|民俗|祭祀|信徒|信眾|活動|公告|報名|生日|冠巾行程|王船|生活|家庭|工作|人間|服務/, '人間修行'],
  [/百字輩|全真道脈|道脈|法脈|傳承|祖庭|丘處機|王重陽|長春真人|重陽祖師|龍門派|冠巾|全真教|全真道|太清宮|鹿邑|王常月/, '全真道脈'],
  [/丹道|內丹|修真|金丹|性命雙修|玄關|築基|煉精|煉氣|火候|爐鼎|藥物|命功|神炁|真炁|大江西派|西派|北宗|南宗|東派|中派|修煉次第|玉虛|金液還丹/, '丹道修真'],
  [/養生|氣功|導引|呼吸|吐納|睡眠|健康|身體|體質|五運六氣|祛疾|病|生命|性命|精氣神|六字真訣|固本/, '養生性命'],
  [/處世|為人|人生|因果|福報|善惡|是非|小人|貴人|名利|富貴|做人|世道|安命|人情|待人|自律|落魄|體諒|繁華|浮名|守拙|開竅|謀財/, '處世立命'],
  [/修身|修養|戒律|守戒|戒|德行|品德|正己|修己|言行|修德|善念|柔善|守道銘/, '修身養性'],
  [/修心|煉性|心性|心念|妄念|一念|靜心|靜守|定心|清靜|執著|情緒|欲望|心魔|念頭|塵垢|看淡|放下|守心|本心|煩惱|斂氣守心/, '修心煉性'],
  [/悟道|天道|大道|宇宙本源|陰陽消長|玄機|真諦|本源|萬物生滅|天地循環|道語|無常|榮枯|虛實|自然之道|虛靜歸真|浮生悟心|見道|歸真/, '悟道真詮'],
  [/道德經|清靜經|陰符經|悟真篇|黃庭經|莊子|老子|列子|周易|易經|道藏|雲笈七籤|道樞|想爾註|河上公|成玄英|黃帝陰符經|太上/, '道教經典']
];

const SERIES_RULES = [
  [/全真龍門方便法門/, '龍門丹道'],
  [/黃元吉 道德經|淺譯 道德經/, '道教經典'],
  [/通靈覺知|乩童文化/, '人間修行'],
  [/圓安論氣功/, '丹道修真'],
  [/畫符/, '道教經典'],
  [/紫微斗數/, '處世立命']
];

const HEAD_RULES = [
  [/全真龍門方便法門/, '龍門丹道'],
  [/龍門.*(丹|修煉|清修|上品|方便|心法)|龍門丹|丹.*龍門/, '龍門丹道'],
  [/紫微|斗數|命理|五術|姓名學|梅花易數|測字|鐵板神數|大六壬|八字|手面相|生肖|流年|命盤|命運|立命|陽宅|陰宅|風水/, '處世立命'],
  [/百字輩|全真道脈|道脈|法脈|傳承|祖庭|丘處機|王重陽|長春真人|重陽祖師|龍門派|冠巾|全真教|全真道|太清宮|鹿邑|王常月/, '全真道脈'],
  [/通靈|乩童|出馬仙|民俗|祭祀|信徒|信眾|活動|公告|報名|生日|冠巾行程|王船|生活|家庭|工作|人間|服務/, '人間修行'],
  [/道德經|清靜經|陰符經|悟真篇|黃庭經|莊子|老子|列子|周易|易經|道藏|雲笈七籤|道樞|想爾註|河上公|成玄英|黃帝陰符經|太上/, '道教經典'],
  [/丹道|內丹|修真|金丹|性命雙修|玄關|築基|煉精|煉氣|火候|爐鼎|藥物|命功|神炁|真炁|大江西派|西派|北宗|南宗|東派|中派|修煉次第|玉虛|金液還丹/, '丹道修真'],
  [/養生|氣功|導引|呼吸|吐納|睡眠|健康|身體|體質|五運六氣|祛疾|病|生命|性命|精氣神|六字真訣|固本/, '養生性命'],
  [/處世|為人|人生|因果|福報|善惡|是非|小人|貴人|名利|富貴|做人|世道|安命|人情|待人|自律|落魄|體諒|繁華|浮名|守拙|開竅|謀財/, '處世立命'],
  [/修身|修養|戒律|守戒|戒|德行|品德|正己|修己|言行|修德|善念|柔善|守道銘/, '修身養性'],
  [/修心|煉性|心性|心念|妄念|一念|靜心|靜守|定心|清靜|執著|情緒|欲望|心魔|念頭|塵垢|看淡|放下|守心|本心|煩惱|斂氣守心/, '修心煉性'],
  [/悟道|天道|大道|宇宙本源|陰陽消長|玄機|真諦|本源|萬物生滅|天地循環|道語|無常|榮枯|虛實|自然之道|虛靜歸真|浮生悟心|見道|歸真/, '悟道真詮']
];

const BODY_RULES = [
  [/全真龍門方便法門|龍門.*(丹|修煉|清修|上品|方便|心法)|龍門丹|丹.*龍門/, '龍門丹道'],
  [/百字輩|全真道脈|道脈|法脈|祖庭|丘處機|王重陽|長春真人|重陽祖師|龍門派|全真教|全真道|太清宮|鹿邑/, '全真道脈'],
  [/通靈|乩童|出馬仙|民俗|祭祀|信徒|信眾|活動|公告|報名|生日|冠巾|生活|家庭|工作|人間/, '人間修行'],
  [/紫微|斗數|命理|五術|姓名學|梅花易數|測字|鐵板神數|大六壬|八字|手面相|生肖|流年|命盤|風水/, '處世立命'],
  [/丹道|內丹|修真|金丹|性命雙修|玄關|築基|煉精|煉氣|火候|爐鼎|命功|神炁|真炁|大江西派|修煉次第/, '丹道修真'],
  [/養生|氣功|導引|呼吸|吐納|睡眠|健康|身體|體質|祛疾|病|生命|性命|精氣神|六字真訣/, '養生性命'],
  [/處世|為人|人生|因果|福報|善惡|是非|名利|富貴|做人|世道|安命|人情|待人|自律|落魄|體諒|浮名/, '處世立命'],
  [/修身|修養|戒律|守戒|德行|品德|正己|修己|言行|修德|善念/, '修身養性'],
  [/修心|煉性|心性|心念|妄念|一念|靜心|靜守|定心|清靜|執著|情緒|欲望|心魔|念頭|塵垢|放下|守心|本心|煩惱/, '修心煉性'],
  [/道德經|清靜經|陰符經|悟真篇|黃庭經|莊子|老子|列子|周易|易經|道藏|雲笈七籤|道樞|想爾註|河上公|成玄英|太上/, '道教經典'],
  [/悟道|天道|大道|宇宙本源|陰陽消長|玄機|真諦|本源|萬物生滅|天地循環|道語|無常|榮枯|虛實|自然之道|見道|歸真/, '悟道真詮']
];

const LEGACY_FALLBACKS = new Map([
  ['全真龍門方便法門', '龍門丹道'],
  ['丹道氣功', '丹道修真'],
  ['道法科儀', '道教經典'],
  ['符籙法門', '道教經典'],
  ['命理五術', '處世立命'],
  ['靈修覺知', '人間修行'],
  ['人生問答', '人間修行'],
  ['公告活動', '人間修行'],
  ['節日祭祀', '人間修行'],
  ['修行開示', '修心煉性'],
  ['經典法語', '悟道真詮'],
  ['未分類', '人間修行']
]);

const text = fs.readFileSync(DATA_FILE, 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(text, sandbox, { filename: 'posts.js' });

const posts = sandbox.window.YUANAN_POSTS || [];
const archiveMeta = sandbox.window.YUANAN_ARCHIVE_META || {};
const legacyCategories = loadLegacyCategories();
const { posts: publicPosts, dedupeStats } = dedupePosts(posts);

for (const post of publicPosts) {
  if (!post.legacyCategory && legacyCategories.has(post.id)) {
    post.legacyCategory = legacyCategories.get(post.id);
  }
  post.category = classify(post);
}

const categories = Object.fromEntries(CATEGORY_ORDER.map((category) => [category, 0]));
const series = {};
for (const post of publicPosts) {
  categories[post.category] += 1;
  if (post.series) series[post.series] = (series[post.series] || 0) + 1;
}

archiveMeta.categories = categories;
archiveMeta.series = sortCounts(series);
archiveMeta.categoryOrder = CATEGORY_ORDER;
archiveMeta.categoryModel = 'fixed-ten-topic-rules-2026-07-04';
archiveMeta.publicPosts = publicPosts.length;
archiveMeta.omittedDuplicatePosts = dedupeStats.totalRemoved;
archiveMeta.dedupedSeries = dedupeStats.series;

const output = [
  `window.YUANAN_ARCHIVE_META = ${JSON.stringify(archiveMeta, null, 2)};`,
  `window.YUANAN_POSTS = ${JSON.stringify(publicPosts)};`,
  ''
].join('\n');

fs.writeFileSync(DATA_FILE, output);

if (fs.existsSync(SUMMARY_FILE)) {
  const summary = JSON.parse(fs.readFileSync(SUMMARY_FILE, 'utf8'));
  summary.publicPosts = publicPosts.length;
  summary.categories = categories;
  summary.series = archiveMeta.series;
  summary.categoryOrder = CATEGORY_ORDER;
  summary.categoryModel = archiveMeta.categoryModel;
  summary.omittedDuplicatePosts = dedupeStats.totalRemoved;
  summary.dedupedSeries = dedupeStats.series;
  fs.writeFileSync(SUMMARY_FILE, `${JSON.stringify(summary, null, 2)}\n`);
}

console.log(JSON.stringify(categories, null, 2));
console.log(JSON.stringify(dedupeStats, null, 2));

function classify(post) {
  const title = post.title || '';
  const series = post.series || '';
  const tags = (post.tags || []).join(' ');
  const oldCategory = post.legacyCategory || post.category || '';
  const body = post.body || '';

  const titleMarked = firstMatch(title, MARKER_RULES);
  if (titleMarked) return titleMarked;

  const titleMatched = firstMatch(title, TITLE_RULES);
  if (titleMatched) return titleMatched;

  const leadMarked = firstMatch(body.slice(0, 240), MARKER_RULES);
  if (leadMarked) return leadMarked;

  const seriesMatched = firstMatch(series, SERIES_RULES);
  if (seriesMatched) return seriesMatched;

  const headText = compact([series, tags, oldCategory]);
  const headMatched = firstMatch(headText, HEAD_RULES);
  if (headMatched) return headMatched;

  const bodyMatched = firstMatch(body, BODY_RULES);
  if (bodyMatched) return bodyMatched;

  return LEGACY_FALLBACKS.get(oldCategory) || '人間修行';
}

function firstMatch(text, rules) {
  for (const [pattern, category] of rules) {
    if (pattern.test(text)) return category;
  }
  return '';
}

function compact(parts) {
  return parts.filter(Boolean).join('\n').normalize('NFKC');
}

function dedupePosts(items) {
  const dedupeSeries = new Map([
    ['全真龍門方便法門影片', yuananVideoKey]
  ]);
  const groups = new Map();
  const passthrough = [];

  for (const post of items) {
    const keyFn = dedupeSeries.get(post.series);
    if (!keyFn) {
      passthrough.push(post);
      continue;
    }
    const key = `${post.series}::${keyFn(post) || post.id}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(post);
  }

  const selected = [];
  const seriesStats = {};
  for (const group of groups.values()) {
    const representative = chooseRepresentative(group);
    selected.push(representative);
    const seriesName = representative.series;
    if (!seriesStats[seriesName]) {
      seriesStats[seriesName] = { before: 0, after: 0, removed: 0 };
    }
    seriesStats[seriesName].before += group.length;
    seriesStats[seriesName].after += 1;
    seriesStats[seriesName].removed += group.length - 1;
  }

  const merged = [...passthrough, ...selected].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  return {
    posts: merged,
    dedupeStats: {
      totalRemoved: Object.values(seriesStats).reduce((sum, item) => sum + item.removed, 0),
      series: seriesStats
    }
  };
}

function chooseRepresentative(group) {
  return [...group].sort((a, b) => representativeScore(b) - representativeScore(a))[0];
}

function representativeScore(post) {
  const text = normalizeVideoText(`${post.title}\n${post.body}`);
  let score = 0;
  if (/[（(](全|修正版)[）)]/.test(text)) score += 10000;
  if (!/第\s*[\d一二三四五六七八九十百零〇兩]+\s*部/.test(text)) score += 5000;
  score += Math.min(normalizeVideoText(post.body).length, 2000);
  score += (post.media || []).length * 100;
  score += Math.floor((post.timestamp || 0) / 1000000000000);
  return score;
}

function yuananVideoKey(post) {
  const source = normalizeVideoText(`${post.title}\n${post.body}`);
  const live = source.match(/圓安講道實況視頻\s*\([一二三四五六七八九十]+\)/);
  if (live) return live[0];

  const service = source.match(/圓安信徒服務視頻\s*\([一二三四五六七八九十]+\)/);
  if (service) return service[0];

  const lecture = source.match(/(?:《?全真龍門方便法門》?\s*)?(?:影片\s*)?第?([\d一二三四五六七八九十百零〇兩]+)講(?:\s*\((續|修正版|全)\))?/);
  if (source.includes('全真龍門方便法門') && lecture) {
    const suffix = lecture[2] && lecture[2] !== '全' ? `(${lecture[2]})` : '';
    return `全真龍門方便法門 第${lecture[1]}講${suffix}`;
  }

  return normalizeVideoText(post.body || post.title)
    .replace(/第\s*[\d一二三四五六七八九十百零〇兩]+\s*部.*/g, '')
    .trim();
}

function normalizeVideoText(text) {
  return (text || '')
    .normalize('NFKC')
    .replace(/#[\s　]*圓安講道[第\s\d一二三四五六七八九十百零〇兩]*部?/g, '')
    .replace(/#[\s　]*圓安講道/g, '')
    .replace(/[🎦☯️🧎🧘📶⏰👃]/gu, '')
    .replace(/安徽省?亳州市|高雄市/g, '')
    .replace(/[（]/g, '(')
    .replace(/[）]/g, ')')
    .replace(/\s+/g, ' ')
    .trim();
}

function sortCounts(counts) {
  return Object.fromEntries(Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'zh-Hant')));
}

function loadLegacyCategories() {
  try {
    const originalText = execFileSync('git', ['show', 'HEAD:data/posts.js'], {
      cwd: new URL('..', import.meta.url),
      encoding: 'utf8',
      maxBuffer: 80 * 1024 * 1024
    });
    const originalSandbox = { window: {} };
    vm.createContext(originalSandbox);
    vm.runInContext(originalText, originalSandbox, { filename: 'original-posts.js' });
    return new Map((originalSandbox.window.YUANAN_POSTS || []).map((post) => [post.id, post.category || '']));
  } catch {
    return new Map();
  }
}
