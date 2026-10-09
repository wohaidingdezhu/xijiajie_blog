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
