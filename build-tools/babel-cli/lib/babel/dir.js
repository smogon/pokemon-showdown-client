"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _defaults() {
  const data = _interopRequireDefault(require("lodash/defaults"));

  _defaults = function () {
    return data;
  };

  return data;
}

function _outputFileSync() {
  const data = _interopRequireDefault(require("output-file-sync"));

  _outputFileSync = function () {
    return data;
  };

  return data;
}

function _mkdirp() {
  const data = require("mkdirp");

  _mkdirp = function () {
    return data;
  };

  return data;
}

function _slash() {
  const data = _interopRequireDefault(require("slash"));

  _slash = function () {
    return data;
  };

  return data;
}

function _path() {
  const data = _interopRequireDefault(require("path"));

  _path = function () {
    return data;
  };

  return data;
}

function _fs() {
  const data = _interopRequireDefault(require("fs"));

  _fs = function () {
    return data;
  };

  return data;
}

var util = _interopRequireWildcard(require("./util"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const NOT_COMPILABLE = null;

async function _default({
  cliOptions,
  babelOptions
}) {
  const filenames = cliOptions.filenames;

  async function write(src, base) {
    let relative = _path().default.relative(base, src);

    if (!util.isCompilableExtension(relative, cliOptions.extensions)) {
      return NOT_COMPILABLE;
    }

    relative = util.adjustRelative(relative, cliOptions.keepFileExtension);
    const dest = getDest(relative, base);

    if (cliOptions.incremental) {
      try {
        const srcStat = _fs().default.statSync(src);

        const destStat = _fs().default.statSync(dest);

        if (srcStat.ctimeMs < destStat.ctimeMs) return false;
      } catch (e) {}
    }

    try {
      const res = await util.compile(src, (0, _defaults().default)({
        sourceFileName: (0, _slash().default)(_path().default.relative(dest + "/..", src))
      }, babelOptions));
      if (!res) return NOT_COMPILABLE;

      if (res.map && babelOptions.sourceMaps && babelOptions.sourceMaps !== "inline") {
        const mapLoc = dest + ".map";
        res.code = util.addSourceMappingUrl(res.code, mapLoc);
        res.map.file = _path().default.basename(relative);
        (0, _outputFileSync().default)(mapLoc, JSON.stringify(res.map));
      }

      (0, _outputFileSync().default)(dest, res.code);
      util.chmod(src, dest);

      if (cliOptions.verbose) {
        console.log(src + " -> " + dest);
      }

      return true;
    } catch (err) {
      if (cliOptions.watch) {
        console.error(err);
        return false;
      }

      throw err;
    }
  }

  function getDest(filename, base) {
    if (cliOptions.relative) {
      return _path().default.join(base, cliOptions.outDir, filename);
    }

    return _path().default.join(cliOptions.outDir, filename);
  }

  async function handleFile(src, base) {
    const written = await write(src, base);

    if (written === NOT_COMPILABLE) {
      if (!cliOptions.copyFiles) return false;

      const filename = _path().default.relative(base, src);

      const dest = getDest(filename, base);

      if (cliOptions.incremental) {
        try {
          const srcStat = _fs().default.statSync(src);

          const destStat = _fs().default.statSync(dest);

          if (srcStat.ctimeMs < destStat.ctimeMs) return false;
        } catch (e) {}
      }

      (0, _outputFileSync().default)(dest, _fs().default.readFileSync(src));
      util.chmod(src, dest);
      return false;
    }

    return written;
  }

  async function handle(filenameOrDir) {
    if (!_fs().default.existsSync(filenameOrDir)) return 0;

    const stat = _fs().default.statSync(filenameOrDir);

    if (stat.isDirectory()) {
      const dirname = filenameOrDir;
      let count = 0;
      const files = util.readdir(dirname, cliOptions.includeDotfiles);

      for (const filename of files) {
        const src = _path().default.join(dirname, filename);

        const written = await handleFile(src, dirname);
        if (written) count += 1;
      }

      return count;
    } else {
      const filename = filenameOrDir;
      const written = await handleFile(filename, _path().default.dirname(filename));
      return written ? 1 : 0;
    }
  }

  if (!cliOptions.skipInitialBuild) {
    if (cliOptions.deleteDirOnStart) {
      util.deleteDir(cliOptions.outDir);
    }

    (0, _mkdirp().sync)(cliOptions.outDir);
    let compiledFiles = 0;

    for (const filename of cliOptions.filenames) {
      compiledFiles += await handle(filename);
    }

    console.log(`Successfully compiled ${compiledFiles} ${compiledFiles !== 1 ? "files" : "file"} with Babel.`);
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
      ["add", "change"].forEach(function (type) {
        watcher.on(type, function (filename) {
          handleFile(filename, filename === filenameOrDir ? _path().default.dirname(filenameOrDir) : filenameOrDir).catch(err => {
            console.error(err);
          });
        });
      });
    });
  }
}