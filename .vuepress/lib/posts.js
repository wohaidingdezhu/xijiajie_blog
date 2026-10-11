// 首页、分类、搜索和归档共用同一份文章集合。
const values = value => Array.isArray(value) ? value : value ? [value] : [];
const categoryName = name => ({ Others: '工具与实践', node: 'Node.js', webpack: 'Webpack' }[name] || name);
const dateText = value => String(value || '').slice(0, 10);

function getPosts(pages) {
  return pages.filter(page => page.path && page.path.startsWith('/blogs/') &&
    page.title && page.frontmatter.date && page.frontmatter.publish !== false)
    .slice().sort((a, b) => dateText(b.frontmatter.date).localeCompare(dateText(a.frontmatter.date)) ||
      a.path.localeCompare(b.path));
}

function filterPosts(posts, { category = '', tag = '', query = '' } = {}) {
  const terms = String(query).trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return posts.filter(page => {
    const fm = page.frontmatter;
    const categories = values(fm.categories);
    const tags = values(fm.tags);
    const text = [page.title, fm.description, ...categories, ...categories.map(categoryName),
      ...tags, ...(page.headers || []).map(header => header.title)].join(' ').toLocaleLowerCase();
    return (!category || categories.includes(category)) && (!tag || tags.includes(tag)) &&
      terms.every(term => text.includes(term));
  });
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

module.exports = { values, categoryName, dateText, getPosts, filterPosts, paginate, archivePosts };
