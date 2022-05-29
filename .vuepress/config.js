const sidebar = require("./siderbar.js");
const otherPlugins =require('./otherPlugins');
module.exports = {
  title: "xijiajie博客",
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
  // theme: "gungnir",
  // themeConfig: {
  //   repo: "Renovamen/renovamen.github.io",
  //   docsDir: "blog",
  //   docsBranch: "master",
  //   editLinks: true,
  //   lastUpdated: true,
  //   hitokoto: {
  //     api: "https://v1.hitokoto.cn/?c=c&c=d&c=h&c=i&c=j&c=k"
  //   },
  //   searchIcon: "ri-search-2-line",
  //   codeTheme: "gungnir-dark",
  //   rss: {
  //     site_url: "https://zxh.io",
  //     copyright: "Renovamen 2018-2021",
  //     count: 20
  //   },
  //   comment: {
  //     owner: "This-is-an-Apple",
  //     repo: "gitalk-comments",
  //     clientId: "d6247712dc288a5a60ca",
  //     clientSecret: "ed1ec72417828343c79ed910a1b77d140fa715a7"
  //   },
  //   analytics: {
  //     ga: "UA-146858305-1",
  //     ba: "75381d210789d3eaf855fa16246860cc"
  //   },
  //   katex: true,
  //   mdPlus: {
  //     all: true
  //   },
  //   readingTime: {
  //     excludes: ["/about", "/tags/.*", "/links"]
  //   },
  //   nav: [
  //     {
  //       text: "Home",
  //       link: "/",
  //       icon: "fa-fort-awesome"
  //     },
  //     {
  //       text: "About",
  //       link: "/about/",
  //       icon: "fa-paw"
  //     },
  //     {
  //       text: "Tags",
  //       link: "/tags/",
  //       icon: "fa-tag"
  //     },
  //     {
  //       text: "Links",
  //       link: "/links/",
  //       icon: "fa-satellite-dish"
  //     },
  //     {
  //       text: "Portfolio",
  //       link: "https://portfolio.zxh.io/",
  //       icon: "ri-space-ship-fill"
  //     }
  // ],
  //   personalInfo: {
  //     name: "Renovamen",
  //     avatar: "/img/avatar.jpg",
  //     description: "いつか、私がヒトじゃなくなっても",
  //     sns: {
  //       github: "Renovamen",
  //       linkedin: "xiaohan-zou",
  //       facebook: "renovamen.zou",
  //       twitter: "renovamen_zxh",
  //       zhihu: "chao-neng-gui-su",
  //       email: "renovamenzxh@gmail.com"
  //     }
  //   },
  //   homeHeaderImages: {
  //     local: [
  //       {
  //         path: "/img/home-bg/1.jpg",
  //         mask: "rgba(40, 57, 101, .4)"
  //       },
  //       {
  //         path: "/img/home-bg/2.jpg",
  //         mask: "rgba(196, 176, 131, .1)"
  //       },
  //       {
  //         path: "/img/home-bg/3.jpg",
  //         mask: "rgba(68, 74, 83, .1)"
  //       },
  //       {
  //         path: "/img/home-bg/4.jpg",
  //         mask: "rgba(19, 75, 50, .2)"
  //       },
  //       {
  //         path: "/img/home-bg/5.jpg"
  //       }
  //     ]
  //   },
  //   pages: {
  //     tags: {
  //       title: "Tags",
  //       subtitle: "Black Sheep Wall",
  //       bgImage: {
  //         path: "/img/pages/tags.jpg",
  //         mask: "rgba(211, 136, 37, .5)"
  //       }
  //     },
  //     links: {
  //       title: "Links",
  //       subtitle:
  //         "When you are looking at the stars, please put the brightest star shining night sky as my soul.",
  //       bgImage: {
  //         path: "/img/pages/links.jpg",
  //         mask: "rgba(64, 118, 190, 0.5)"
  //       }
  //     }
  //   },
  //   footer: `
  //     &copy; <a href="https://github.com/Renovamen" target="_blank">Renovamen</a> 2018-2021
  //     <br>
  //     Powered by <a href="https://vuepress.vuejs.org" target="_blank">VuePress</a> &
  //     <a href="https://github.com/Renovamen/vuepress-theme-gungnir" target="_blank">Gungnir</a>
  //   `
  // },
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
    homeHeaderImages:{
      local: [
        {
          path: "/home-bg/1.jpg",
          mask: "rgba(40, 57, 101, .4)"
        },
        {
          path: "/home-bg/2.jpg",
          mask: "rgba(196, 176, 131, .1)"
        },
        {
          path: "/home-bg/3.jpg",
          mask: "rgba(68, 74, 83, .1)"
        },
        {
          path: "/home-bg/4.jpg",
          mask: "rgba(19, 75, 50, .2)"
        },
        {
          path: "/home-bg/5.jpg"
        }
      ]
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
        text: "GitHub",
        link: "https://github.com/wohaidingdezhu",
        icon: "reco-github",
      }
    ],
    // homeHeaderImages: {
    //   local: [
    //     {
    //       path: "/home-bg/1.jpg",
    //       mask: "rgba(40, 57, 101, .4)"
    //     },
    //     {
    //       path: "/home-bg/2.jpg",
    //       mask: "rgba(196, 176, 131, .1)"
    //     },
    //     {
    //       path: "/home-bg/3.jpg",
    //       mask: "rgba(68, 74, 83, .1)"
    //     },
    //     {
    //       path: "/home-bg/4.jpg",
    //       mask: "rgba(19, 75, 50, .2)"
    //     },
    //     {
    //       path: "/home-bg/5.jpg"
    //     }
    //   ]
    // },
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
