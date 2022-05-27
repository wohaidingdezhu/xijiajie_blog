const sidebar = require("./siderbar.js");
const otherPlugins =require('./otherPlugins');
module.exports = {
  title: "xijiajie博客",
  description: "xijiajie的博客",
  dest: "public",
  base: "/",
  port: "9999",
  head: [
    // [
    //   'link', { href: "https://cdn.jsdelivr.net/npm/@docsearch/css@3", rel: "stylesheet" }
    // ],
    // [
    //   'script', { src: "https://cdn.jsdelivr.net/npm/@docsearch/js@3" }
    // ],
    // [
    //   'link', { href: "https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.css", rel: "stylesheet" }
    // ],
    // [
    //   'script', { src: "https://cdn.jsdelivr.net/npm/docsearch.js@2/dist/cdn/docsearch.min.js" }
    // ],
    // [
    //   'link', { href: "https://cdn.jsdelivr.net/npm/@docsearch/css@alpha", rel: "stylesheet" }
    // ],
    // [
    //   'script', { src: "https://cdn.jsdelivr.net/npm/@docsearch/js@alpha" }
    // ],
    [
      "link",
      {
        rel: "icon",
        href: "/logo.jpg",
      },
    ],
    [
      "meta",
      {
        name: "viewport",
        content: "width=device-width,initial-scale=1,user-scalable=no",
      },
    ],
  ],
  plugins: otherPlugins,
  theme: "reco",
  themeConfig: {
    mode: "dark", // 默认 auto，auto 跟随系统，dark 暗色模式，light 亮色模式
    modePicker: true, // 默认 true，false 不显示模式调节按钮，true 则显示
    subSidebar: "auto",
    valineConfig: {
      appId: "HxWlXAgXuT2DxjnOcvgmU0Mk-gzGzoHsz",
      appKey: "XJlaWj8YESnQzxHsrBW5hpew",
    },
    // algolia: {
    //   apiKey: '8503c7f43d77bbe7469b76b8446c3793',
    //   indexName: 'xijiajie_blog',
    //   appId: 'HAS88E9R58',
    // },
    nav: [
      {
        text: "主页",
        link: "/",
        icon: "reco-home",
      },
      {
        text: "时间线",
        link: "/timeline/",
        icon: "reco-date",
      },
      {
        text: "留言板",
        link: "/blogs/views/messageBoard.html",
        icon: "reco-suggestion",
      },
      {
        text: "GitHub",
        link: "https://github.com/wohaidingdezhu",
        icon: "reco-github",
      }
    ],
    sidebar,
    type: "blog",
    blogConfig: {
      category: {
        location: 2,
        text: "目录索引",
      },
      tag: {
        location: 3,
        text: "标签索引",
      },
    },
    friendLink: [
      {
        title: "vuepress-theme-reco",
        desc: "A simple and beautiful vuepress Blog & Doc theme.",
        avatar:
          "https://vuepress-theme-reco.recoluan.com/icon_vuepress_reco.png",
        link: "https://vuepress-theme-reco.recoluan.com",
      },
    ],
    logo: "/logo.png",
    search: true,
    searchMaxSuggestions: 10,
    lastUpdated: "Last Updated",
    author: "xijiajie",
    authorAvatar: "/avatar.jpg",
    record: "首页",
    startYear: "2021",
  },
  markdown: {
    lineNumbers: true,
  },
};
