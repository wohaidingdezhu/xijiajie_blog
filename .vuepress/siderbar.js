const { createSideBarConfig } = require("./util");
const JAVASCRIPT_PATH = "/blogs/javascript";
const WEBPACK_PATH = "/blogs/webpack";

module.exports = {
  [JAVASCRIPT_PATH]: [
    createSideBarConfig('JS-基础', JAVASCRIPT_PATH + '/js-base'),
    createSideBarConfig("JS-进阶", JAVASCRIPT_PATH + "/js-advanced"),
  ],
  [WEBPACK_PATH]: [createSideBarConfig("webpack相关", WEBPACK_PATH)],
};
