// import MyTemplate from './components/MyTemplate.vue'
import { addLinkToHead } from '@theme/helpers/utils'
export default ({ router, Vue, isServer }) => {
    // Vue.component('MyTemplate', MyTemplate)
    if (!isServer) {
    addLinkToHead('//at.alicdn.com/t/font_2399620_jztf98umdl.css?spm=a313x.7781069.1998910419.84&file=font_2399620_jztf98umdl.css')
  }
//   Vue({
    // mounted() {
    //   // 不加 setTimeout 会有报错，但不影响效果
    //   setTimeout(() => {
    //     try {
    //       docsearch({
    //         container: '.search-box',
    //         appId: "HAS88E9R58",
    //         apiKey: "8503c7f43d77bbe7469b76b8446c3793",
    //         indexName: "xijiajie_blog",
    //         debug: false,
    //         // inputSelector: ".search-box input",
    //       });
    //     } catch (e) {
    //       console.log(e, "enhanceApp");
    //     }
    //   }, 200);
    // },
//   });
};



// export default ({
//   Vue,
//   siteData,
//   isServer
// }) => {
//   Vue.mixin(postMixin)
//   Vue.mixin(localMixin)
//   if (!isServer) {
//     addLinkToHead('//at.alicdn.com/t/font_2399620_jztf98umdl.css?spm=a313x.7781069.1998910419.84&file=font_2399620_jztf98umdl.css')
//     addLinkToHead('//at.alicdn.com/t/font_1030519_2ciwdtb4x65.css')
//     registerCodeThemeCss(siteData.themeConfig.codeTheme)
//   }
// }

