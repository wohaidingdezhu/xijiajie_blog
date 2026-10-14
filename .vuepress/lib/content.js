const MarkdownIt = require('markdown-it');
const { decode } = require('he');
const markdown = new MarkdownIt({ html: true });

function stripHtml(html) {
  return decode(html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]*>/g, ' '));
}

function plainTextBlocks(source) {
  const collect = tokens => tokens.map(token => {
    if (token.children) return collect(token.children);
    if (token.type === 'html_inline' || token.type === 'html_block') return stripHtml(token.content);
    if (['text', 'code_inline', 'code_block', 'fence'].includes(token.type)) return token.content;
    return ' ';
  }).join(' ');
  return markdown.parse(source || '', {}).map(token => collect([token]).replace(/\s+/g, ' ').trim()).filter(Boolean);
}

function plainText(source) { return plainTextBlocks(source).join(' '); }

module.exports = { plainText, plainTextBlocks };
