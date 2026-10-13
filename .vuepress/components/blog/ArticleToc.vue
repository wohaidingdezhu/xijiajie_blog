<template>
  <aside v-if="headers.length" class="article-toc" :class="{ 'is-expanded': expanded }" aria-label="本页目录">
    <button class="toc-toggle" :aria-expanded="String(expanded)" aria-controls="article-toc-links" @click="expanded = !expanded">本页内容<span>{{ expanded ? '收起 −' : '展开 +' }}</span></button>
    <nav id="article-toc-links" v-show="expanded">
      <a href="#main" class="toc-link" :class="{ active: !activeSlug }" :aria-current="!activeSlug ? 'location' : null" @click="collapseOnMobile">文章开头</a>
      <router-link v-for="header in headers" :key="header.slug" :to="{ path: $page.path, hash: '#' + header.slug }" class="toc-link" :class="{ 'toc-sub': header.level > 2, active: activeSlug === header.slug }" :aria-current="activeSlug === header.slug ? 'location' : null" @click.native="collapseOnMobile">{{ header.title }}</router-link>
    </nav>
  </aside>
</template>

<script>
export default {
  props: { headers: Array },
  data: () => ({ expanded: true, activeSlug: '' }),
  mounted() {
    this.compactMedia = window.matchMedia('(max-width: 1150px)')
    this.expanded = !this.compactMedia.matches
    this.compactMedia.addListener(this.onBreakpoint)
    window.addEventListener('scroll', this.onScroll, { passive: true })
    this.onScroll()
  },
  beforeDestroy() {
    this.compactMedia.removeListener(this.onBreakpoint)
    window.removeEventListener('scroll', this.onScroll)
    cancelAnimationFrame(this.frame)
  },
  methods: {
    onBreakpoint(event) { this.expanded = !event.matches; this.onScroll() },
    collapseOnMobile() { if (window.innerWidth <= 1150) this.expanded = false },
    onScroll() {
      if (this.frame) return
      this.frame = requestAnimationFrame(() => {
        this.frame = null
        const offset = window.innerWidth <= 760 ? 96 : 112
        let active = ''
        for (const header of this.headers) {
          const element = document.getElementById(header.slug)
          if (element && element.getBoundingClientRect().top <= offset) active = header.slug
        }
        this.activeSlug = active
      })
    }
  }
}
</script>
