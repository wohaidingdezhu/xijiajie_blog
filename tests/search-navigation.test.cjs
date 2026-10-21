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
  // 静态页面先以空查询完成挂载，再从 URL 恢复输入，模拟浏览器挂载阶段。
  const previousWindow = globalThis.window;
  globalThis.window = { addEventListener() {} };
  try {
    component.mounted.call(instance);
  } finally {
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
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

test('搜索结果切换标签保留关键词并重置页码，普通浏览不附加搜索条件', async () => {
  const component = await loadComponent('blog/ArticleList.vue');
  const instance = {
    $tags: { list: [{ name: 'JavaScript', path: '/tag/JavaScript/' }] },
    $route: { query: { q: 'bind', page: '2' } },
    query: 'bind',
  };
  assert.deepEqual(component.methods.tagPath.call(instance, 'JavaScript'), {
    path: '/tag/JavaScript/', query: { q: 'bind' },
  });
  assert.deepEqual(component.methods.tagPath.call(instance, '不存在'), { path: '/', query: { q: 'bind' } });
  instance.query = '';
  assert.deepEqual(component.methods.tagPath.call(instance, 'JavaScript'), { path: '/tag/JavaScript/', query: {} });
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

async function renderComponent(relative, options) {
  const Vue = require('vue');
  const { compileToFunctions, parseComponent } = require('vue-template-compiler');
  const { createRenderer } = require('vue-server-renderer');
  const component = await loadComponent(relative);
  const source = fs.readFileSync(path.join(__dirname, '../.vuepress/components', relative), 'utf8');
  const compiled = compileToFunctions(parseComponent(source).template.content);
  const stub = { render: h => h('div') };
  return createRenderer().renderToString(new Vue({
    ...component,
    ...compiled,
    components: {
      ...Object.fromEntries(Object.keys(component.components || {}).map(name => [name, stub])),
      RouterLink: { render(h) { return h('a', this.$slots.default); } },
    },
    ...options,
  }));
}

test('搜索标题高亮忽略大小写，特殊字符保持安全文本，清空后不再高亮', async () => {
  const post = {
    path: '/blogs/canvas.html', title: 'Canvas <img src=x> a.b',
    frontmatter: { date: '2022-11-01', categories: ['Others'], tags: [] },
  };
  for (const query of ['canvas a.b', '']) {
    const html = await renderComponent('blog/ArticleList.vue', {
      propsData: { posts: [post], query },
      beforeCreate() { this.$route = { path: '/', query: {} }; },
    });
    const title = html.match(/<h2>([\s\S]*?)<\/h2>/)[1];
    assert.ok(title.includes('&lt;img src=x&gt;'));
    assert.ok(!title.includes('<img'));
    if (query) {
      assert.ok(title.includes('<mark>Canvas</mark>'));
      assert.ok(title.includes('<mark>a.b</mark>'));
    } else {
      assert.ok(!title.includes('<mark>'));
    }
  }
});

test('正文索引加载时隐藏未完整的计数，清空关键词立即恢复文章总数', async () => {
  for (const q of ['canvas', '']) {
    const html = await renderComponent('GlobalLayout.vue', {
      data: () => ({ clientReady: true, menuOpen: false, searchIndex: null, searchLoading: true, searchFailed: false }),
      beforeCreate() {
        this.$route = { path: '/', query: { q }, meta: {} };
        this.$page = { path: '/', frontmatter: { home: true } };
        this.$site = { pages: [{ path: '/blogs/canvas.html', title: 'Canvas', frontmatter: { date: '2022-11-01' } }] };
        this.$themeConfig = { libraryUrl: 'https://example.com/' };
      },
    });
    assert.equal(html.includes('class="collection-count"'), !q);
    assert.equal(html.includes('正在搜索正文'), !!q);
    if (!q) assert.ok(html.includes('<strong>1</strong>'));
  }
});
