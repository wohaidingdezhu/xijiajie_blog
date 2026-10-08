#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -eu

# 从项目根目录运行，支持从其他目录调用脚本
cd "$(dirname "$0")"

# 生成静态文件
yarn build

# 进入生成的文件夹
cd public

# 让 GitHub Pages 直接提供 VuePress 生成的静态文件
touch .nojekyll

git init
git add .
if ! git diff --cached --quiet; then
  git commit -m 'deploy'
fi

# 如果发布到 https://<USERNAME>.github.io  填写你刚刚创建的仓库地址
git push -f git@github.com:wohaidingdezhu/wohaidingdezhu.github.io.git HEAD:master

cd ..

