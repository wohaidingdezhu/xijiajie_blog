const sidebar = require("./siderbar.js");
const otherPlugins = require('./otherPlugins');
module.exports = {
    title: "xijiajie博客",
    description: "记录前端开发、工程实践与日常学习。",
    locales: {
        "/": { lang: "zh-CN" },
    },
    dest: "public",
    base: "/",
    port: "9999",
    patterns: ["**/*.md", "**/*.vue", "!CONTRIBUTING.md"],
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
                content: "width=device-width,initial-scale=1",
            },
        ],
    ],
    plugins: otherPlugins,
    theme: "reco",
    themeConfig: {
        mode: "auto",
        modePicker: true,
        subSidebar: "auto",
        nav: [{
                text: "主页",
                link: "/",
            },
            {
                text: "归档",
                link: "/timeline/",
            },
            {
                text: "GitHub",
                link: "https://github.com/wohaidingdezhu",
            }
        ],
        sidebar,
        type: "blog",
        blogConfig: {
            category: {
                location: 2,
                text: "分类",
            },
        },
        search: true,
        searchPlaceholder: "搜索文章",
        searchMaxSuggestions: 6,
        lastUpdated: "最近更新",
        author: "xijiajie",
        authorAvatar: "/avatar.jpg",
        startYear: "2021",
    },
    markdown: {
        lineNumbers: true,
    },
};
