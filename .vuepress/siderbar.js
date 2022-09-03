const { createSideBarConfig } = require("./util");
const JAVASCRIPT_PATH = "/blogs/javascript";
const WEBPACK_PATH = "/blogs/webpack";
const GIT_PATH = "/blogs/git";
const NODE_PATH = "/blogs/node";
module.exports = {
  [JAVASCRIPT_PATH]: [
    createSideBarConfig("JS-基础", JAVASCRIPT_PATH + "/js-base"),
    createSideBarConfig("JS-进阶", JAVASCRIPT_PATH + "/js-advanced"),
  ],
  [WEBPACK_PATH]: [createSideBarConfig("webpack相关", WEBPACK_PATH)],
  [GIT_PATH]: [createSideBarConfig("Git使用", GIT_PATH + "/git-base")],
  [NODE_PATH]: [createSideBarConfig("Node", NODE_PATH + "/express")],
  [NODE_PATH]: [createSideBarConfig("Node", NODE_PATH + "/nodemon")],
};
