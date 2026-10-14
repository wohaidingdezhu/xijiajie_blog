<template>
  <header class="blog-header">
    <router-link to="/" class="blog-brand" aria-label="xijiajie 博客首页">
      <span class="brand-icon" aria-hidden="true">&lt;/&gt;</span><span>xijiajie<small>NOTES & IDEAS</small></span>
    </router-link>
    <form class="blog-search" role="search" :inert="menuOpen ? '' : null" :aria-hidden="menuOpen ? 'true' : null" @submit.prevent="search">
      <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
      <input ref="search" v-model="query" type="search" aria-label="搜索博客文章" :placeholder="searchPath === '/' ? '搜索文章、知识点…' : '搜索当前列表…'" @keydown.esc.prevent="clearSearch" />
      <kbd v-if="!query" aria-hidden="true">⌘ K</kbd>
      <button v-else type="button" class="search-clear" aria-label="清空搜索" @click="clearSearch">×</button>
      <button type="submit" class="search-submit">搜索</button>
    </form>
    <nav class="header-nav" aria-label="站点导航">
      <router-link to="/" :aria-current="$route.path !== '/timeline/' ? 'page' : null" :class="{ active: $route.path !== '/timeline/' }">博客</router-link>
      <a :href="$themeConfig.libraryUrl">前端资料库 <span aria-hidden="true">↗</span></a>
      <router-link to="/timeline/" active-class="active">归档</router-link>
    </nav>
    <button ref="menu" class="menu-button" :aria-expanded="String(menuOpen)" aria-controls="blog-sidebar" @click="$emit('toggle-menu')">{{ menuOpen ? '关闭' : '菜单' }}</button>
  </header>
</template>

<script>
export default {
  props: { menuOpen: Boolean },
  data() { return { query: '' } },
  computed: {
    searchPath() {
      const path = this.$route.path
      return path === '/timeline/' || path.startsWith('/categories/') || path.startsWith('/tag/')
        ? path.replace(/page\/\d+\/$/, '') : '/'
    }
  },
  watch: { '$route.query.q'(query) { this.query = typeof query === 'string' ? query : '' } },
  mounted() {
    this.query = typeof this.$route.query.q === 'string' ? this.$route.query.q : ''
    window.addEventListener('keydown', this.onShortcut)
  },
  beforeDestroy() { window.removeEventListener('keydown', this.onShortcut) },
  methods: {
    async clearSearch() {
      this.query = ''
      if (this.$route.query.q) await this.search()
      await this.$nextTick()
      this.$refs.search.focus()
    },
    search() {
      const target = { path: this.searchPath, query: this.query.trim() ? { q: this.query.trim() } : {} }
      if (this.$router.resolve(target).route.fullPath !== this.$route.fullPath) return this.$router.push(target)
    },
    onShortcut(event) {
      if (!this.menuOpen && (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        this.$refs.search.focus()
        this.$refs.search.select()
      }
    }
  }
}
</script>
