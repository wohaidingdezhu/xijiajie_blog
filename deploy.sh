#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -eu

# 从项目根目录运行，支持从其他目录调用脚本
cd "$(dirname "$0")"

# 生成静态文件
yarn build

# 在现有发布分支上更新，保留历史和构建目录之外的站点内容。
# HTTPS 可使用 Git 凭证；已登录 GitHub CLI 时复用它的凭证助手。
git_publish() {
  if command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; then
    git -c credential.helper='!gh auth git-credential' "$@"
  else
    git "$@"
  fi
}

release_dir=$(mktemp -d "${TMPDIR:-/tmp}/xijiajie-blog-deploy.XXXXXX")
trap 'rm -rf "$release_dir"' EXIT HUP INT TERM
git_publish clone --depth 1 --single-branch --branch master \
  https://github.com/wohaidingdezhu/wohaidingdezhu.github.io.git "$release_dir"

# 不删除发布仓库中的其他路径，旧资源也保留以兼容已打开的页面。
rsync -a --exclude=.git public/ "$release_dir/"
touch "$release_dir/.nojekyll"
git -C "$release_dir" add .
if ! git -C "$release_dir" diff --cached --quiet; then
  git -C "$release_dir" commit -m 'chore(deploy): publish blog'
  git_publish -C "$release_dir" push origin HEAD:master
fi

