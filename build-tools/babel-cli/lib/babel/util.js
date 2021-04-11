"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.chmod = chmod;
exports.readdir = readdir;
exports.readdirForCompilable = readdirForCompilable;
exports.isCompilableExtension = isCompilableExtension;
exports.addSourceMappingUrl = addSourceMappingUrl;
exports.transform = transform;
exports.compile = compile;
exports.deleteDir = deleteDir;
exports.requireChokidar = requireChokidar;
exports.withExtension = withExtension;

function babel() {
  const data = _interopRequireWildcard(require("@babel/core"));

  babel = function () {
    return data;
  };

  return data;
}

function _module() {
  const data = require("module");

  _module = function () {
    return data;
  };

  return data;
}

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const readdirRecursive = require("fs-readdir-recursive");

const path = require("path");

const fs = require("fs");

function chmod(src, dest) {
  try {
    fs.chmodSync(dest, fs.statSync(src).mode);
  } catch (err) {
    console.warn(`Cannot change permissions of ${dest}`);
  }
}

function readdir(dirname, includeDotfiles, filter) {
  return readdirRecursive(dirname, (filename, _index, currentDirectory) => {
    const stat = fs.statSync(path.join(currentDirectory, filename));
    if (stat.isDirectory()) return true;
    return (includeDotfiles || filename[0] !== ".") && (!filter || filter(filename));
  });
}

function readdirForCompilable(dirname, includeDotfiles, altExts) {
  return readdir(dirname, includeDotfiles, function (filename) {
    return isCompilableExtension(filename, altExts);
  });
}

function isCompilableExtension(filename, altExts) {
  const exts = altExts || babel().DEFAULT_EXTENSIONS;
  const ext = path.extname(filename);
  return exts.includes(ext);
}

function addSourceMappingUrl(code, loc) {
  return code + "\n//# sourceMappingURL=" + path.basename(loc);
}

const CALLER = {
  name: "@babel/cli"
};

function transform(filename, code, opts) {
  opts = Object.assign({}, opts, {
    caller: CALLER,
    filename
  });
  return new Promise((resolve, reject) => {
    babel().transform(code, opts, (err, result) => {
      if (err) reject(err);else resolve(result);
    });
  });
}

function compile(filename, opts) {
  opts = Object.assign({}, opts, {
    caller: CALLER
  });
  return new Promise((resolve, reject) => {
    babel().transformFile(filename, opts, (err, result) => {
      if (err) reject(err);else resolve(result);
    });
  });
}

function deleteDir(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      const curPath = path + "/" + file;

      if (fs.lstatSync(curPath).isDirectory()) {
        deleteDir(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

process.on("uncaughtException", function (err) {
  console.error(err);
  process.exitCode = 1;
});

function requireChokidar() {
  try {
    return parseInt(process.versions.node) >= 8 ? require("chokidar") : require("@nicolo-ribaudo/chokidar-2");
  } catch (err) {
    console.error("The optional dependency chokidar failed to install and is required for " + "--watch. Chokidar is likely not supported on your platform.");
    throw err;
  }
}

function withExtension(filename, ext = ".js") {
  const newBasename = path.basename(filename, path.extname(filename)) + ext;
  return path.join(path.dirname(filename), newBasename);
}