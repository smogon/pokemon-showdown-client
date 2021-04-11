"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseArgv;

function _core() {
  const data = require("@babel/core");

  _core = function () {
    return data;
  };

  return data;
}

const fs = require("fs");

const commander = require("commander");

const glob = require("glob");

commander.option("-f, --filename [filename]", "The filename to use when reading from stdin. This will be used in source-maps, errors etc.");
commander.option("--presets [list]", "A comma-separated list of preset names.", collect);
commander.option("--plugins [list]", "A comma-separated list of plugin names.", collect);
commander.option("--config-file [path]", "Path to a .babelrc file to use.");
commander.option("--env-name [name]", "The name of the 'env' to use when loading configs and plugins. " + "Defaults to the value of BABEL_ENV, or else NODE_ENV, or else 'development'.");
commander.option("--root-mode [mode]", "The project-root resolution mode. " + "One of 'root' (the default), 'upward', or 'upward-optional'.");
commander.option("--source-type [script|module]", "");
commander.option("--no-babelrc", "Whether or not to look up .babelrc and .babelignore files.");
commander.option("--ignore [list]", "List of glob paths to **not** compile.", collect);
commander.option("--only [list]", "List of glob paths to **only** compile.", collect);
commander.option("--no-highlight-code", "Enable or disable ANSI syntax highlighting of code frames. (on by default)");
commander.option("--no-comments", "Write comments to generated output. (true by default)");
commander.option("--retain-lines", "Retain line numbers. This will result in really ugly code.");
commander.option("--compact [true|false|auto]", "Do not include superfluous whitespace characters and line terminators.", booleanify);
commander.option("--minified", "Save as many bytes when printing. (false by default)");
commander.option("--auxiliary-comment-before [string]", "Print a comment before any injected non-user code.");
commander.option("--auxiliary-comment-after [string]", "Print a comment after any injected non-user code.");
commander.option("-s, --source-maps [true|false|inline|both]", "", booleanify);
commander.option("--source-map-target [string]", "Set `file` on returned source map.");
commander.option("--source-file-name [string]", "Set `sources[0]` on returned source map.");
commander.option("--source-root [filename]", "The root from which all sources are relative.");

if (!process.env.BABEL_8_BREAKING) {
  commander.option("--module-root [filename]", "Optional prefix for the AMD module formatter that will be prepended to the filename on module definitions.");
  commander.option("-M, --module-ids", "Insert an explicit id for modules.");
  commander.option("--module-id [string]", "Specify a custom name for module ids.");
}

commander.option("-x, --extensions [extensions]", "List of extensions to compile when a directory has been the input. [.es6,.js,.es,.jsx,.mjs]", collect);
commander.option("--keep-file-extension", "Preserve the file extensions of the input files.");
commander.option("-w, --watch", "Recompile files on changes.");
commander.option("--skip-initial-build", "Do not compile files before watching.");
commander.option("--incremental", "Only compile files with modification time before corresponding output file");
commander.option("-o, --out-file [out]", "Compile all input files into a single file.");
commander.option("-d, --out-dir [out]", "Compile an input directory of modules into an output directory.");
commander.option("--relative", "Compile into an output directory relative to input directory or file. Requires --out-dir [out]");
commander.option("-D, --copy-files", "When compiling a directory copy over non-compilable files.");
commander.option("--include-dotfiles", "Include dotfiles when compiling and copying non-compilable files.");
commander.option("--no-copy-ignored", "Exclude ignored files when copying non-compilable files.");
commander.option("--verbose", "Log everything. This option conflicts with --quiet");
commander.option("--quiet", "Don't log anything. This option conflicts with --verbose");
commander.option("--delete-dir-on-start", "Delete the out directory before compilation.");
commander.option("--out-file-extension [string]", "Use a specific extension for the output files");
commander.version("7.13.14" + " (@babel/core " + _core().version + ")");
commander.usage("[options] <files ...>");
commander.action(() => {});

function parseArgv(args) {
  commander.parse(args);
  const errors = [];
  let filenames = commander.args.reduce(function (globbed, input) {
    let files = glob.sync(input);
    if (!files.length) files = [input];
    return globbed.concat(files);
  }, []);
  filenames = Array.from(new Set(filenames));
  filenames.forEach(function (filename) {
    if (!fs.existsSync(filename)) {
      errors.push(filename + " does not exist");
    }
  });

  if (commander.outDir && !filenames.length) {
    errors.push("--out-dir requires filenames");
  }

  if (commander.outFile && commander.outDir) {
    errors.push("--out-file and --out-dir cannot be used together");
  }

  if (commander.relative && !commander.outDir) {
    errors.push("--relative requires --out-dir usage");
  }

  if (commander.watch) {
    if (!commander.outFile && !commander.outDir) {
      errors.push("--watch requires --out-file or --out-dir");
    }

    if (!filenames.length) {
      errors.push("--watch requires filenames");
    }
  }

  if (commander.skipInitialBuild && !commander.watch) {
    errors.push("--skip-initial-build requires --watch");
  }

  if (commander.incremental && !commander.outDir) {
    errors.push("--incremental requires --out-dir");
  }

  if (commander.deleteDirOnStart && !commander.outDir) {
    errors.push("--delete-dir-on-start requires --out-dir");
  }

  if (commander.verbose && commander.quiet) {
    errors.push("--verbose and --quiet cannot be used together");
  }

  if (!commander.outDir && filenames.length === 0 && typeof commander.filename !== "string" && commander.babelrc !== false) {
    errors.push("stdin compilation requires either -f/--filename [filename] or --no-babelrc");
  }

  if (commander.keepFileExtension && commander.outFileExtension) {
    errors.push("--out-file-extension cannot be used with --keep-file-extension");
  }

  if (errors.length) {
    console.error("babel:");
    errors.forEach(function (e) {
      console.error("  " + e);
    });
    return null;
  }

  const opts = commander.opts();
  const babelOptions = {
    presets: opts.presets,
    plugins: opts.plugins,
    rootMode: opts.rootMode,
    configFile: opts.configFile,
    envName: opts.envName,
    sourceType: opts.sourceType,
    ignore: opts.ignore,
    only: opts.only,
    retainLines: opts.retainLines,
    compact: opts.compact,
    minified: opts.minified,
    auxiliaryCommentBefore: opts.auxiliaryCommentBefore,
    auxiliaryCommentAfter: opts.auxiliaryCommentAfter,
    sourceMaps: opts.sourceMaps,
    sourceFileName: opts.sourceFileName,
    sourceRoot: opts.sourceRoot,
    babelrc: opts.babelrc === true ? undefined : opts.babelrc,
    highlightCode: opts.highlightCode === true ? undefined : opts.highlightCode,
    comments: opts.comments === true ? undefined : opts.comments
  };

  if (!process.env.BABEL_8_BREAKING) {
    Object.assign(babelOptions, {
      moduleRoot: opts.moduleRoot,
      moduleIds: opts.moduleIds,
      moduleId: opts.moduleId
    });
  }

  for (const key of Object.keys(babelOptions)) {
    if (babelOptions[key] === undefined) {
      delete babelOptions[key];
    }
  }

  return {
    babelOptions,
    cliOptions: {
      filename: opts.filename,
      filenames,
      extensions: opts.extensions,
      keepFileExtension: opts.keepFileExtension,
      outFileExtension: opts.outFileExtension,
      watch: opts.watch,
      skipInitialBuild: opts.skipInitialBuild,
      incremental: opts.incremental,
      outFile: opts.outFile,
      outDir: opts.outDir,
      relative: opts.relative,
      copyFiles: opts.copyFiles,
      copyIgnored: opts.copyFiles && opts.copyIgnored,
      includeDotfiles: opts.includeDotfiles,
      verbose: opts.verbose,
      quiet: opts.quiet,
      deleteDirOnStart: opts.deleteDirOnStart,
      sourceMapTarget: opts.sourceMapTarget
    }
  };
}

function booleanify(val) {
  if (val === "true" || val == 1) {
    return true;
  }

  if (val === "false" || val == 0 || !val) {
    return false;
  }

  return val;
}

function collect(value, previousValue) {
  if (typeof value !== "string") return previousValue;
  const values = value.split(",");
  return previousValue ? previousValue.concat(values) : values;
}