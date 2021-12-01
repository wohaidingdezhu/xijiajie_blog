const { createSideBarConfig } = require('./util')
const  WEBPACK_PATH = '/blogs/webpack'


module.exports = {
    [WEBPACK_PATH]: [createSideBarConfig('webpack相关', WEBPACK_PATH)]
}