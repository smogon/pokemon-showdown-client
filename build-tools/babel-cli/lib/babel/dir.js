"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var util = _interopRequireWildcard(require("./util"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const debounce = require("lodash/debounce");

const slash = require("slash");

const path = require("path");

const fs = require("fs");

const FILE_TYPE = Object.freeze({
  NON_COMPILABLE: "NON_COMPILABLE",
  COMPILED: "COMPILED",
  IGNORED: "IGNORED",
  ERR_COMPILATION: "ERR_COMPILATION",
  NO_REBUILD_NEEDED: "NO_REBUILD_NEEDED"
});

function outputFileSync(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), {
    recursive: true
  });
  fs.writeFileSync(filePath, data);
}

async function _default({
  cliOptions,
  babelOptions
}) {
  const filenames = cliOptions.filenames;

  async function write(src, base) {
    let relative = path.relative(base, src);

    if (!util.isCompilableExtension(relative, cliOptions.extensions)) {
      return FILE_TYPE.NON_COMPILABLE;
    }

    relative = util.withExtension(relative, cliOptions.keepFileExtension ? path.extname(relative) : cliOptions.outFileExtension);
    const dest = getDest(relative, base);
    if (noRebuildNeeded(src, dest)) return FILE_TYPE.NO_REBUILD_NEEDED;

    try {
      const res = await util.compile(src, Object.assign({}, babelOptions, {
        sourceFileName: slash(path.relative(dest + "/..", src))
      }));
      if (!res) return FILE_TYPE.IGNORED;

      if (res.map && babelOptions.sourceMaps && babelOptions.sourceMaps !== "inline") {
        const mapLoc = dest + ".map";
        res.code = util.addSourceMappingUrl(res.code, mapLoc);
        res.map.file = path.basename(relative);
        outputFileSync(mapLoc, JSON.stringify(res.map));
      }

      outputFileSync(dest, res.code);
      util.chmod(src, dest);

      if (cliOptions.verbose) {
        console.log(src + " -> " + dest);
      }

      return FILE_TYPE.COMPILED;
    } catch (err) {
      if (cliOptions.watch) {
        console.error(err);
        return FILE_TYPE.ERR_COMPILATION;
      }

      throw err;
    }
  }

  function getDest(filename, base) {
    if (cliOptions.relative) {
      return path.join(base, cliOptions.outDir, filename);
    }

    return path.join(cliOptions.outDir, filename);
  }

  function noRebuildNeeded(src, dest) {
    if (!cliOptions.incremental) return false;

    try {
      const srcStat = fs.statSync(src);
      const destStat = fs.statSync(dest);
      if (srcStat.ctimeMs < destStat.ctimeMs) return true;
    } catch (e) {}

    return false;
  }

  async function handleFile(src, base) {
    const written = await write(src, base);

    if (cliOptions.copyFiles && written === FILE_TYPE.NON_COMPILABLE || cliOptions.copyIgnored && written === FILE_TYPE.IGNORED) {
      const filename = path.relative(base, src);
      const dest = getDest(filename, base);
      if (noRebuildNeeded(src, dest)) return false;
      outputFileSync(dest, fs.readFileSync(src));
      util.chmod(src, dest);
      return false;
    }

    return written === FILE_TYPE.COMPILED;
  }

  async function handle(filenameOrDir) {
    if (!fs.existsSync(filenameOrDir)) return 0;
    const stat = fs.statSync(filenameOrDir);

    if (stat.isDirectory()) {
      const dirname = filenameOrDir;
      let count = 0;
      const files = util.readdir(dirname, cliOptions.includeDotfiles);

      for (const filename of files) {
        const src = path.join(dirname, filename);
        const written = await handleFile(src, dirname);
        if (written) count += 1;
      }

      return count;
    } else {
      const filename = filenameOrDir;
      const written = await handleFile(filename, path.dirname(filename));
      return written ? 1 : 0;
    }
  }

  let compiledFiles = 0;
  let startTime = null;
  const logSuccess = debounce(function () {
    if (startTime === null) {
      return;
    }

    const diff = process.hrtime(startTime);
    console.log(`Successfully compiled ${compiledFiles} ${compiledFiles !== 1 ? "files" : "file"} with Babel (${diff[0] * 1e3 + Math.round(diff[1] / 1e6)}ms).`);
    compiledFiles = 0;
    startTime = null;
  }, 100, {
    trailing: true
  });

  if (!cliOptions.skipInitialBuild) {
    if (cliOptions.deleteDirOnStart) {
      util.deleteDir(cliOptions.outDir);
    }

    fs.mkdirSync(cliOptions.outDir, {
      recursive: true
    });
    startTime = process.hrtime();

    for (const filename of cliOptions.filenames) {
      compiledFiles += await handle(filename);
    }

    if (!cliOptions.quiet) {
      logSuccess();
      logSuccess.flush();
    }
  }

  if (cliOptions.watch) {
    const chokidar = util.requireChokidar();
    filenames.forEach(function (filenameOrDir) {
      const watcher = chokidar.watch(filenameOrDir, {
        persistent: true,
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 50,
          pollInterval: 10
        }
      });
      let processing = 0;
      ["add", "change"].forEach(function (type) {
        watcher.on(type, async function (filename) {
          processing++;
          if (startTime === null) startTime = process.hrtime();

          try {
            await handleFile(filename, filename === filenameOrDir ? path.dirname(filenameOrDir) : filenameOrDir);
            compiledFiles++;
          } catch (err) {
            console.error(err);
          }

          processing--;
          if (processing === 0 && !cliOptions.quiet) logSuccess();
        });
      });
    });
  }
}