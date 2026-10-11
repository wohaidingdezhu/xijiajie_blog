<template>
  <aside id="blog-sidebar" class="blog-sidebar" :class="{ 'is-open': open }" aria-label="博客导航">
    <div class="sidebar-label"><span>NOTEBOOK</span><span>{{ posts.length }} 篇文章</span></div>
    <nav class="mobile-site-nav" aria-label="站点入口" @click="$emit('navigate')">
      <router-link to="/">博客首页</router-link><a :href="$themeConfig.libraryUrl">前端资料库 ↗</a><router-link to="/timeline/">文章归档</router-link>
    </nav>
    <nav class="category-nav" aria-label="按分类浏览" @click="$emit('navigate')">
      <p class="sidebar-section-label">按分类浏览</p>
      <router-link to="/" class="category-link" :class="{ active: !category && $route.path !== '/timeline/' }">全部文章<span>{{ posts.length }}</span></router-link>
      <router-link v-for="item in categories" :key="item.name" :to="item.path" class="category-link" :class="{ active: category === item.name }" :aria-current="category === item.name ? 'true' : null">
        {{ categoryName(item.name) }}<span>{{ item.count }}</span>
      </router-link>
    </nav>
    <nav v-if="related.length" class="related-nav" aria-label="同分类文章" @click="$emit('navigate')">
      <p class="sidebar-section-label">{{ categoryName(category) }}</p>
      <router-link v-for="post in related" :key="post.path" :to="post.path" :aria-current="post.path === $page.path ? 'page' : null" :class="{ active: post.path === $page.path }">{{ post.title }}</router-link>
    </nav>
    <div class="sidebar-footer"><p>把学到的，写下来。<small>前端开发 · 工程实践 · 日常学习</small></p><a href="https://github.com/wohaidingdezhu" target="_blank" rel="noopener noreferrer">GitHub ↗</a></div>
  </aside>
</template>

<script>
import { values, categoryName } from '../../lib/posts'
export default {
  props: { open: Boolean, posts: Array, category: String },
  computed: {
    categories() {
      return (this.$categories.list || []).map(item => ({
        name: item.name, path: item.path,
        count: this.posts.filter(post => values(post.frontmatter.categories).includes(item.name)).length
      })).filter(item => item.count)
    },
    related() { return this.$page.path && this.$page.path.startsWith('/blogs/') ? this.posts.filter(post => values(post.frontmatter.categories).includes(this.category)) : [] }
  },
  methods: { categoryName }
}
</script>
