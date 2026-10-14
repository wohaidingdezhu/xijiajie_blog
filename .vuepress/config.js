const sidebar = require("./siderbar.js");
const otherPlugins = require('./otherPlugins');
const blogOrigin = 'https://wohaidingdezhu.github.io/';
module.exports = {
    title: "xijiajie博客",
    description: "记录前端开发、工程实践与日常学习。",
    locales: {
        "/": { lang: "zh-CN" },
    },
    dest: "public",
    base: "/",
    shouldPrefetch: () => false,
    port: "9999",
    patterns: ["**/*.md", "**/*.vue", "!CONTRIBUTING.md"],
    head: [
        ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
        ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
        ['link', { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap' }],
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
    plugins: [...otherPlugins, [require('./plugins/blog-content'), { origin: blogOrigin }]],
    theme: "reco",
    chainWebpack(config) {
        // 仅替换旧主题的目录组件，保留主题其他组件和样式。
        // 精确别名必须先于 @theme，否则旧版 Webpack 会先匹配整个主题目录。
        const aliases = config.resolve.alias.entries();
        config.resolve.alias.clear();
        config.resolve.alias.set('@theme/components/SubSidebar$',
            require.resolve('./theme-overrides/SubSidebar.vue'));
        config.resolve.alias.merge(aliases);
    },
    themeConfig: {
        blogOrigin,
        mode: "light",
        modePicker: false,
        libraryUrl: "https://wohaidingdezhu.github.io/fe-interview/",
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
                text: "前端资料库",
                link: "https://wohaidingdezhu.github.io/fe-interview/",
            },
            {
                text: "GitHub",
                link: "https://github.com/wohaidingdezhu",
            }
        ],
        sidebar,
        type: "blog",
        blogConfig: {},
        search: true,
        searchPlaceholder: "搜索文章",
        searchMaxSuggestions: 6,
        lastUpdated: "最近更新",
        author: "xijiajie",
        authorAvatar: "/avatar.jpg",
        startYear: "2021",
    },
    markdown: {
        lineNumbers: false,
    },
};
