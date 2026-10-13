const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

async function setup(t) {
  const source = fs.readFileSync(path.join(__dirname, '../.vuepress/lib/code-copy.js'), 'utf8');
  const { mountCodeCopy } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const originals = Object.fromEntries(['document', 'window', 'navigator'].map(key => [key, Object.getOwnPropertyDescriptor(global, key)]));
  const elements = [];
  const copied = [];
  const code = 'const 中文 = "hello";\nconsole.log(中文);\n';
  let selected;
  global.document = {
    createElement(type) {
      const element = {
        type, style: {}, events: {}, textContent: '', removed: false, focused: false,
        setAttribute() {},
        addEventListener(name, callback) { this.events[name] = callback; },
        removeEventListener(name) { delete this.events[name]; },
        select() { selected = this; },
        focus() { this.focused = true; },
        remove() { this.removed = true; },
      };
      elements.push(element);
      return element;
    },
    body: { appendChild() {} },
    execCommand(command) { assert.equal(command, 'copy'); copied.push(selected.value); return true; },
  };
  global.window = { isSecureContext: true };
  Object.defineProperty(global, 'navigator', { configurable: true, value: { clipboard: { writeText: async value => copied.push(value) } } });
  const pre = { textContent: code, parentElement: { appendChild() {} } };
  const cleanup = mountCodeCopy({ querySelectorAll: () => [pre] });
  t.after(() => {
    cleanup();
    for (const [key, descriptor] of Object.entries(originals)) {
      if (descriptor) Object.defineProperty(global, key, descriptor);
      else delete global[key];
    }
  });
  return { code, copied, elements, pre, button: elements[0], cleanup };
}

test('复制保留代码换行和中文，成功时无需创建备用输入框', async t => {
  const { code, copied, elements, pre, button } = await setup(t);
  await button.events.click();
  assert.deepEqual(copied, [code]);
  assert.equal(button.textContent, '已复制');
  assert.equal(elements.length, 1);
  assert.equal(pre.tabIndex, 0);
});

test('复制接口拒绝、缺失或非安全页面时尝试备用方式，并移除输入框与恢复焦点', async t => {
  const { code, copied, elements, button } = await setup(t);
  for (const mode of ['rejected', 'missing', 'insecure']) {
    navigator.clipboard = mode === 'missing' ? undefined : { writeText: async () => { throw new Error('denied'); } };
    window.isSecureContext = mode !== 'insecure';
    await button.events.click();
    assert.equal(copied.at(-1), code, mode);
    assert.equal(elements.at(-1).type, 'textarea', mode);
    assert.equal(elements.at(-1).removed, true, mode);
    assert.equal(button.focused, true, mode);
    assert.equal(button.textContent, '已复制', mode);
  }
  assert.equal(copied.length, 3);
});

test('备用方式返回失败或抛错时提示手动复制，仍清理输入框', async t => {
  const { button, elements } = await setup(t);
  navigator.clipboard.writeText = async () => { throw new Error('denied'); };
  for (const fallback of [() => false, () => { throw new Error('unsupported'); }]) {
    document.execCommand = fallback;
    await button.events.click();
    assert.equal(button.textContent, '请手动选择复制');
    assert.equal(elements.at(-1).removed, true);
  }
});

test('换页后忽略尚未完成的复制请求，不创建备用输入框或更新旧按钮', async t => {
  const { button, elements, cleanup } = await setup(t);
  let reject;
  navigator.clipboard.writeText = () => new Promise((resolve, fail) => { reject = fail; });
  const pending = button.events.click();
  cleanup();
  reject(new Error('denied'));
  await pending;
  assert.equal(button.removed, true);
  assert.equal(button.events.click, undefined);
  assert.equal(button.textContent, '复制代码');
  assert.equal(elements.length, 1);
});
