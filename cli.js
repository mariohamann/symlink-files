#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { createSymlinks, removeSymlinks, persistSymlinks } from './index.js';

const argv = yargs(hideBin(process.argv))
  .usage('Usage: $0 <command> [options]')
  .command('create', 'Create symlinks based on the configuration', (yargs) => {
    yargs.option('source', {
      alias: 's',
      type: 'string',
      description: 'Source directory path',
      demandOption: true
    }).option('target', {
      alias: 't',
      type: 'string',
      description: 'Target directory path',
      demandOption: true
    }).option('globs', {
      alias: 'g',
      type: 'array',
      description: 'Array of glob patterns',
      demandOption: true
    }).option('overrideFiles', {
      alias: 'o',
      type: 'boolean',
      description: 'Whether to override existing files'
    });
  })
  .command('remove', 'Remove symlinks based on the configuration', (yargs) => {
    yargs.option('target', {
      alias: 't',
      type: 'string',
      description: 'Target directory path',
      demandOption: true
    }).option('globs', {
      alias: 'g',
      type: 'array',
      description: 'Array of glob patterns to remove symlinks',
      demandOption: true
    }).option('removeEmptyDirs', {
      alias: 'r',
      type: 'boolean',
      description: 'Whether to remove empty directories after symlink removal'
    });
  })
  .command('persist', 'Replace symlinks with actual files', (yargs) => {
    yargs.option('target', {
      alias: 't',
      type: 'string',
      description: 'Target directory path',
      demandOption: true
    }).option('globs', {
      alias: 'g',
      type: 'array',
      description: 'Array of glob patterns to make symlinks persistent',
      demandOption: true
    });
  })
  .help('h')
  .alias('h', 'help')
  .argv;

function getConfigFromArgs(argv) {
  return {
    source: argv.source,
    target: argv.target,
    globs: argv.globs,
    overrideFiles: argv.overrideFiles,
    removeEmptyDirs: argv.removeEmptyDirs  // added this line
  };
}

async function run() {
  try {
    if (argv._.includes('create')) {
      console.log(`Creating symlinks from ${argv.source} to ${argv.target}`);
      await createSymlinks([getConfigFromArgs(argv)]);
      console.log(`Successfully created symlinks.`);
    } else if (argv._.includes('remove')) {
      console.log(`Removing symlinks in ${argv.target}`);
      await removeSymlinks([getConfigFromArgs(argv)]);
      console.log(`Successfully removed symlinks.`);
    } else if (argv._.includes('persist')) {
      console.log(`Persisting symlinks in ${argv.target}...`);
      await persistSymlinks([getConfigFromArgs(argv)]);
      console.log(`Successfully persisted symlinks.`);
    } else {
      console.error('Unknown command. Use --help for available commands.');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

run();
