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

      return { x: 0, y: window.pageYOffset + target.getBoundingClientRect().top };
    }
    return scrollBehavior(to, from, savedPosition);
  };
};
