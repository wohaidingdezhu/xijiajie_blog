const sidebar = require("./siderbar.js");
const otherPlugins = require('./otherPlugins');
module.exports = {
    title: "xijiajie博客",
    dest: "public",
    base: "/",
    port: "9999",
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
        homeHeaderImages: {
            local: [{
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
                    path: "/home-bg/5.png",
                    mask: "rgba(19, 75, 50, .2)"
                },
                {
                    path: "/home-bg/8.jpg",
                    mask: "rgba(19, 75, 50, .2)"
                },
                {
                    path: "/home-bg/9.jpg",
                    mask: "rgba(19, 75, 50, .2)"
                }
            ]
        },
        nav: [{
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
        friendLink: [{
            title: "vuepress-theme-reco",
            desc: "A simple and beautiful vuepress Blog & Doc theme.",
            avatar: "https://vuepress-theme-reco.recoluan.com/icon_vuepress_reco.png",
            link: "https://vuepress-theme-reco.recoluan.com",
        }, ],
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