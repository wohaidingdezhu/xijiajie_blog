const otherPlugins = [
    // 旧版插件无法处理中文锚点，使用 enhanceApp 中的目录滚动逻辑。
    ['vuepress-plugin-smooth-scroll', false],
    ['@vuepress/active-header-links', false],
    ['@vuepress-reco/loading-page', false],
    ['@vuepress-reco/back-to-top', false],
    ['@vuepress-reco/comments', false],
    "@vuepress/nprogress",
];
module.exports = otherPlugins;
