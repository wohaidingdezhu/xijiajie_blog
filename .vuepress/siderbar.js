const { createSideBarConfig } = require("./util");
const JAVASCRIPT_PATH = "/blogs/javascript";
const TYPESCRIPT_PATH = "/blogs/typescript";
const WEBPACK_PATH = "/blogs/webpack";
const OTHERS_PATH = "/blogs/others";
// const BROWSER_PATH = "/blogs/browser";
// const NET_PATH = "/blogs/net";
const NODE_PATH = "/blogs/node";
module.exports = {
    [JAVASCRIPT_PATH]: [
        createSideBarConfig("Js-基础", JAVASCRIPT_PATH + "/js-base"),
        createSideBarConfig("Js-进阶", JAVASCRIPT_PATH + "/js-advanced"),
    ],
    [TYPESCRIPT_PATH]: [createSideBarConfig("Typescript", TYPESCRIPT_PATH)],
    // [NET_PATH]: [
    //     createSideBarConfig("TCP 协议", NET_PATH + "/tcp"),
    //     createSideBarConfig("HTTP 协议", NET_PATH + "/http"),
    // ],
    // [BROWSER_PATH]: [
    //     createSideBarConfig("浏览器渲染", BROWSER_PATH + "/browser-render"),
    //     createSideBarConfig("浏览器安全", BROWSER_PATH + "/browser-security"),
    // ],
    [WEBPACK_PATH]: [createSideBarConfig("Webpack相关", WEBPACK_PATH)],
    [OTHERS_PATH]: [createSideBarConfig("Others", OTHERS_PATH)],
    [NODE_PATH]: [
        createSideBarConfig("Node", NODE_PATH + "/express"),
        createSideBarConfig("Node", NODE_PATH + "/nodemon"),
    ],
};