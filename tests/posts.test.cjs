const assert = require('node:assert/strict');
const test = require('node:test');
const { getPosts, filterPosts, paginate, archivePosts, categoryPosts, sortCategories, searchSnippet, highlightText } = require('../.vuepress/lib/posts');
const post = (path, date, categories, description = '', tags = []) => ({
  path: '/blogs/' + path, title: path, frontmatter: { date, categories, description, tags }
});

test('首页、归档和搜索排除草稿及非文章，并且不修改原始页面集合', () => {
  const pages = [post('older', '2021-12-01', ['JavaScript']), post('newer', '2022-11-01', ['Others']),
    { ...post('draft', '2026-10-10', ['JavaScript']), frontmatter: { date: '2026-10-10', publish: false } },
    { path: '/', title: '首页', frontmatter: { home: true } }];
  const posts = getPosts(pages);
  assert.deepEqual(posts.map(p => p.title), ['newer', 'older']);
  assert.equal(pages[0].title, 'older');
  assert.deepEqual(archivePosts(posts).map(g => [g.year, g.posts.length]), [['2022', 1], ['2021', 1]]);
});

test('搜索可组合分类、标签与多个关键词，匹配摘要、标题和文章小节', () => {
  const a = post('Canvas', '2022-11-01', ['Others'], '高清屏绘图与动画清理', ['Canvas']);
  a.headers = [{ title: '完整例子：一个简单画板' }];
  const b = post('bind', '2021-12-12', 'JavaScript', '函数绑定', ['JavaScript']);
  assert.deepEqual(filterPosts([a, b], { query: 'canvas 画板' }), [a]);
  assert.deepEqual(filterPosts([a, b], { query: '工具与实践', category: 'Others', tag: 'Canvas' }), [a]);
  assert.deepEqual(filterPosts([a, b], { query: 'bind', category: 'Others' }), []);
  assert.deepEqual(filterPosts([a, b], { query: '函数', category: 'JavaScript' }), [b]);
});

test('分页处理无效页码、越界与筛选后的空列表', () => {
  const posts = Array.from({ length: 18 }, (_, i) => i);
  assert.deepEqual(paginate(posts, '2').items, [8, 9, 10, 11, 12, 13, 14, 15]);
  assert.deepEqual(paginate(posts, '999'), { total: 3, current: 3, items: [16, 17] });
  for (const value of ['bad', '-1', '0']) assert.equal(paginate(posts, value).current, 1);
  assert.deepEqual(paginate([], 6), { total: 1, current: 1, items: [] });
});

test('正文独有关键词可被找到，多词匹配可跨标题与正文，分类和标签筛选仍有效', () => {
  const canvas = post('Canvas', '2022-11-01', ['Others'], '绘图练习', ['Canvas']);
  const bind = post('bind', '2022-12-01', ['JavaScript']);
  const index = { [canvas.path]: '这里用 Pointer Events 统一鼠标、触摸和触控笔输入。' };
  assert.deepEqual(filterPosts([bind, canvas], { query: 'Pointer Events' }, index), [canvas]);
  assert.deepEqual(filterPosts([bind, canvas], { query: 'canvas Pointer', category: 'Others', tag: 'Canvas' }, index), [canvas]);
  assert.deepEqual(filterPosts([bind, canvas], { query: 'Pointer', category: 'JavaScript' }, index), []);
  assert.deepEqual(filterPosts([bind, canvas], { query: 'unknown' }, index), []);
});

test('标题命中优先于正文，相关度相同保持发布时间顺序', () => {
  const title = post('Pointer', '2021-01-01', ['Others']);
  const newer = post('newer', '2022-01-01', ['Others']);
  const older = post('older', '2021-01-01', ['Others']);
  const index = { [newer.path]: 'Pointer', [older.path]: 'Pointer' };
  assert.deepEqual(filterPosts([newer, older, title], { query: 'pointer' }, index), [title, newer, older]);
});

test('搜索片段保留正文上下文，对正则字符和 HTML 使用安全文本高亮', () => {
  const article = post('test', '2022-01-01', ['Others'], '默认摘要');
  const body = 'let pointerId = null; ' + '开头'.repeat(100) + '这里用 Pointer Events 处理输入。' + '后续'.repeat(100);
  const snippet = searchSnippet(article, 'Pointer Events', { [article.path]: body });
  assert.ok(snippet.includes('这里用 Pointer Events 处理输入。'));
  assert.ok(snippet.startsWith('…') && snippet.endsWith('…'));
  assert.equal(searchSnippet(article, 'test'), '默认摘要');
  const text = '<script>alert(1)</script> a.b [foo]';
  const parts = highlightText(text, 'a.b [foo]');
  assert.equal(parts.map(part => part.text).join(''), text);
  assert.deepEqual(parts.filter(part => part.matched).map(part => part.text), ['a.b', '[foo]']);
});

test('分类顺序固定，同分类导航沿用列表顺序且不修改输入', () => {
  const categories = ['Others', 'webpack', 'TypeScript', 'node', 'JavaScript'].map(name => ({ name }));
  assert.deepEqual(sortCategories(categories).map(item => item.name), ['JavaScript', 'TypeScript', 'node', 'webpack', 'Others']);
  assert.equal(categories[0].name, 'Others');
  const posts = getPosts([post('1', '2021-01-01', ['Others']), post('3', '2022-11-01', ['Others']), post('2', '2022-02-10', ['Others']), post('js', '2022-12-01', ['JavaScript'])]);
  assert.deepEqual(categoryPosts(posts, 'Others').map(item => item.title), ['3', '2', '1']);
});

test('搜索片段停留在命中的段落，不拼接前一个代码块', () => {
  const article = post('Canvas', '2022-11-01', ['Others']);
  const index = { [article.path]: ['let pointerId = null; clearBoard(); </script> </html>', '这里用 Pointer Events 统一鼠标、触摸和触控笔输入。'] };
  assert.deepEqual(filterPosts([article], { query: 'Pointer Events' }, index), [article]);
  assert.equal(searchSnippet(article, 'Pointer Events', index), '这里用 Pointer Events 统一鼠标、触摸和触控笔输入。');
});
