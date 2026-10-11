<template>
  <article>
    <nav class="breadcrumb" aria-label="面包屑"><router-link to="/">博客</router-link><span aria-hidden="true">/</span><router-link :to="categoryPath">{{ categoryName(category) }}</router-link><span aria-hidden="true">/</span><span aria-current="page">正文</span></nav>
    <header class="article-heading">
      <div class="article-meta"><span class="content-type">学习笔记</span><time :datetime="dateText($page.frontmatter.date)">发布于 {{ dateText($page.frontmatter.date) }}</time></div>
      <h1>{{ $page.title }}</h1>
      <p v-if="$page.frontmatter.description" class="description">{{ $page.frontmatter.description }}</p>
      <div class="article-tags"><router-link v-for="tag in tags" :key="tag" :to="tagPath(tag)">{{ tag }}</router-link></div>
    </header>
    <Content class="article-body theme-reco-content custom" />
    <p v-if="$page.lastUpdated" class="article-updated">最近更新 · {{ $page.lastUpdated }}</p>
    <nav v-if="previous || next" class="article-pagination" aria-label="上一篇和下一篇">
      <div><template v-if="previous"><small>← 上一篇</small><router-link :to="previous.path">{{ previous.title }}</router-link></template></div>
      <div><template v-if="next"><small>下一篇 →</small><router-link :to="next.path">{{ next.title }}</router-link></template></div>
    </nav>
  </article>
</template>

<script>
import { values, categoryName, dateText } from '../../lib/posts'
import { mountCodeCopy } from '../../lib/code-copy'
export default {
  props: { posts: Array },
  mounted() { this.setupCodeCopy() },
  beforeDestroy() { if (this.cleanupCopy) this.cleanupCopy() },
  watch: { '$page.key'() { this.setupCodeCopy() } },
  computed: {
    category() { return values(this.$page.frontmatter.categories)[0] || '' },
    categoryPath() { const item = this.$categories.list.find(item => item.name === this.category); return item ? item.path : '/' },
    tags() { return values(this.$page.frontmatter.tags).slice(0, 2) },
    siblings() { return this.posts.filter(post => values(post.frontmatter.categories).includes(this.category)).slice().sort((a, b) => a.path.localeCompare(b.path, 'en', { numeric: true })) },
    currentIndex() { return this.siblings.findIndex(post => post.path === this.$page.path) },
    previous() { return this.siblings[this.currentIndex - 1] },
    next() { return this.siblings[this.currentIndex + 1] }
  },
  methods: {
    values, categoryName, dateText,
    setupCodeCopy() {
      if (this.cleanupCopy) this.cleanupCopy()
      this.$nextTick(() => {
        if (!this._isDestroyed) this.cleanupCopy = mountCodeCopy(this.$el)
      })
    },
    tagPath(tag) { const item = this.$tags.list.find(item => item.name === tag); return item ? item.path : '/' }
  }
}
</script>
