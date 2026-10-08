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
  const bin = path.join(root, 'bin');
  fs.mkdirSync(project);
  fs.mkdirSync(bin);
  fs.copyFileSync(path.join(__dirname, '../deploy.sh'), path.join(project, 'deploy.sh'));
  fs.writeFileSync(path.join(bin, 'yarn'), `#!/bin/sh
set -eu
test "$1" = "build"
test "\${BUILD_FAIL:-0}" != "1"
mkdir -p public
printf '%s' "\${BUILD_CONTENT:-site}" > public/index.html
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
  git('config', '--global', `url.${remote}.insteadOf`, 'git@github.com:wohaidingdezhu/wohaidingdezhu.github.io.git');
  git('init', '--bare', remote);
  const deploy = (overrides = {}) => spawnSync('sh', [path.join(project, 'deploy.sh')], {
    cwd: root,
    env: { ...env, ...overrides },
    encoding: 'utf8',
    timeout: 15000
  });
  return { project, remote, git, deploy };
}

test('默认 main 分支可发布到 master，并可重复发布', (t) => {
  const { project, remote, git, deploy } = createFixture(t);
  const first = deploy();
  assert.equal(first.status, 0, first.stderr);
  assert.equal(git('-C', path.join(project, 'public'), 'branch', '--show-current'), 'main');
  const commit = git('--git-dir', remote, 'rev-parse', 'master');
  assert.equal(git('--git-dir', remote, 'show', 'master:index.html'), 'site');
  assert.equal(git('--git-dir', remote, 'show', 'master:.nojekyll'), '');

  const repeated = deploy();
  assert.equal(repeated.status, 0, repeated.stderr);
  assert.equal(git('--git-dir', remote, 'rev-parse', 'master'), commit);

  const updated = deploy({ BUILD_CONTENT: 'updated site' });
  assert.equal(updated.status, 0, updated.stderr);
  assert.equal(git('--git-dir', remote, 'show', 'master:index.html'), 'updated site');
  assert.notEqual(git('--git-dir', remote, 'rev-parse', 'master'), commit);
});

test('构建失败时停止发布', (t) => {
  const { project, remote, git, deploy } = createFixture(t);
  const failed = deploy({ BUILD_FAIL: '1' });
  assert.notEqual(failed.status, 0);
  assert.equal(fs.existsSync(path.join(project, 'public')), false);
  assert.equal(git('--git-dir', remote, 'for-each-ref', '--format=%(refname)'), '');
});
