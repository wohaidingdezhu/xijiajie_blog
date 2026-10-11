export default ({ Vue, router }) => {
  const scrollBehavior = router.options.scrollBehavior;

  router.options.scrollBehavior = (to, from, savedPosition) => {
    if (!savedPosition && to.hash) {
      if (Vue.$vuepress.$get('disableScrollBehavior')) return false;

      // 中文标题的 hash 可能被编码，不能直接传给 querySelector。
      let id;
      try {
        id = decodeURIComponent(to.hash.slice(1));
      } catch (_) {
        return false;
      }
      const target = document.getElementById(id);
      if (!target) return false;

      const header = document.querySelector('.blog-header');
      const offset = header ? header.getBoundingClientRect().height + 24 : 0;
      return { x: 0, y: Math.max(0, window.pageYOffset + target.getBoundingClientRect().top - offset) };
    }
    return scrollBehavior(to, from, savedPosition);
  };
};
