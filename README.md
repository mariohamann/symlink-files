# symlink-files

`symlink-files` is a utility package for creating, managing, and persisting symbolic links based on provided configuration. Whether you are managing symlinks for development, deployment, or any other reason, this tool provides you a flexible interface both programmatically and via the command line.

## Installation

`npm install symlink-files`

## API Usage

### Create Symlinks

```js
import { createSymlinks } from "symlink-files";

const config = [
	{
		source: "./sourceDirectory",
		target: "./targetDirectory",
		globs: ["**/*.js"],
		overrideFiles: true, // default: false
	},
];

createSymlinks(config);
```

### Remove Symlinks

```js
import { removeSymlinks } from "symlink-files";
const config = [
	{
		target: "./targetDirectory",
		globs: ["**/*.js"],
		removeEmptyDirs: true, // default: false
	},
];

removeSymlinks(config);
```

### Persist Symlinks

If you wish to replace symlinks with the actual files they point to:

```js
import { persistSymlinks } from "symlink-files";

const config = [
	{
		target: "./targetDirectory",
		globs: ["**/*.js"],
	},
];

persistSymlinks(config);
```

## CLI Usage

The package also offers a Command Line Interface to manage symlinks. After installation, you can access the CLI using the command `symlink-files`.

### Create Symlinks

`symlink-files create -s ./sourceDirectory -t ./targetDirectory -g **/*.js -o true`

### Remove Symlinks

`symlink-files remove -t ./targetDirectory -g **/*.js -r true`

### Persist Symlinks

`symlink-files persist -t ./targetDirectory -g **/*.js`

## Configuration Options

| Parameter              | Description                                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `source` (-s)          | The path to the source directory.                                                                                      |
| `target` (-t)          | The path to the target directory.                                                                                      |
| `globs` (-g)           | Array of glob patterns to determine which files or directories to symlink.                                             |
| `overrideFiles` (-o)   | (Optional) Boolean value to decide if existing files should be overridden. Default is `false`.                         |
| `removeEmptyDirs` (-r) | (Optional) Boolean value to decide if empty directories should be removed after removing symlinks. Default is `false`. |

Note: The CLI parameters in parentheses are used if you are using the CLI.

## Contributing

Please raise an issue or a pull request if you'd like to contribute to the project.

## License

MIT License
