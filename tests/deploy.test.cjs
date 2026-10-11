const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync, spawnSync } = require('node:child_process');
const test = require('node:test');

function createFixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'blog-deploy-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const project = path.join(root, 'project with spaces');
  const remote = path.join(root, 'pages.git');
  const seed = path.join(root, 'existing site');
  const bin = path.join(root, 'bin');
  fs.mkdirSync(project);
  fs.mkdirSync(bin);
  fs.mkdirSync(seed);
  fs.copyFileSync(path.join(__dirname, '../deploy.sh'), path.join(project, 'deploy.sh'));
  fs.writeFileSync(path.join(bin, 'yarn'), `#!/bin/sh
set -eu
test "$1" = "build"
test "\${BUILD_FAIL:-0}" != "1"
mkdir -p public
printf '%s' "\${BUILD_CONTENT:-site}" > public/index.html
`, { mode: 0o755 });
  // 测试只访问本地仓库，不使用开发者的 GitHub 登录信息。
  fs.writeFileSync(path.join(bin, 'gh'), '#!/bin/sh\nexit 1\n', { mode: 0o755 });
  const rsync = execFileSync('sh', ['-c', 'command -v rsync'], { encoding: 'utf8' }).trim();
  fs.writeFileSync(path.join(bin, 'rsync'), `#!/bin/sh
set -eu
if test "\${1:-}" = "--server"; then
  exec "${rsync}" "$@"
fi
"${rsync}" "$@"
if test -n "\${COMPETING_REPO:-}"; then
  git -C "$COMPETING_REPO" commit --allow-empty -m 'parallel update'
  git -C "$COMPETING_REPO" push origin HEAD:master
fi
`, { mode: 0o755 });
  const env = {
    ...process.env,
    PATH: `${bin}${path.delimiter}${process.env.PATH}`,
    GIT_CONFIG_GLOBAL: path.join(root, 'gitconfig'),
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_TERMINAL_PROMPT: '0'
  };
  const git = (...args) => execFileSync('git', args, { cwd: root, env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  git('config', '--global', 'init.defaultBranch', 'main');
  git('config', '--global', 'user.name', 'Deploy Test');
  git('config', '--global', 'user.email', 'deploy@example.invalid');
  git('config', '--global', `url.${remote}.insteadOf`, 'https://github.com/wohaidingdezhu/wohaidingdezhu.github.io.git');
  git('init', '--bare', remote);
  git('-C', seed, 'init');
  fs.mkdirSync(path.join(seed, 'fe-interview'));
  fs.mkdirSync(path.join(seed, 'assets'));
  fs.writeFileSync(path.join(seed, 'index.html'), 'original site');
  fs.writeFileSync(path.join(seed, 'fe-interview/index.html'), 'library');
  fs.writeFileSync(path.join(seed, 'assets/old.js'), 'cached resource');
  git('-C', seed, 'add', '.');
  git('-C', seed, 'commit', '-m', 'initial site');
  git('-C', seed, 'remote', 'add', 'origin', remote);
  git('-C', seed, 'push', 'origin', 'HEAD:master');
  const initialCommit = git('--git-dir', remote, 'rev-parse', 'master');
  const deploy = (overrides = {}) => spawnSync('sh', [path.join(project, 'deploy.sh')], {
    cwd: root,
    env: { ...env, ...overrides },
    encoding: 'utf8',
    timeout: 15000
  });
  return { project, remote, seed, initialCommit, git, deploy };
}

test('发布保留历史、其他站点与旧资源，并可重复发布', (t) => {
  const { project, remote, initialCommit, git, deploy } = createFixture(t);
  const first = deploy();
  assert.equal(first.status, 0, first.stderr);
  assert.equal(fs.existsSync(path.join(project, 'public/.git')), false);
  const commit = git('--git-dir', remote, 'rev-parse', 'master');
  assert.equal(git('--git-dir', remote, 'show', 'master:index.html'), 'site');
  assert.equal(git('--git-dir', remote, 'show', 'master:.nojekyll'), '');
  assert.equal(git('--git-dir', remote, 'show', 'master:fe-interview/index.html'), 'library');
  assert.equal(git('--git-dir', remote, 'show', 'master:assets/old.js'), 'cached resource');
  assert.equal(git('--git-dir', remote, 'rev-parse', 'master^'), initialCommit);

  const repeated = deploy();
  assert.equal(repeated.status, 0, repeated.stderr);
  assert.equal(git('--git-dir', remote, 'rev-parse', 'master'), commit);

  const updated = deploy({ BUILD_CONTENT: 'updated site' });
  assert.equal(updated.status, 0, updated.stderr);
  assert.equal(git('--git-dir', remote, 'show', 'master:index.html'), 'updated site');
  assert.notEqual(git('--git-dir', remote, 'rev-parse', 'master'), commit);
});

test('构建失败时停止发布', (t) => {
  const { project, remote, initialCommit, git, deploy } = createFixture(t);
  const failed = deploy({ BUILD_FAIL: '1' });
  assert.notEqual(failed.status, 0);
  assert.equal(fs.existsSync(path.join(project, 'public')), false);
  assert.equal(git('--git-dir', remote, 'rev-parse', 'master'), initialCommit);
});

test('远端在部署期间更新时停止推送，不覆盖新提交', (t) => {
  const { remote, seed, git, deploy } = createFixture(t);
  const failed = deploy({ COMPETING_REPO: seed });
  assert.notEqual(failed.status, 0, failed.stderr);
  assert.equal(git('--git-dir', remote, 'log', '-1', '--format=%s', 'master'), 'parallel update', failed.stderr);
  assert.equal(git('--git-dir', remote, 'show', 'master:index.html'), 'original site');
});
