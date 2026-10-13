// 只增强当前文章的代码块；换页时移除事件和定时器。
export function mountCodeCopy(root) {
  let active = true;
  const cleanups = [];
  for (const pre of root.querySelectorAll('div[class*="language-"] > pre')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'code-copy-button';
    button.textContent = '复制代码';
    button.setAttribute('aria-live', 'polite');
    pre.tabIndex = 0;
    let timer;
    const copy = async () => {
      const code = pre.textContent;
      let copied = false;
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(code);
          copied = true;
        } catch (_) { /* 浏览器复制接口不可用时继续尝试备用方式。 */ }
      }
      if (!active) return;
      if (!copied) {
        try {
          const field = document.createElement('textarea');
          field.value = code;
          field.style.cssText = 'position:fixed;left:-9999px;top:0';
          document.body.appendChild(field);
          try { field.select(); copied = document.execCommand('copy'); }
          finally { field.remove(); if (active) button.focus({ preventScroll: true }); }
        } catch (_) { /* 复制权限不可用时保留手动选择。 */ }
      }
      if (!active) return;
      button.textContent = copied ? '已复制' : '请手动选择复制';
      clearTimeout(timer);
      timer = setTimeout(() => { button.textContent = '复制代码'; }, 2400);
    };
    button.addEventListener('click', copy);
    pre.parentElement.appendChild(button);
    cleanups.push(() => { clearTimeout(timer); button.removeEventListener('click', copy); button.remove(); });
  }
  return () => { active = false; cleanups.forEach(cleanup => cleanup()); };
}
