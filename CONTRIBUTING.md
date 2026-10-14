# 本地开发与发布

项目统一使用 Node.js 22.22.2 和 Yarn 1.22.22，依赖版本由 `yarn.lock` 锁定。

VuePress 1 使用的 Webpack 4 需要旧版哈希算法；开发和构建命令已通过 Node.js 启动参数开启兼容支持，无需全局设置 `NODE_OPTIONS`。

```sh
nvm use
npm install --global yarn@1.22.22
yarn install --frozen-lockfile
yarn dev
```

开发服务器地址为 `http://localhost:9999/`。文章放在 `blogs/` 对应分类目录中，使用 Markdown front matter 设置标题、日期、分类和标签。文章列表、同分类侧栏及上一篇/下一篇统一按发布时间倒序；分类顺序由 `.vuepress/lib/posts.js` 中的 `categoryOrder` 固定。

## 页面与样式

博客以 `fe-interview` 的浅色界面为视觉基准。统一入口是 `.vuepress/components/GlobalLayout.vue`，导航、列表、文章和目录组件位于同目录的 `blog/` 中；继续使用 reco 提供的文章与分类路由，已有链接保持可用。

全站配色、布局和响应式规则集中在 `.vuepress/styles/index.styl`，基础尺寸在 `palette.styl` 中。桌面顶栏为 80px、左栏为 264px；760px 以下收起左栏，1150px 以下将文章目录显示为可折叠浮层。浅色是唯一展示主题，与当前资料库一致。

桌面正文为 14px，手机端为 16px，兼顾资料库的阅读密度与小屏可读性。搜索框提供清空按钮，按 Escape 也可清空当前搜索；手机菜单打开时，搜索与正文暂时不可交互，关闭后恢复。

文章目录和正文末尾提供回到文章开头的链接；小屏从目录返回后会自动收起目录，键盘焦点也回到正文。

文章代码块提供复制按钮。浏览器复制接口不可用时会尝试备用方式；两种方式都失败则提示手动选择复制，换页后不再处理旧文章的复制结果。

文章请补充 `description`，用于列表摘要和文章头部。列表每页 8 篇，按发布时间倒序排列；`publish: false` 的文章不会进入列表、搜索、归档和站点地图。搜索匹配标题、摘要、分类、标签、小节标题与正文（包括代码），按相关程度排序并显示安全的关键词高亮片段。正文索引仅在搜索时加载，加载失败时保留标题等信息的搜索并提供重试入口。可使用 `⌘/Ctrl + K` 聚焦后按回车搜索，查询与页码保存在 URL 中。

在分类、标签和归档页搜索会保留当前范围，首页和文章页搜索全部文章；切换侧栏分类会保留关键词并重置页码，清空搜索只移除关键词。查询与页码支持刷新、分享和浏览器返回。

长文可设置 `tocDepth: 2` 仅展示主要章节，并通过 `readingGuide` 配置分章入口（`title` 为说明，`slug` 必须对应原有标题锚点）。标题调整不更改文件路径，Node.js 标签只统一显示名称，继续沿用 `/tag/node/`。

```sh
yarn test
yarn build
```

构建产物写入根目录 `public/`，源图片和音乐放在 `.vuepress/public/`。

`.vuepress/plugins/blog-content` 在构建时生成正文索引、分享图片、canonical、Open Graph 信息、`sitemap.xml` 和 `robots.txt`；正式域名在 `.vuepress/config.js` 的插件参数中配置。草稿、404、旧分页及空分类入口不参与收录，搜索查询的规范链接指向对应页面的基础地址。

全站关闭文章资源的自动预取，页面代码按访问加载。正文图片添加延迟加载、异步解码与本地图片尺寸；大于 32 KiB 的本地 PNG/JPEG 使用 Sharp 生成无损 WebP，仅在节省至少 10% 时替换页面引用。压缩结果缓存在 `.vuepress/.cache/blog-images/`，原图继续发布，代码块中的图片示例不会被改写。分享图由 `.vuepress/plugins/blog-content/social-card.svg` 生成 PNG。

发布前确保 Git 提交身份已配置，并具有发布仓库的推送权限。可使用 Git 的 HTTPS 凭证，或已登录的 GitHub CLI：

```sh
yarn deploy
```

此命令会构建网站，在 `wohaidingdezhu/wohaidingdezhu.github.io` 的现有 `master` 分支上提交构建产物并正常推送，保留发布历史与其他站点路径。发布期间分支若有新提交，推送会停止而不会覆盖；重新运行即可基于最新分支发布。旧资源保留，以兼容已经打开的页面。修改文章、配置和样式后，应将源码提交到 `xijiajie_blog` 仓库。
