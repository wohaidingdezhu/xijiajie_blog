const assert = require('node:assert/strict');
const test = require('node:test');
const { getPosts, filterPosts, paginate, archivePosts } = require('../.vuepress/lib/posts');
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
