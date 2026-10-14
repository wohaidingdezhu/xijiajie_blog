const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');
const { plainTextBlocks } = require('../../lib/content');
const { getPosts } = require('../../lib/posts');
const { applySeo, sitemap } = require('../../lib/seo');

// 本地图片按内容哈希缓存；原文件继续提供，避免破坏已有外链。
async function prepareImages(pages, publicDir, cacheDir) {
  const sources = new Set();
  for (const page of pages) {
    const source = page._strippedContent || '';
    const expression = /(?:\$withBase\(['"]|\bsrc\s*=\s*['"]|!\[[^\]]*\]\()([^'"\s)]+\.(?:png|jpe?g))(?=['"\s)])/gi;
    let match;
    while ((match = expression.exec(source))) if (match[1].startsWith('/') && !match[1].startsWith('//')) sources.add(match[1]);
  }
  await fs.ensureDir(cacheDir);
  const images = {};
  for (const src of sources) {
    const file = path.resolve(publicDir, '.' + src);
    if (!file.startsWith(publicDir + path.sep) || !await fs.pathExists(file)) continue;
    const input = await fs.readFile(file);
    const metadata = await sharp(input).metadata();
    let url = src;
    let output;
    if (input.length > 32 * 1024) {
      const hash = crypto.createHash('sha256').update(input).update('lossless-webp-v1').digest('hex').slice(0, 20);
      const candidate = path.join(cacheDir, hash + '.webp');
      if (!await fs.pathExists(candidate)) await sharp(input).webp({ lossless: true, effort: 4 }).toFile(candidate);
      if ((await fs.stat(candidate)).size < input.length * 0.9) {
        url = '/assets/images/' + hash + '.webp';
        output = candidate;
      }
    }
    images[src] = { url, output, width: metadata.width, height: metadata.height, originalBytes: input.length };
  }
  return images;
}

function imageHtml(html, images, base) {
  return html.replace(/<img\b[^>]*>/gi, tag => {
    const binding = tag.match(/:src\s*=\s*(["'])\$withBase\(['"]([^'"]+)['"]\)\1/);
    const literal = tag.match(/\bsrc\s*=\s*(["'])([^"']+)\1/);
    const source = binding ? binding[2] : literal ? literal[2] : '';
    const image = images[source];
    if (image) {
      tag = binding ? tag.replace(binding[0], ':src="$withBase(\'' + image.url + '\')"') : tag.replace(literal[0], 'src="' + base + image.url.slice(1) + '"');
      // 有显式宽高的图片保留作者设置，其余图片预留原始比例。
      if (!/\b(?:width|height)\s*=/i.test(tag)) tag = tag.replace(/\s*\/?>$/, ' width="' + image.width + '" height="' + image.height + '">');
    }
    if (!/\bloading\s*=/i.test(tag)) tag = tag.replace(/\s*\/?>$/, ' loading="lazy">');
    if (!/\bdecoding\s*=/i.test(tag)) tag = tag.replace(/\s*\/?>$/, ' decoding="async">');
    return tag;
  });
}

module.exports = (options, context) => {
  const origin = options.origin;
  const publicDir = path.resolve(context.sourceDir, '.vuepress/public');
  const cacheDir = path.resolve(context.sourceDir, '.vuepress/.cache/blog-images');
  let images = {};
  return {
    name: 'blog-content',
    clientRootMixin: path.join(__dirname, 'seo-mixin.js'),
    extendPageData(page) {
      if (page._strippedContent) page._blogSearchBlocks = plainTextBlocks(page._strippedContent);
      applySeo(page, context.siteConfig, origin);
    },
    async ready() {
      images = await prepareImages(context.pages, publicDir, cacheDir);
      await sharp(path.join(__dirname, 'social-card.svg')).png().toFile(path.join(cacheDir, 'social-card.png'));
    },
    clientDynamicModules() {
      return { name: 'blog-search.js', content: 'export default ' + JSON.stringify(Object.fromEntries(getPosts(context.pages).map(page => [page.path, page._blogSearchBlocks || []]))) };
    },
    extendMarkdown(md) {
      const imageRule = md.renderer.rules.image;
      md.renderer.rules.image = (tokens, index, options, env, self) => {
        const token = tokens[index];
        const image = images[token.attrGet('src')];
        if (image) {
          token.attrSet('src', context.base + image.url.slice(1));
          if (!token.attrGet('width') && !token.attrGet('height')) {
            token.attrSet('width', String(image.width));
            token.attrSet('height', String(image.height));
          }
        }
        token.attrSet('loading', token.attrGet('loading') || 'lazy');
        token.attrSet('decoding', token.attrGet('decoding') || 'async');
        return imageRule(tokens, index, options, env, self);
      };
      for (const name of ['html_inline', 'html_block']) {
        const render = md.renderer.rules[name] || ((tokens, index) => tokens[index].content);
        md.renderer.rules[name] = (...args) => imageHtml(render(...args), images, context.base);
      }
    },
    async generated() {
      await fs.ensureDir(path.join(context.outDir, 'assets/images'));
      for (const image of Object.values(images)) if (image.output) await fs.copy(image.output, path.join(context.outDir, image.url));
      await fs.copy(path.join(cacheDir, 'social-card.png'), path.join(context.outDir, 'social-card.png'));
      await fs.writeFile(path.join(context.outDir, 'sitemap.xml'), sitemap(context.pages, origin));
      await fs.writeFile(path.join(context.outDir, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: ' + new URL('sitemap.xml', origin).href + '\n');
    }
  };
};
module.exports.prepareImages = prepareImages;
module.exports.imageHtml = imageHtml;
