export default {
  created() {
    if (this.$ssrContext) {
      const canonical = this.$page.seo ? this.$page.seo.canonical : this.$themeConfig.blogOrigin + '404.html'
      this.$ssrContext.userHeadTags += '\n<link rel="canonical" href="' + canonical + '">'
      if (!this.$page.seo) this.$ssrContext.pageMeta += '\n<meta name="robots" content="noindex, follow">'
    }
  },
  mounted() { this.updateCanonical() },
  watch: { '$page'() { this.updateCanonical() } },
  methods: {
    updateCanonical() {
      let link = document.querySelector('link[rel="canonical"]')
      if (this.$page.seo && this.fallbackRobots) {
        this.fallbackRobots.remove()
        this.fallbackRobots = null
      }
      if (!this.$page.seo) {
        let robots = document.querySelector('meta[name="robots"]')
        if (!robots) {
          robots = document.createElement('meta')
          robots.name = 'robots'
          document.head.appendChild(robots)
        }
        robots.content = 'noindex, follow'
        this.fallbackRobots = robots
      }
      if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.appendChild(link)
      }
      link.href = this.$page.seo ? this.$page.seo.canonical : this.$themeConfig.blogOrigin + '404.html'
    }
  }
}
