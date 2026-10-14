let pending

export function loadSearchIndex() {
  if (!pending) {
    pending = import(/* webpackChunkName: "blog-search" */ '@dynamic/blog-search')
      .then(module => module.default)
      .catch(error => { pending = null; throw error })
  }
  return pending
}
