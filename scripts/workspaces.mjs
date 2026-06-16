import { spawn } from 'node:child_process';
import process from 'node:process';

const task = process.argv[2];
const workspaces = [
  '@dsa-analyzer/shared',
  '@dsa-analyzer/analyzer',
  '@dsa-analyzer/extension',
  '@dsa-analyzer/backend',
];

function spawnNpm(args) {
  return spawn(`npm ${args.join(' ')}`, {
    stdio: 'inherit',
    shell: true,
  });
}

function runWorkspaceTask(script, workspace) {
  return new Promise((resolve, reject) => {
    const child = spawnNpm(['run', script, '--workspace', workspace, '--if-present']);

    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${workspace} failed during ${script} with exit code ${code ?? 'unknown'}`));
    });
  });
}

async function runSequential(script, targets = workspaces) {
  for (const workspace of targets) {
    await runWorkspaceTask(script, workspace);
  }
}

async function runDev() {
  const children = workspaces.map(workspace => spawnNpm(['run', 'dev', '--workspace', workspace, '--if-present']));

  const stopAll = signal => {
    for (const child of children) {
      if (!child.killed) {
        child.kill(signal);
      }
    }
  };

  process.on('SIGINT', () => stopAll('SIGINT'));
  process.on('SIGTERM', () => stopAll('SIGTERM'));

  await Promise.all(
    children.map(
      child =>
        new Promise((resolve, reject) => {
          child.on('error', reject);
          child.on('exit', code => {
            if (code === 0 || code === null) {
              resolve();
              return;
            }

            stopAll('SIGTERM');
            reject(new Error(`A dev workspace exited with code ${code}`));
          });
        })
    )
  );
}

async function runClean() {
  await runSequential('clean');
  await new Promise((resolve, reject) => {
    const child = spawnNpm(['exec', 'rimraf', 'node_modules']);

    child.on('error', reject);
    child.on('exit', code => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Root cleanup failed with exit code ${code ?? 'unknown'}`));
    });
  });
}

async function main() {
  switch (task) {
    case 'build':
    case 'lint':
    case 'type-check':
      await runSequential(task);
      break;
    case 'test':
      await runSequential('build');
      await runSequential('test');
      break;
    case 'dev':
      await runDev();
      break;
    case 'clean':
      await runClean();
      break;
    default:
      throw new Error(`Unsupported task: ${task ?? 'undefined'}`);
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
