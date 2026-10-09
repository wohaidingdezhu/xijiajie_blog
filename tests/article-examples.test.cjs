const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const articles = {
  new: 'blogs/javascript/js-advanced/2.md',
  bind: 'blogs/javascript/js-base/2.md',
  call: 'blogs/javascript/js-base/3.md',
  timing: 'blogs/javascript/js-base/7.md',
};

function snippets(name) {
  const source = fs.readFileSync(path.join(__dirname, '..', articles[name]), 'utf8');
  return [...source.matchAll(/```js\n([\s\S]*?)\n```/g)].map((match) => match[1]);
}

function load(name, globals = {}) {
  const context = vm.createContext({ console: { log() {} }, ...globals });
  for (const [index, source] of snippets(name).entries()) {
    new vm.Script(source, { filename: `${articles[name]}:example-${index + 1}` });
    vm.runInContext(source, context);
  }
  return context;
}

function clock() {
  let now = 0;
  let nextId = 0;
  const pending = new Map();
  return {
    performance: { now: () => now },
    setTimeout(fn, wait) {
      const id = ++nextId;
      pending.set(id, { fn, at: now + wait });
      return id;
    },
    clearTimeout(id) { pending.delete(id); },
    advance(ms) {
      const end = now + ms;
      while (true) {
        const entry = [...pending].filter(([, task]) => task.at <= end)
          .sort((a, b) => a[1].at - b[1].at)[0];
        if (!entry) break;
        pending.delete(entry[0]);
        now = entry[1].at;
        entry[1].fn();
      }
      now = end;
    },
    pending: () => pending.size,
  };
}

function eventTarget() {
  const listeners = new Map();
  return {
    value: '最后的输入',
    addEventListener(type, fn) { listeners.set(type, fn); },
    removeEventListener(type, fn) {
      if (listeners.get(type) === fn) listeners.delete(type);
    },
    emit(type) { listeners.get(type)?.call(this, { target: this }); },
    listeners,
  };
}

function timingExamples() {
  const timer = clock();
  const input = eventTarget();
  const window = eventTarget();
  const messages = [];
  const context = load('timing', {
    ...timer, document: { querySelector: () => input }, window,
    console: { log: (...args) => messages.push(args) },
  });
  return { context, timer, input, window, messages };
}

test('new 文章实际代码保留参数、直接原型和构造函数返回值', () => {
  const { newFactory } = load('new');
  function Person(name, age) { this.name = name; this.age = age; }
  const person = newFactory(Person, '小明', 18);
  assert.equal(person.name, '小明');
  assert.equal(person.age, 18);
  assert.equal(Object.getPrototypeOf(person), Person.prototype);
  assert.ok(person instanceof Person);
  for (const returned of [null, undefined, 0, false, 'text']) {
    assert.equal(newFactory(function () { this.ready = true; return returned; }).ready, true);
  }
  for (const returned of [{ ready: true }, function () {}]) {
    assert.equal(newFactory(function () { return returned; }), returned);
  }
  const context = load('new');
  assert.equal(vm.runInContext('function Plain() {} Plain.prototype = 1; Object.getPrototypeOf(newFactory(Plain)) === Object.prototype', context), true);
  assert.throws(() => newFactory(null), { name: 'TypeError' });
});

test('call/apply 文章实际代码支持严格 this、冻结对象和类数组参数', () => {
  const { callFactory, applyFactory, callOnObject } = load('call');
  function readThis() { 'use strict'; return this; }
  for (const receiver of [null, undefined, 0, false, 'text', Object.freeze({})]) {
    assert.equal(callFactory(readThis, receiver), receiver);
    assert.equal(applyFactory(readThis, receiver, null), receiver);
  }
  assert.equal(applyFactory((a, b) => a + b, null, { 0: 2, 1: 3, length: 2 }), 5);
  assert.equal(applyFactory(function () { return arguments.length; }, null, undefined), 0);
  assert.throws(() => applyFactory(() => {}, null, 'ab'), { name: 'TypeError' });
  assert.throws(() => callFactory(null, {}), { name: 'TypeError' });
  const receiver = { fn: '已有属性' };
  assert.equal(callOnObject(function (n) { return this.fn + n; }, receiver, 2), '已有属性2');
  assert.throws(() => callOnObject(() => { throw new Error('原函数异常'); }, receiver), /原函数异常/);
  assert.deepEqual(Reflect.ownKeys(receiver), ['fn']);
  assert.throws(() => callOnObject(readThis, Object.freeze({})), { name: 'TypeError' });
});

test('bind 文章实际代码保留返回值、预置参数和构造调用', () => {
  const { bindFactory } = load('bind');
  const receiver = { base: 10 };
  const add = bindFactory(function (a, b) { return this.base + a + b; }, receiver, 2);
  assert.equal(add.call({ base: 100 }, 3), 15);
  function Person(name, age) { this.name = name; this.age = age; }
  const BoundPerson = bindFactory(Person, receiver, '小明');
  const person = new BoundPerson(18);
  assert.equal(person.name, '小明');
  assert.equal(person.age, 18);
  assert.ok(person instanceof Person);
  assert.ok(person instanceof BoundPerson);
  assert.deepEqual(receiver, { base: 10 });
  class User { constructor(name) { this.name = name; } }
  assert.equal(new (bindFactory(User, null, '小明'))().name, '小明');
  const returned = {};
  assert.equal(new (bindFactory(function () { return returned; }, null))(), returned);
  assert.throws(() => new (bindFactory(() => {}, null))(), { name: 'TypeError' });
  assert.throws(() => bindFactory(null, {}), { name: 'TypeError' });
});

test('防抖实际代码只执行最后一次参数和 this，并可取消', () => {
  const { context: { debounce }, timer } = timingExamples();
  const calls = [];
  const wrapped = debounce(function (value) { calls.push([this, value]); });
  const first = {}, last = {};
  wrapped.call(first, 1);
  timer.advance(100);
  wrapped.call(first, 2);
  timer.advance(100);
  wrapped.call(last, 3);
  timer.advance(299);
  assert.equal(calls.length, 0);
  timer.advance(1);
  assert.deepEqual(calls, [[last, 3]]);
  wrapped(4);
  wrapped.cancel();
  timer.advance(300);
  assert.equal(calls.length, 1);
  assert.equal(timer.pending(), 0);
});

test('节流实际代码首次立即执行，边界可执行，没有尾部调用', () => {
  const { context: { throttle }, timer } = timingExamples();
  const receiver = {};
  const calls = [];
  const wrapped = throttle(function (value) {
    calls.push([this, value]);
    wrapped('同步重入');
    return value;
  });
  assert.equal(wrapped.call(receiver, 1), 1);
  timer.advance(100);
  assert.equal(wrapped(2), undefined);
  timer.advance(100);
  assert.equal(wrapped.call(receiver, 3), 3);
  timer.advance(50);
  wrapped(4);
  timer.advance(1000);
  assert.deepEqual(calls, [[receiver, 1], [receiver, 3]]);
  wrapped.cancel();
  assert.equal(wrapped.call(receiver, 5), 5);
  assert.equal(timer.pending(), 0);
});

test('文章监听示例使用包装函数，销毁时移除监听并取消等待', () => {
  const { context, timer, input, window, messages } = timingExamples();
  input.emit('input');
  input.emit('input');
  window.emit('scroll');
  window.emit('scroll');
  assert.equal(messages.length, 1);
  timer.advance(300);
  assert.equal(messages.length, 2);
  input.emit('input');
  context.dispose();
  assert.equal(input.listeners.size, 0);
  assert.equal(window.listeners.size, 0);
  timer.advance(300);
  assert.equal(messages.length, 2);
});
