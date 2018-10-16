#!/usr/bin/env node
"use strict";

var _options = _interopRequireDefault(require("./options"));

var _dir = _interopRequireDefault(require("./dir"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const opts = (0, _options.default)(process.argv);

if (!opts.cliOptions.outDir) throw new Error("This fork of babel-cli is cut down to only what Pokemon-Showdown-Client uses, and only supports `--out-dir` mode");

const fn = _dir.default;
fn(opts).catch(err => {
  console.error(err);
  process.exit(1);
});