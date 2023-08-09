import fs from 'fs';
import path from 'path';
import { globby } from 'globby';

/**
 * @typedef {Object} Entry
 * @property {string} source - The path to the source folder (only for createSymlinks).
 * @property {string} target - The path to the target folder.
 * @property {string[]} globs - An array of glob patterns.
 * @property {boolean} [overrideFiles=false] - Whether to override existing files (only for createSymlinks).
 * @property {boolean} [removeEmptyDirs=false] - Whether to remove empty directories after deleting symlinks (only for removeSymlinks).
 */

/**
 * Ensures that the provided directory exists.
 * @param {string} directory - The path to the directory.
 */

function ensureDirExists(directory) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

/**
 * Creates symlinks based on the provided configuration.
 * @async
 * @param {Entry[]} entries - An array of entries to process.
 * @param {Object} [options={}] - Additional options for the `globby` package.
 */
export async function createSymlinks(entries, options = {}) {
  for (let entry of entries) {
    const { source, globs, target, overrideFiles } = entry;

    const matchedPaths = await globby(globs, {
      cwd: source,
      ...options
    });

    for (let matchedPath of matchedPaths) {
      const sourcePath = path.join(source, matchedPath);
      const targetPath = path.join(target, matchedPath);

      // Ensure the directory exists
      ensureDirExists(path.dirname(targetPath));

      if (fs.existsSync(targetPath)) {
        if (overrideFiles) {
          fs.unlinkSync(targetPath);
        } else if (fs.lstatSync(targetPath).isSymbolicLink()) {
          fs.unlinkSync(targetPath);
        } else {
          continue; // Skip if overrideFiles is false and it's not a symlink.
        }
      }

      fs.symlinkSync(sourcePath, targetPath);
    }
  }
}

/**
 * Recursively removes empty directories upwards.
 * @param {string} dirPath - The path of the directory to check.
 */
function removeEmptyDirectories(dirPath) {
  // Base case: if the directory path is root or not existing, we don't want to proceed further
  if (!dirPath || dirPath === '/' || !fs.existsSync(dirPath)) return;

  // Check if directory is empty
  if (fs.readdirSync(dirPath).length === 0) {
    fs.rmdirSync(dirPath);
    removeEmptyDirectories(path.dirname(dirPath)); // Move up to the parent directory
  }
}

/**
 * Removes symlinks in the target folder that match the provided glob patterns.
 * @async
 * @param {Entry[]} entries - An array of entries to process.
 * @param {Object} [options={}] - Additional options for the `globby` package.
 */
export async function removeSymlinks(entries, options = {}) {
  for (let entry of entries) {
    const { target, globs, removeEmptyDirs = false } = entry;

    const matchedPaths = await globby(globs, {
      cwd: target,
      onlyFiles: false, // To also match directories which are symlinks.
      ...options
    });

    for (let matchedPath of matchedPaths) {
      const fullPath = path.join(target, matchedPath);

      if (fs.lstatSync(fullPath).isSymbolicLink()) {
        fs.unlinkSync(fullPath); // Remove the symlink.

        if (removeEmptyDirs) {
          removeEmptyDirectories(path.dirname(fullPath));
        }
      }
    }
  }
}

/**
 * Replaces symlinks with the actual files they point to.
 * @async
 * @param {Entry[]} entries - An array of entries to process.
 * @param {Object} [options={}] - Additional options for the `globby` package.
 */
export async function persistSymlinks(entries, options = {}) {
  for (let entry of entries) {
    const { target, globs } = entry;

    const matchedPaths = await globby(globs, {
      cwd: target,
      onlyFiles: false, // To also match directories which are symlinks.
      ...options
    });

    for (let matchedPath of matchedPaths) {
      const fullPath = path.join(target, matchedPath);

      if (fs.lstatSync(fullPath).isSymbolicLink()) {
        const realPath = fs.realpathSync(fullPath);
        fs.unlinkSync(fullPath); // Remove the symlink.
        fs.copyFileSync(realPath, fullPath); // Copy the real file to the symlink's location.
      }
    }
  }
}
