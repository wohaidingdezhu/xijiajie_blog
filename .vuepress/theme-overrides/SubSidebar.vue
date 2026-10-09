<script>
import SubSidebar from 'vuepress-theme-reco/components/SubSidebar.vue'
import { isActive } from 'vuepress-theme-reco/helpers/utils'

export default {
  extends: SubSidebar,
  methods: {
    isLinkActive (header) {
      // 渲染时只判断高亮，不创建延迟滚动任务，避免换页后访问已移除的目录。
      return isActive(this.$route, this.$page.path + '#' + header.slug)
    }
  }
}
</script>
