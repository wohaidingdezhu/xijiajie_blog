<template>
  <div>
    <div class="list-summary"><span>共 {{ posts.length }} 篇文章</span><span>{{ query ? '按相关程度排序' : '按发布时间排序' }}</span></div>
    <div class="article-list">
      <article v-for="post in pagination.items" :key="post.path" class="article-row">
        <div class="article-row-meta"><span>{{ categoryName(values(post.frontmatter.categories)[0]) }}</span><time :datetime="dateText(post.frontmatter.date)">{{ dateText(post.frontmatter.date) }}</time></div>
        <h2><router-link :to="post.path">{{ post.title }}<span aria-hidden="true">→</span></router-link></h2>
        <p v-if="query" class="article-summary search-snippet"><template v-for="(part, i) in snippet(post)"><mark v-if="part.matched" :key="i">{{ part.text }}</mark><span v-else :key="i">{{ part.text }}</span></template></p>
        <p v-else-if="post.frontmatter.description" class="article-summary">{{ post.frontmatter.description }}</p>
        <div class="article-tags"><router-link v-for="tag in values(post.frontmatter.tags).slice(0, 2)" :key="tag" :to="tagPath(tag)">{{ categoryName(tag) }}</router-link></div>
      </article>
    </div>
    <nav v-if="pagination.total > 1" class="list-pagination" aria-label="文章分页">
      <router-link v-if="pagination.current > 1" :to="pageLink(pagination.current - 1)">← 上一页</router-link><span v-else class="disabled">← 上一页</span>
      <span aria-live="polite">第 {{ pagination.current }} / {{ pagination.total }} 页</span>
      <router-link v-if="pagination.current < pagination.total" :to="pageLink(pagination.current + 1)">下一页 →</router-link><span v-else class="disabled">下一页 →</span>
    </nav>
  </div>
</template>

<script>
import { values, categoryName, dateText, paginate, searchSnippet, highlightText } from '../../lib/posts'
export default {
  props: { posts: Array, query: { type: String, default: '' }, searchIndex: { type: Object, default: () => ({}) } },
  data: () => ({ clientReady: false }),
  mounted() { this.clientReady = true },
  computed: {
    pagination() {
      const legacyPage = this.$route.path.match(/\/page\/(\d+)\/$/)
      return paginate(this.posts, (this.clientReady && this.$route.query.page) || (legacyPage && legacyPage[1]))
    }
  },
  methods: {
    values, categoryName, dateText,
    snippet(post) { return highlightText(searchSnippet(post, this.query, this.searchIndex), this.query) },
    pageLink(page) { return { path: this.$route.path.replace(/page\/\d+\/$/, ''), query: { ...this.$route.query, page: String(page) } } },
    tagPath(tag) { const item = this.$tags.list.find(item => item.name === tag); return item ? item.path : '/' }
  }
}
</script>
