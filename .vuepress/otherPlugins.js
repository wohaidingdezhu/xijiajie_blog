const otherPlugins = [
  "@vuepress-reco/vuepress-plugin-comments",
  "@vuepress-plugin-meting",
  "@vuepress/nprogress",
  [
    "@vuepress-reco/vuepress-plugin-bgm-player",
    {
      audios: [
        // 本地文件示例
        // {
        //   name: 'so far away',
        //   artist: 'martin david',
        //   url: './public/SoFarAway.mp3',
        //   cover: './public/avatar.jpg'
        // },
        {
          name: "So Far Away",
          artist: "Martin Garrix&Jamie Scott&Romy&David Guetta",
          url: "http://www.ytmp3.cn/down/58663.mp3",
          cover: "http://p1.music.126.net/bDdwz0zd-BGYpel1QEU2RA==/109951165983886039.jpg?param=130y130",
        },
        {
          name: "Paris",
          artist: "The Chainsmokers",
          url: "https://www.ytmp3.cn/down/50459.mp3",
          cover: "http://p1.music.126.net/SuCNw1Twu5gs_UT66_eQdA==/109951165981300158.jpg?param=130y130",
        },
      ],
    },
  ],
  [
    "vuepress-plugin-nuggets-style-copy",
    {
      copyText: "复制代码",
      tip: {
        content: "复制成功",
      },
    },
  ],
  [
    "vuepress-plugin-cursor-effects",
    {
      size: 2, // size of the particle, default: 2
      shape: "circle", // shape of the particle, default: 'star'
      zIndex: 999999999, // z-index property of the canvas, default: 999999999
    },
  ],
  [
    "ribbon-animation",
    {
      size: 90, // 默认数据
      opacity: 0.3, //  透明度
      zIndex: -1, //  层级
      opt: {
        // 色带HSL饱和度
        colorSaturation: "80%",
        // 色带HSL亮度量
        colorBrightness: "60%",
        // 带状颜色不透明度
        colorAlpha: 0.65,
        // 在HSL颜色空间中循环显示颜色的速度有多快
        colorCycleSpeed: 6,
        // 从哪一侧开始Y轴 (top|min, middle|center, bottom|max, random)
        verticalPosition: "center",
        // 到达屏幕另一侧的速度有多快
        horizontalSpeed: 200,
        // 在任何给定时间，屏幕上会保留多少条带
        ribbonCount: 2,
        // 添加笔划以及色带填充颜色
        strokeSize: 0,
        // 通过页面滚动上的因子垂直移动色带
        parallaxAmount: -0.5,
        // 随着时间的推移，为每个功能区添加动画效果
        animateSections: true,
      },
      ribbonShow: false, //  点击彩带  true显示  false为不显示
      ribbonAnimationShow: true, // 滑动彩带
    },
  ],
];
module.exports = otherPlugins;
