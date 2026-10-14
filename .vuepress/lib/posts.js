// 首页、分类、搜索和归档共用同一份文章集合。
const values = value => Array.isArray(value) ? value : value ? [value] : [];
const categoryName = name => ({ Others: '工具与实践', node: 'Node.js', webpack: 'Webpack' }[name] || name);
const dateText = value => String(value || '').slice(0, 10);
const categoryOrder = ['JavaScript', 'TypeScript', 'node', 'webpack', 'Others'];
const queryTerms = query => [...new Set(String(query || '').trim().toLowerCase().split(/\s+/).filter(Boolean))];
const searchBody = entry => Array.isArray(entry) ? entry.join(' ') : entry || '';

function sortCategories(categories) {
  const rank = name => categoryOrder.includes(name) ? categoryOrder.indexOf(name) : categoryOrder.length;
  return categories.slice().sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name));
}

// 列表、侧栏及上一篇/下一篇共用发布时间倒序。
function categoryPosts(posts, category) {
  return posts.filter(post => values(post.frontmatter.categories).includes(category));
}

function getPosts(pages) {
  return pages.filter(page => page.path && page.path.startsWith('/blogs/') &&
    page.title && page.frontmatter.date && page.frontmatter.publish !== false)
    .slice().sort((a, b) => dateText(b.frontmatter.date).localeCompare(dateText(a.frontmatter.date)) ||
      a.path.localeCompare(b.path));
}

function filterPosts(posts, { category = '', tag = '', query = '' } = {}, index = {}) {
  const terms = queryTerms(query);
  const results = posts.map((page, order) => {
    const fm = page.frontmatter;
    const categories = values(fm.categories);
    const tags = values(fm.tags);
    const fields = [
      [page.title || '', 8], [fm.description || '', 4],
      [[...categories, ...categories.map(categoryName), ...tags, ...tags.map(categoryName), ...(page.headers || []).map(header => header.title)].join(' '), 2],
      [searchBody(index[page.path]), 1]
    ].map(([text, weight]) => [text.toLowerCase(), weight]);
    const matched = (!category || categories.includes(category)) && (!tag || tags.includes(tag)) &&
      terms.every(term => fields.some(([text]) => text.includes(term)));
    const score = terms.reduce((sum, term) => sum + fields.reduce((best, [text, weight]) => Math.max(best, text.includes(term) ? weight : 0), 0), 0);
    return { page, order, score, matched };
  });
  return results.filter(result => result.matched).sort((a, b) => b.score - a.score || a.order - b.order).map(result => result.page);
}

function searchSnippet(page, query, index = {}) {
  const terms = queryTerms(query);
  const entry = index[page.path] || '';
  const blocks = Array.isArray(entry) ? entry : [entry];
  const phraseText = terms.join(' ');
  const exactBlock = phraseText && blocks.find(block => block.toLowerCase().includes(phraseText));
  const coverage = block => terms.filter(term => block.toLowerCase().includes(term)).length;
  // 从命中的段落提取片段，避免拼接到前一个代码块的结尾。
  const body = exactBlock || blocks.slice().sort((a, b) => coverage(b) - coverage(a))[0] || '';
  const lower = body.toLowerCase();
  const positions = terms.map(term => lower.indexOf(term)).filter(position => position >= 0);
  if (!positions.length) return page.frontmatter.description || (page.headers || []).map(header => header.title).join(' · ');
  // 连续短语优先，避免 Pointer Events 的片段只落在更早的 pointerId 代码上。
  const phrase = lower.indexOf(phraseText);
  const position = phrase >= 0 ? phrase : positions.slice().sort((a, b) => {
    const coverage = offset => terms.filter(term => lower.slice(Math.max(0, offset - 40), Math.max(0, offset - 40) + 180).includes(term)).length;
    return coverage(b) - coverage(a) || a - b;
  })[0];
  const start = Math.max(0, position - 40);
  const end = Math.min(body.length, start + 180);
  return (start ? '…' : '') + body.slice(start, end) + (end < body.length ? '…' : '');
}

// 使用文本节点输出匹配内容，不把文章内容当 HTML 注入。
function highlightText(text, query) {
  const terms = queryTerms(query).sort((a, b) => b.length - a.length);
  if (!terms.length) return [{ text, matched: false }];
  const escaped = terms.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const expression = new RegExp(escaped.join('|'), 'gi');
  const parts = [];
  let cursor = 0;
  let match;
  while ((match = expression.exec(text))) {
    if (match.index > cursor) parts.push({ text: text.slice(cursor, match.index), matched: false });
    parts.push({ text: match[0], matched: true });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) parts.push({ text: text.slice(cursor), matched: false });
  return parts;
}

function paginate(posts, page, size = 8) {
  const total = Math.max(1, Math.ceil(posts.length / size));
  const current = Math.min(total, Math.max(1, Math.floor(Number(page) || 1)));
  return { total, current, items: posts.slice((current - 1) * size, current * size) };
}

function archivePosts(posts) {
  const groups = new Map();
  for (const post of posts) {
    const year = dateText(post.frontmatter.date).slice(0, 4);
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(post);
  }
  return [...groups].sort(([a], [b]) => b.localeCompare(a)).map(([year, posts]) => ({ year, posts }));
}

module.exports = { values, categoryName, dateText, getPosts, filterPosts, paginate, archivePosts, sortCategories, categoryPosts, queryTerms, searchSnippet, highlightText };
