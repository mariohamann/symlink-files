import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import {
  createSymlinks,
  removeSymlinks,
  persistSymlinks
} from '../index.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cliPath = path.join(__dirname, '../cli.js');

const config = [
  {
    source: path.resolve('./test/source'),
    globs: ['**/*'],
    target: path.resolve('./test/target')
  }
];

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

function checkIfSymlinks(filepath) {
  const fullpath = path.resolve(config[0].target, filepath);
  return fs.existsSync(fullpath) && fs.lstatSync(fullpath).isSymbolicLink();
}

function checkIfFileExists(filepath) {
  const fullpath = path.resolve(config[0].target, filepath);
  return fs.existsSync(fullpath) && !fs.lstatSync(fullpath).isSymbolicLink();
}

function checkIfDirExists(dirpath) {
  const fullpath = path.resolve(config[0].target, dirpath);
  return fs.existsSync(fullpath) && fs.lstatSync(fullpath).isDirectory();
}

async function runTests(useCLI = false) {
  const source = `"${config[0].source}"`;
  const target = `"${config[0].target}"`;
  const globs = `"${config[0].globs.join(',')}"`;

  // 1. createSymlinks
  if (useCLI) {
    await execPromise(`${cliPath} create -s ${source} -t ${target} -g ${globs}`);
  } else {
    await createSymlinks(config);
  }
  console.assert(await checkIfSymlinks('file.txt'), 'file.txt should be a symlink after createSymlinks');
  console.assert(await checkIfSymlinks('folder/nested-file.txt'), 'nested-file.txt should be a symlink after createSymlinks');

  // 2. removeSymlinks
  if (useCLI) {
    await execPromise(`${cliPath} remove -t ${target} -g ${globs}`);
  } else {
    await removeSymlinks(config);
  }
  console.assert(!await checkIfSymlinks('file.txt'), 'file.txt symlink should be removed after removeSymlinks');
  console.assert(!await checkIfSymlinks('file.txt'), 'file.txt symlink should be removed after removeSymlinks');
  console.assert(!await checkIfSymlinks('folder/nested-file.txt'), 'nested-file.txt symlink should be removed after removeSymlinks');
  console.assert(await checkIfDirExists('folder'), 'folder should not be removed in default state');

  // 3. createSymlinks
  if (useCLI) {
    await execPromise(`${cliPath} create -s ${source} -t ${target} -g ${globs}`);
  } else {
    await createSymlinks(config);
  }

  // 4. persistSymlinks
  if (useCLI) {
    await execPromise(`${cliPath} persist -t ${target} -g ${globs}`);
  } else {
    await persistSymlinks(config);
  }
  console.assert(await checkIfFileExists('file.txt'), 'file.txt should be a real file after persistSymlinks');
  console.assert(await checkIfFileExists('folder/nested-file.txt'), 'nested-file.txt should be a real file after persistSymlinks');

  // 5. createSymlinks (no override by default)
  if (useCLI) {
    await execPromise(`${cliPath} create -s ${source} -t ${target} -g ${globs}`);
  } else {
    await createSymlinks(config);
  }
  console.assert(await checkIfFileExists('file.txt'), 'file.txt should still be a real file after createSymlinks without override');
  console.assert(await checkIfFileExists('folder/nested-file.txt'), 'nested-file.txt should still be a real file after createSymlinks without override');

  // 6. createSymlinks with override
  config[0].overrideFiles = true;
  if (useCLI) {
    await execPromise(`${cliPath} create -s ${source} -t ${target} -g ${globs} -o`);
  } else {
    await createSymlinks(config);
  }
  console.assert(await checkIfSymlinks('file.txt'), 'file.txt should be a symlink after createSymlinks with override');
  console.assert(await checkIfSymlinks('folder/nested-file.txt'), 'nested-file.txt should be a symlink after createSymlinks with override');

  // 7. removeSymlinks
  if (useCLI) {
    await execPromise(`${cliPath} remove -t ${target} -g ${globs}`);
  } else {
    await removeSymlinks(config);
  }
  console.assert(!await checkIfSymlinks('file.txt'), 'file.txt symlink should be removed after final removeSymlinks');
  console.assert(!await checkIfSymlinks('folder/nested-file.txt'), 'nested-file.txt symlink should be removed after final removeSymlinks');

  // 8. Test for removeEmptyDirs
  // Re-create symlinks first
  if (useCLI) {
    await execPromise(`${cliPath} create -s ${source} -t ${target} -g ${globs}`);
  } else {
    await createSymlinks(config);
  }

  // As we don't have a direct CLI flag for removeEmptyDirs, it's assumed you'll manage that configuration outside the test for CLI tests.
  config[0].removeEmptyDirs = true;
  if (useCLI) {
    await execPromise(`${cliPath} remove -t ${target} -g ${globs} --removeEmptyDirs`);
  } else {
    await removeSymlinks(config);
  }
  console.assert(!await checkIfDirExists('folder'), 'folder should be removed after removeSymlinks with removeEmptyDirs set to true');

  console.log(`Tests ${useCLI ? 'with' : 'without'} CLI passed!`);
}

runTests().catch((error) => {
  console.error('Error during tests:', error);
});

runTests(true).catch((error) => {
  console.error('Error during CLI tests:', error);
});
