const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const sharp = require('sharp');
const { plainText } = require('../.vuepress/lib/content');
const { applySeo, sitemap } = require('../.vuepress/lib/seo');
const { prepareImages, imageHtml } = require('../.vuepress/plugins/blog-content');

test('正文索引包含段落和代码，去除图片地址、HTML 属性及隐藏脚本', () => {
  const text = plainText('## 画板\n这里用 **Pointer Events**。\n```js\nctx.setTransform(dpr, 0, 0, dpr, 0, 0);\n```\n<img src="/private-image.png" alt="示意图">\n<script>hiddenSecret</script>\n<div>可见 &amp; 文本</div>');
  assert.ok(text.includes('Pointer Events') && text.includes('ctx.setTransform'));
  assert.ok(text.includes('可见 & 文本'));
  assert.ok(!text.includes('/private-image.png') && !text.includes('hiddenSecret'));
});

test('分享信息沿用文章地址与原始发布日期，站点地图排除草稿、404 和重复分页', () => {
  const origin = 'https://example.com/';
  const site = { title: '博客', description: '学习记录' };
  const pages = [
    { path: '/', frontmatter: { home: true } },
    { path: '/blogs/canvas.html', title: 'Canvas 基本使用', frontmatter: { date: '2022-11-01', description: '画板练习' } },
    { path: '/blogs/draft.html', frontmatter: { date: '2022-11-01', publish: false } },
    { path: '/404.html', frontmatter: {} },
    { path: '/page/2/', frontmatter: {} },
    { path: '/tag/node/', frontmatter: {} }
  ];
  for (const page of pages) applySeo(page, site, origin);
  assert.equal(pages[1].seo.canonical, origin + 'blogs/canvas.html');
  assert.equal(pages[1].frontmatter.meta.find(meta => meta.property === 'og:title').content, 'Canvas 基本使用');
  assert.equal(pages[1].frontmatter.meta.find(meta => meta.property === 'article:published_time').content, '2022-11-01T00:00:00.000Z');
  assert.equal(pages[4].seo.canonical, origin);
  assert.equal(pages[5].seo.title, 'Node.js相关文章');
  const xml = sitemap(pages, origin);
  assert.ok(xml.includes('/blogs/canvas.html') && xml.includes('/tag/node/'));
  assert.ok(!xml.includes('draft') && !xml.includes('404') && !xml.includes('/page/2/'));
});

test('正文图片支持 Vue 绑定和静态地址，保留作者尺寸并给外链图片延迟加载', () => {
  const images = { '/diagram.png': { url: '/assets/images/hash.webp', width: 1200, height: 600 } };
  const html = imageHtml('<img :src="$withBase(\'/diagram.png\')"><img src="/diagram.png" width="200"><img src="https://example.com/p.png">', images, '/');
  assert.ok(html.includes(':src="$withBase(\'/assets/images/hash.webp\')"'));
  assert.ok(html.includes('width="1200" height="600"'));
  assert.ok(html.includes('src="/assets/images/hash.webp" width="200"'));
  assert.equal((html.match(/loading="lazy"/g) || []).length, 3);
  assert.equal((html.match(/decoding="async"/g) || []).length, 3);
});

test('大图压缩保留像素和原文件，并复用相同内容的构建缓存', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'blog-images-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const publicDir = path.join(root, 'public');
  const cacheDir = path.join(root, 'cache');
  await fs.mkdir(publicDir);
  const file = path.join(publicDir, 'diagram.png');
  await sharp({ create: { width: 800, height: 400, channels: 4, background: '#26765e' } }).png({ compressionLevel: 0 }).toFile(file);
  const source = { _strippedContent: '<img :src="$withBase(\'/diagram.png\')">' };
  const first = (await prepareImages([source], publicDir, cacheDir))['/diagram.png'];
  assert.ok(first.output && first.url.endsWith('.webp'));
  const originalPixels = await sharp(file).ensureAlpha().raw().toBuffer();
  const compressedPixels = await sharp(first.output).ensureAlpha().raw().toBuffer();
  assert.ok(originalPixels.equals(compressedPixels), '无损压缩后像素必须相同');
  const original = await fs.stat(file);
  const second = (await prepareImages([source], publicDir, cacheDir))['/diagram.png'];
  assert.equal(second.url, first.url);
  assert.equal((await fs.stat(file)).mtimeMs, original.mtimeMs);
});

test('开发服务器可访问压缩图片和分享封面，支持子路径且不暴露其他缓存文件', async t => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'blog-dev-images-'));
  t.after(() => fs.rm(root, { recursive: true, force: true }));
  const publicDir = path.join(root, '.vuepress/public');
  await fs.mkdir(publicDir, { recursive: true });
  await sharp({ create: { width: 800, height: 400, channels: 4, background: '#26765e' } })
    .png({ compressionLevel: 0 }).toFile(path.join(publicDir, 'diagram.png'));
  const createPlugin = require('../.vuepress/plugins/blog-content');
  const express = require('express');
  for (const base of ['/', '/blog/']) {
    const plugin = createPlugin({ origin: 'https://example.com/' }, {
      sourceDir: root, base, pages: [{ _strippedContent: '![图片](/diagram.png)' }]
    });
    await plugin.ready();
    const md = require('markdown-it')();
    plugin.extendMarkdown(md);
    const imageUrl = md.render('![图片](/diagram.png)').match(/src="([^"]+)"/)[1];
    assert.ok(imageUrl.startsWith(base + 'assets/images/') && imageUrl.endsWith('.webp'));
    const app = express();
    plugin.beforeDevServer(app);
    const server = app.listen(0, '127.0.0.1');
    await new Promise(resolve => server.once('listening', resolve));
    try {
      const origin = 'http://127.0.0.1:' + server.address().port;
      for (const [url, type] of [[imageUrl, 'image/webp'], [base + 'social-card.png', 'image/png']]) {
        const response = await fetch(origin + url);
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('content-type'), type);
        const metadata = await sharp(Buffer.from(await response.arrayBuffer())).metadata();
        assert.ok(metadata.width > 0 && metadata.height > 0);
      }
      assert.equal((await fetch(origin + base + 'assets/images/social-card.png')).status, 404);
    } finally {
      await new Promise(resolve => server.close(resolve));
    }
  }
});
