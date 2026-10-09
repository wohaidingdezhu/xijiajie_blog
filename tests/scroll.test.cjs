const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

test('中文和带特殊字符的目录锚点可跳转，保留原有滚动行为', async (t) => {
  const source = fs.readFileSync(path.join(__dirname, '../.vuepress/enhanceApp.js'), 'utf8');
  const { default: enhanceApp } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const originalDocument = global.document;
  const originalWindow = global.window;
  t.after(() => {
    global.document = originalDocument;
    global.window = originalWindow;
  });
  const ids = new Set(['体验', '1-类型:string']);
  global.document = {
    getElementById: (id) => ids.has(id) ? { getBoundingClientRect: () => ({ top: 120 }) } : null,
  };
  global.window = { pageYOffset: 400 };
  let disableScroll = false;
  const saved = { x: 0, y: 50 };
  const router = { options: { scrollBehavior: (to, from, position) => position || 'default' } };
  enhanceApp({ Vue: { $vuepress: { $get: () => disableScroll } }, router });
  const scroll = router.options.scrollBehavior;

  for (const hash of ['#体验', '#%E4%BD%93%E9%AA%8C', '#1-类型:string']) {
    assert.deepEqual(scroll({ hash }, {}), { x: 0, y: 520 });
  }
  assert.equal(scroll({ hash: '#missing' }, {}), false);
  assert.equal(scroll({ hash: '#%ZZ' }, {}), false);
  assert.equal(scroll({ hash: '' }, {}), 'default');
  assert.equal(scroll({ hash: '#体验' }, {}, saved), saved);
  disableScroll = true;
  assert.equal(scroll({ hash: '#体验' }, {}), false);
});

test('主题目录渲染只更新高亮，不创建换页后失效的滚动任务', async () => {
  const Vue = require('vue');
  const Chain = require('webpack-chain');
  const config = new Chain();
  config.resolve.alias.set('@theme', '/original-theme');
  require('../.vuepress/config.js').chainWebpack(config);
  const aliases = config.resolve.alias.entries();
  assert.equal(Object.keys(aliases)[0], '@theme/components/SubSidebar$');
  assert.equal(aliases['@theme'], '/original-theme');
  assert.equal(aliases['@theme/components/SubSidebar$'],
    path.join(__dirname, '../.vuepress/theme-overrides/SubSidebar.vue'));
  const dataUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
  const helpers = dataUrl(fs.readFileSync(require.resolve('vuepress-theme-reco/helpers/utils.js'), 'utf8'));
  const script = (file) => fs.readFileSync(file, 'utf8').match(/<script>\s*([\s\S]*?)<\/script>/)[1];
  const parent = dataUrl(script(require.resolve('vuepress-theme-reco/components/SubSidebar.vue'))
    .replace("'@theme/helpers/utils'", JSON.stringify(helpers)));
  const source = script(path.join(__dirname, '../.vuepress/theme-overrides/SubSidebar.vue'))
    .replace("'vuepress-theme-reco/components/SubSidebar.vue'", JSON.stringify(parent))
    .replace("'vuepress-theme-reco/helpers/utils'", JSON.stringify(helpers));
  const { default: component } = await import(dataUrl(source));
  const instance = new (Vue.extend(component))();
  instance.$showSubSideBar = true;
  instance.$page = { path: '/first.html', headers: [{ title: '中文章节', slug: '中文章节', level: 2 }] };
  instance.$route = { path: '/first.html', hash: '#中文章节' };
  const originalTimeout = global.setTimeout;
  let scheduled = 0;
  global.setTimeout = () => { scheduled += 1; };
  try {
    const render = () => instance.$options.render.call(instance, instance.$createElement);
    assert.equal(render().children[0].data.class.active, true);
    instance.$route = { path: '/second.html', hash: '' };
    instance.$page = { path: '/second.html', headers: [{ title: '下一篇', slug: '下一篇', level: 2 }] };
    assert.equal(render().children[0].data.class.active, false);
    assert.equal(scheduled, 0);
  } finally {
    global.setTimeout = originalTimeout;
    instance.$destroy();
  }
});
