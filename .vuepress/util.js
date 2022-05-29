const fs = require('fs');
const path = require('path');
const getFile = (prefixPath) => {
  return fs.readdirSync(path.join(process.cwd(), prefixPath))
           .map(item => `${prefixPath}/${item.replace('.md', '')}`)
}

const createSideBarConfig = (title, prefixPath, collapsable = true) => {
  return  {
    title,
    collapsable,
    children: getFile(prefixPath)
  }
}

const homeHeaderImages = {
  local: [
    {
      path: "/home-bg/1.jpg",
      mask: "rgba(40, 57, 101, .4)"
    },
    {
      path: "/home-bg/2.jpg",
      mask: "rgba(196, 176, 131, .1)"
    },
    {
      path: "/home-bg/3.jpg",
      mask: "rgba(68, 74, 83, .1)"
    },
    {
      path: "/home-bg/4.jpg",
      mask: "rgba(19, 75, 50, .2)"
    },
    {
      path: "/home-bg/5.jpg"
    }
  ]
}

module.exports = {
  createSideBarConfig,
  homeHeaderImages
}