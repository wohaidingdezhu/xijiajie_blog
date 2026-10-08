# 本地开发与发布

项目统一使用 Node.js 22.22.2 和 Yarn 1.22.22，依赖版本由 `yarn.lock` 锁定。

VuePress 1 使用的 Webpack 4 需要旧版哈希算法；开发和构建命令已通过 Node.js 启动参数开启兼容支持，无需全局设置 `NODE_OPTIONS`。

```sh
nvm use
npm install --global yarn@1.22.22
yarn install --frozen-lockfile
yarn dev
```

开发服务器地址为 `http://localhost:9999/`。文章放在 `blogs/` 对应分类目录中，使用 Markdown front matter 设置标题、日期、分类和标签；已有分类的侧边栏会自动收集 `.md` 文件，并按文件名的数字顺序排列。

```sh
yarn test
yarn build
```

构建产物写入根目录 `public/`，源图片和音乐放在 `.vuepress/public/`。

发布前确保 Git 提交身份已配置，并具有发布仓库的 SSH 推送权限：

```sh
yarn deploy
```

此命令会构建网站，将构建产物强制推送到 `wohaidingdezhu/wohaidingdezhu.github.io` 的 `master` 分支。修改文章、配置和样式后，应将源码提交到 `xijiajie_blog` 仓库。
