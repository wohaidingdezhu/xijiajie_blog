const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { createSideBarConfig } = require('../.vuepress/util');

test('侧边栏只收集 Markdown 文件，并按文件名数字排序', (t) => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-sidebar-'));
  const originalCwd = process.cwd();
  t.after(() => {
    process.chdir(originalCwd);
    fs.rmSync(fixture, { recursive: true, force: true });
  });
  fs.mkdirSync(path.join(fixture, 'articles'));
  for (const name of ['10.md', '2.md', '1.md', '.DS_Store', 'cover.png', 'draft.md.bak']) {
    fs.writeFileSync(path.join(fixture, 'articles', name), '');
  }
  fs.mkdirSync(path.join(fixture, 'articles', 'nested.md'));
  process.chdir(fixture);

  assert.deepEqual(createSideBarConfig('文章', '/articles', false), {
    title: '文章',
    collapsable: false,
    children: ['/articles/1', '/articles/2', '/articles/10']
  });
});
