const { categoryName } = require('./posts');
const escapeXml = text => String(text).replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[char]));

function pageSeo(page, site, origin) {
  const fm = page.frontmatter || {};
  const path = page._permalink || fm.permalink || page.path || '/404.html';
  const pagination = path.match(/^(.*?)page\/\d+\/$/);
  const canonicalPath = pagination ? pagination[1] || '/' : path;
  const article = path.startsWith('/blogs/') && !!fm.date;
  const noindex = path === '/404.html' || fm.publish === false || !!pagination ||
    ['/tag/', '/categories/', '/blogs/views/messageBoard.html'].includes(path);
  const classifier = path.match(/^\/(categories|tag)\/([^/]+)\/$/);
  const name = classifier ? categoryName(decodeURIComponent(classifier[2])) : '';
  const title = fm.home ? site.title : path === '/timeline/' ? '文章归档' :
    classifier ? name + (classifier[1] === 'categories' ? '学习笔记' : '相关文章') : page.title || site.title;
  const description = fm.description || (classifier ? '关于' + name + '的学习笔记与实践记录。' : site.description);
  return { canonical: new URL(canonicalPath, origin).href, title, description, article, noindex };
}

function applySeo(page, site, origin) {
  const seo = pageSeo(page, site, origin);
  page.seo = seo;
  const image = new URL('social-card.png', origin).href;
  const meta = [
    { property: 'og:site_name', content: site.title },
    { property: 'og:title', content: seo.title },
    { property: 'og:description', content: seo.description },
    { property: 'og:url', content: seo.canonical },
    { property: 'og:type', content: seo.article ? 'article' : 'website' },
    { property: 'og:locale', content: 'zh_CN' },
    { property: 'og:image', content: image },
    { property: 'og:image:width', content: '1200' },
    { property: 'og:image:height', content: '630' },
    { property: 'og:image:alt', content: 'xijiajie · 前端开发与学习笔记' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: seo.title },
    { name: 'twitter:description', content: seo.description },
    { name: 'twitter:image', content: image }
  ];
  if (seo.article) meta.push({ property: 'article:published_time', content: new Date(page.frontmatter.date).toISOString() });
  if (seo.noindex) meta.push({ name: 'robots', content: 'noindex, follow' });
  const keys = new Set(meta.map(item => item.name || item.property));
  page.frontmatter.meta = [...(page.frontmatter.meta || []).filter(item => !keys.has(item.name || item.property)), ...meta];
}

function sitemap(pages, origin) {
  const urls = [...new Set(pages.filter(page => page.seo && !page.seo.noindex).map(page => page.seo.canonical))].sort();
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    urls.map(url => '  <url><loc>' + escapeXml(url) + '</loc></url>').join('\n') + '\n</urlset>\n';
}

module.exports = { pageSeo, applySeo, sitemap, escapeXml };
