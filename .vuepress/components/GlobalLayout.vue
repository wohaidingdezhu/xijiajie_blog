<template>
  <div class="blog-app" @keydown.esc="closeMenu" @keydown.tab="trapMenuFocus">
    <a class="skip-link" href="#main">跳到正文</a>
    <BlogHeader ref="header" :menu-open="menuOpen" @toggle-menu="menuOpen = !menuOpen" />
    <button v-if="menuOpen" class="menu-overlay" aria-label="关闭导航菜单" @click="closeMenu" />
    <BlogSidebar :open="menuOpen" :posts="posts" :category="category" @navigate="closeMenu" />
    <div class="blog-workspace" :class="{ 'is-article': isArticle }" :inert="menuOpen ? '' : null" :aria-hidden="menuOpen ? 'true' : null">
      <main id="main" ref="main" tabindex="-1">
        <ArticlePage v-if="isArticle" :posts="posts" />
        <template v-else-if="isCollection">
          <nav class="breadcrumb" aria-label="面包屑">
            <router-link to="/">博客</router-link><span aria-hidden="true">/</span><span>{{ title }}</span>
          </nav>
          <header class="collection-heading">
            <div>
              <p class="eyebrow">{{ isArchive ? 'NOTES OVER TIME' : 'READ · LEARN · BUILD' }}</p>
              <h1>{{ title }}</h1>
              <p class="description">{{ description }}</p>
            </div>
            <p v-if="!query || !searchLoading" class="collection-count"><strong>{{ filtered.length }}</strong><span>篇文章</span></p>
          </header>
          <div v-if="query || tag" class="filter-status">
            <span>{{ query ? '搜索：' + query : '标签：' + categoryName(tag) }}</span>
            <router-link :to="clearFilterPath">清除筛选</router-link>
          </div>
          <p v-if="query && searchFailed" class="search-status" role="status">正文搜索暂时未加载，当前仅搜索标题与摘要。<button type="button" @click="ensureSearchIndex">重试</button></p>
          <p v-if="query && searchLoading" class="search-status" role="status">正在搜索正文…</p>
          <div v-else-if="!filtered.length" class="empty-state">
            <h2>没有找到相关文章</h2><p>试试更短的关键词，或浏览全部文章。</p>
            <router-link to="/">查看全部文章 →</router-link>
          </div>
          <div v-else-if="isArchive" class="archive-list">
            <section v-for="group in archive" :key="group.year" :aria-labelledby="'year-' + group.year">
              <h2 :id="'year-' + group.year">{{ group.year }}<span>{{ group.posts.length }} 篇</span></h2>
              <router-link v-for="post in group.posts" :key="post.path" :to="post.path" class="archive-row">
                <time :datetime="dateText(post.frontmatter.date)">{{ dateText(post.frontmatter.date).slice(5) }}</time>
                <span>{{ post.title }}</span><span aria-hidden="true">→</span>
              </router-link>
            </section>
          </div>
          <ArticleList v-else :posts="filtered" :query="query" :search-index="searchIndex || {}" />
        </template>
        <section v-else-if="$page.path" class="standalone-page">
          <h1>{{ $page.title }}</h1><Content class="article-body custom" />
        </section>
        <section v-else class="empty-state">
          <p class="eyebrow">404</p><h1>这一页还没有笔记</h1>
          <p>链接可能已变更，可以从文章列表重新查找。</p><router-link to="/">返回博客 →</router-link>
        </section>
        <footer class="blog-footer"><span>xijiajie · 记录与分享</span><a :href="$themeConfig.libraryUrl">前端资料库 ↗</a></footer>
      </main>
      <ArticleToc v-if="isArticle" :key="$page.path" :headers="tocHeaders" />
    </div>
  </div>
</template>

<script>
import BlogHeader from './blog/BlogHeader.vue'
import BlogSidebar from './blog/BlogSidebar.vue'
import ArticleList from './blog/ArticleList.vue'
import ArticlePage from './blog/ArticlePage.vue'
import ArticleToc from './blog/ArticleToc.vue'
import { getPosts, filterPosts, archivePosts, values, categoryName, dateText } from '../lib/posts'
import { loadSearchIndex } from '../lib/load-search'

export default {
  components: { BlogHeader, BlogSidebar, ArticleList, ArticlePage, ArticleToc },
  data: () => ({ menuOpen: false, searchIndex: null, searchLoading: false, searchFailed: false, clientReady: false }),
  computed: {
    posts() { return getPosts(this.$site.pages) },
    isArticle() { return this.$page.path && this.$page.path.startsWith('/blogs/') && !!this.$page.frontmatter.date },
    isArchive() { return this.$route.path === '/timeline/' },
    category() {
      if (this.isArticle) return values(this.$page.frontmatter.categories)[0] || ''
      return this.$route.meta.pid === 'categories' && this.$currentCategories ? this.$currentCategories.key || '' : ''
    },
    tag() { return this.$route.meta.pid === 'tags' && this.$currentTags ? this.$currentTags.key || '' : '' },
    // 静态 HTML 不包含 URL 查询，首轮渲染先与构建产物一致，再读取搜索参数。
    query() { return this.clientReady && typeof this.$route.query.q === 'string' ? this.$route.query.q.trim() : '' },
    clearFilterPath() { return this.query ? this.$route.path.replace(/page\/\d+\/$/, '') : '/' },
    isCollection() {
      return this.$page.path && (this.$page.frontmatter.home || this.isArchive ||
        this.$route.path.startsWith('/categories/') || this.$route.path.startsWith('/tag/'))
    },
    title() { return this.isArchive ? '文章归档' : this.category ? categoryName(this.category) : this.tag ? categoryName(this.tag) : this.query ? '搜索文章' : '文章与笔记' },
    description() { return this.isArchive ? '按时间回看，记录每一步积累。' : this.category ? '关于' + categoryName(this.category) + '的学习笔记与实践记录。' : '记录前端开发、工程实践与日常学习。' },
    filtered() { return filterPosts(this.posts, { category: this.category, tag: this.tag, query: this.query }, this.searchIndex || {}) },
    tocHeaders() { return (this.$page.headers || []).filter(header => header.level <= (this.$page.frontmatter.tocDepth || 3)) },
    archive() { return archivePosts(this.filtered) }
  },
  watch: {
    query() { if (this.clientReady) this.ensureSearchIndex() },
    '$route.fullPath'() {
      this.menuOpen = false
      this.$nextTick(() => { if (!this.$route.hash) this.$refs.main.focus({ preventScroll: true }) })
    },
    menuOpen(open) {
      document.body.classList.toggle('blog-menu-open', open)
      if (open) this.$nextTick(() => this.$el.querySelector('.mobile-site-nav a').focus())
    }
  },
  mounted() {
    this.clientReady = true
    this.ensureSearchIndex()
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
    this.menuMedia = window.matchMedia('(max-width: 760px)')
    this.menuMedia.addListener(this.onMenuBreakpoint)
  },
  beforeDestroy() {
    document.body.classList.remove('blog-menu-open')
    this.menuMedia.removeListener(this.onMenuBreakpoint)
  },
  methods: {
    dateText, categoryName,
    async ensureSearchIndex() {
      if (!this.query || this.searchIndex || this.searchLoading) return
      this.searchLoading = true
      this.searchFailed = false
      try {
        const index = await loadSearchIndex()
        if (!this._isDestroyed) this.searchIndex = index
      } catch (_) {
        if (!this._isDestroyed) this.searchFailed = true
      } finally {
        if (!this._isDestroyed) this.searchLoading = false
      }
    },
    onMenuBreakpoint(event) {
      if (!event.matches && this.menuOpen) {
        this.menuOpen = false
        this.$nextTick(() => this.$refs.main.focus({ preventScroll: true }))
      }
    },
    trapMenuFocus(event) {
      if (!this.menuOpen || window.innerWidth > 760) return
      const links = Array.from(this.$el.querySelectorAll('#blog-sidebar a[href]'))
      const focusable = [this.$refs.header.$refs.menu, ...links]
      const index = focusable.indexOf(document.activeElement)
      if (event.shiftKey && index <= 0) {
        event.preventDefault(); focusable[focusable.length - 1].focus()
      } else if (!event.shiftKey && (index === focusable.length - 1 || index === -1)) {
        event.preventDefault(); focusable[0].focus()
      }
    },
    closeMenu() {
      if (!this.menuOpen) return
      this.menuOpen = false
      this.$refs.header.$refs.menu.focus()
    }
  }
}
</script>
