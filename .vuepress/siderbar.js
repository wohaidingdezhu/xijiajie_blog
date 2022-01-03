const { createSideBarConfig } = require("./util");
const JAVASCRIPT_PATH = "/blogs/javascript";
const WEBPACK_PATH = "/blogs/webpack";
const GIT_PATH = "/blogs/git";
const OTHERS_PATH = "/blogs/others";
const BROWSER_PATH = '/blogs/browser';
const NET_PATH = '/blogs/net'
module.exports = {
  [JAVASCRIPT_PATH]: [
    createSideBarConfig('JS-基础', JAVASCRIPT_PATH + '/js-base'),
    createSideBarConfig("JS-进阶", JAVASCRIPT_PATH + "/js-advanced"),
  ],
  [NET_PATH]: [
    createSideBarConfig("TCP 协议", NET_PATH + '/tcp'),
    createSideBarConfig("HTTP 协议", NET_PATH + '/http')
  ],
  [BROWSER_PATH]: [
    createSideBarConfig('浏览器渲染', BROWSER_PATH + '/browser-render'),
    createSideBarConfig('浏览器安全', BROWSER_PATH + '/browser-security'),
  ],
  [WEBPACK_PATH]: [createSideBarConfig("webpack相关", WEBPACK_PATH)],
  [GIT_PATH]: [createSideBarConfig("Git使用", GIT_PATH + '/git-base')],
  [OTHERS_PATH]: [createSideBarConfig("Others", OTHERS_PATH + '/others-svg')],
};
