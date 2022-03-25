/// <reference types="webpack" />
const { writeFileSync } = require('fs');
const { sync: rimraf } = require('rimraf');
const { resolve } = require('path');
const _ = require('lodash');

class BlockframesNxPlugin {
  constructor(config, context) {
    this.config = config;
    this.context = context;
    this.clearDirExceptPackageJson(); // ? This hack prevents a crash
  }

  apply(compiler) {
    compiler.hooks.afterEmit.tap('BlockframesPlugin', this.processPackageJson.bind(this));
  }

  processPackageJson() {
    const packageJsonPath = resolve(this.context.options.outputPath, 'package.json');
    const packageJson = require(packageJsonPath);
    _.set(packageJson, 'engines.node', this.context.options.nodeVersion);
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, undefined, 4));
  }

  clearDirExceptPackageJson() {
    const packageJsonPath = resolve(this.context.options.outputPath, 'package.json');
    require(packageJsonPath);
    rimraf(this.context.options.outputPath);
  }

}

module.exports = (config, context) => _.merge(config, { plugins: [new BlockframesNxPlugin(config, context)] });
