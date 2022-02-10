const sidebar = require("./siderbar.js");
module.exports = {
  title: "xijiajie博客",
  description: "xijiajie的博客",
  dest: "public",
  base: "/",
  head: [
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
  plugins: [
    "@vuepress-reco/vuepress-plugin-comments",
    "vuepress-plugin-meting",
  ],
  theme: "reco",
  themeConfig: {
    mode: "light",
    subSidebar: "auto",
    valineConfig: {
      appId: "HxWlXAgXuT2DxjnOcvgmU0Mk-gzGzoHsz",
      appKey: "XJlaWj8YESnQzxHsrBW5hpew",
    },
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
        text: "Contact",
        icon: "reco-message",
        items: [
          {
            text: "GitHub",
            link: "https://github.com/wohaidingdezhu",
            icon: "reco-github",
          },
        ],
      },
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
