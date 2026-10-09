const otherPlugins = [
    // 旧版插件无法处理中文锚点，使用 enhanceApp 中的目录滚动逻辑。
    ['vuepress-plugin-smooth-scroll', false],
    "@vuepress/nprogress",
    [
        "vuepress-plugin-nuggets-style-copy",
        {
            copyText: "复制代码",
            tip: {
                content: "复制成功",
            },
        },
    ],
];
module.exports = otherPlugins;
