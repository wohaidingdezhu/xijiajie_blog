const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const { pathToFileURL } = require('node:url');

async function loadComponent(relative) {
  const file = path.join(__dirname, '../.vuepress/components', relative);
  const script = fs.readFileSync(file, 'utf8').match(/<script>([\s\S]*?)<\/script>/)[1]
    .replace(/^import (\w+) from '[^']+\.vue'$/gm, 'const $1 = {};')
    .replace(/from '([^']+)'/g, (_, specifier) => `from '${pathToFileURL(path.resolve(path.dirname(file), specifier + '.js')).href}'`);
  const { default: component } = await import(`data:text/javascript;base64,${Buffer.from(script).toString('base64')}`);
  return component;
}

async function loadHeader(route) {
  const component = await loadComponent('blog/BlogHeader.vue');
  const targets = [];
  const router = {
    resolve: (target) => ({ route: { fullPath: target.path + (target.query.q ? '?q=' + target.query.q : '') } }),
    push: (target) => { targets.push(target); },
  };
  const instance = { $route: route, $router: router, $refs: {}, $nextTick: () => Promise.resolve(), ...component.methods };
  Object.assign(instance, component.data.call(instance));
  Object.defineProperty(instance, 'searchPath', { get: () => component.computed.searchPath.call(instance) });
  return { instance, targets };
}

test('分类、标签和归档内搜索保留范围，重置页码；文章页搜索全部文章', async () => {
  for (const [path, expected] of [
    ['/categories/JavaScript/', '/categories/JavaScript/'],
    ['/categories/JavaScript/page/2/', '/categories/JavaScript/'],
    ['/tag/JavaScript/', '/tag/JavaScript/'],
    ['/timeline/', '/timeline/'],
    ['/', '/'],
    ['/blogs/javascript/js-base/2.html', '/'],
  ]) {
    const { instance, targets } = await loadHeader({ path, fullPath: path + '?page=2', query: { page: '2' } });
    instance.query = ' bind ';
    instance.search();
    assert.deepEqual(targets, [{ path: expected, query: { q: 'bind' } }]);
  }
});

test('清空分类内搜索保留分类并恢复输入焦点，重复搜索不增加历史记录', async () => {
  const route = { path: '/categories/JavaScript/', fullPath: '/categories/JavaScript/?q=bind', query: { q: 'bind' } };
  const { instance, targets } = await loadHeader(route);
  instance.search();
  assert.equal(targets.length, 0);
  let focused = false;
  instance.$refs.search = { focus: () => { focused = true; } };
  await instance.clearSearch();
  assert.deepEqual(targets, [{ path: route.path, query: {} }]);
  assert.equal(focused, true);
  assert.equal(instance.query, '');
});

test('切换分类保留关键词并重置页码，无效查询不会进入新链接', async () => {
  const component = await loadComponent('blog/BlogSidebar.vue');
  for (const path of ['/', '/categories/Others/']) {
    const instance = { $route: { query: { q: ' Canvas ', page: '2' } } };
    assert.deepEqual(component.methods.categoryLink.call(instance, path), { path, query: { q: 'Canvas' } });
    for (const q of ['', '  ', undefined, ['Canvas', 'bind']]) {
      instance.$route.query.q = q;
      assert.deepEqual(component.methods.categoryLink.call(instance, path), { path, query: {} });
    }
  }
});

test('清除关键词保留分类或标签范围，单独清除标签则回到全部文章', async () => {
  const component = await loadComponent('GlobalLayout.vue');
  for (const path of ['/categories/JavaScript/', '/tag/JavaScript/', '/tag/JavaScript/page/2/']) {
    const instance = { query: 'bind', $route: { path } };
    assert.equal(component.computed.clearFilterPath.call(instance), path.replace(/page\/\d+\/$/, ''));
    instance.query = '';
    assert.equal(component.computed.clearFilterPath.call(instance), '/');
  }
});
