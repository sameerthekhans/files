#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
Usage:
  do-git commit                  # Fixup to last normal commit
  do-git rebase                  # Rebase with autosquash onto origin/main
`);
  process.exit(0);
}

const [command] = args;

switch (command) {
  case 'commit':
    handleCommit();
    break;

  case 'rebase':
    handleRebase();
    break;

  default:
    console.log(`❓ Unknown command: ${command}`);
    process.exit(1);
}

async function handleCommit() {
  const target = getLastNonFixupCommit();
  if (!target) {
    console.warn(
      'Looks like this is your first commit. Please provide a commit message.'
    );
    handleFirstCommit();
    return;
  }
  run('git add -A');
  run(`git commit --fixup=${target}`);
}

async function handleFirstCommit() {
  const message = await askQuestion();
  if (!message) {
    console.error('❌ Commit message cannot be empty.');
    handleFirstCommit();
    return;
  }
  run('git add -A');
  run(`git commit -m "${message}"`);
}

function handleRebase() {
  run('git fetch origin');
  run('git rebase --autosquash origin/main');
}

// Utils
function run(cmd) {
  execSync(cmd, { stdio: 'inherit' });
}

function askQuestion() {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('Enter commit message: ', (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function getLastNonFixupCommit() {
  try {
    // Get the merge-base between your branch and main
    const base = execSync('git merge-base HEAD origin/main').toString().trim();

    // Get only commits on your branch since the merge base
    const log = execSync(
      `git log ${base}..HEAD --pretty=format:"%h %s"`
    ).toString();

    // Find the most recent non-fixup commit
    const lines = log.split('\n');
    for (const line of lines) {
      if (!line.includes('fixup!')) {
        return line.split(' ')[0];
      }
    }
  } catch (err) {
    console.error('❌ Failed to find a suitable commit for fixup.');
  }
  return null;
}
