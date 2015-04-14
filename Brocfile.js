/* global module, require */
var babelTranspiler = require('broccoli-babel-transpiler');
var mergeTrees = require('broccoli-merge-trees');
var pickFiles = require('broccoli-static-compiler');
var path = require('path');
var ES6Modules = require('broccoli-es6modules');

var dist = './dist';

var statics = function (sourceDir, files, outputPath) {
    files = Array.isArray(files) ? files : [files];
    outputPath = outputPath || dist;
    var inputPath = path.resolve(sourceDir);

    return pickFiles(inputPath, {
        overwrite: false,
        srcDir: './',
        files: files,
        destDir: outputPath
    });
};

var bundler = function (sourceDir, app, options) {
    options = options || {};
    options.entry = options.entry || 'index.js';
    options.dist = options.dist || dist;

    var babelized = babelTranspiler(sourceDir, {
        comments: false,
        blacklist: options.blacklist || ['es6.modules']
    });

    var modularized = new ES6Modules(babelized, {
        esperantoOptions: {
            name: app,
            amdName: app
        },
        bundleOptions: {
            entry: options.entry,
            name: app
        },
        format: 'umd'
    });

    var inDist = pickFiles(modularized, {
        srcDir: './',
        destDir: options.dist
    });

    return inDist;
};


var trees = mergeTrees([

    bundler('./src/workerio', 'workerio', {dist: '.'}),
    bundler('./src/workerio', 'workerio', {dist: 'tests', entry: 'test/index.js'}),

    statics('./node_modules/qunitjs/qunit', '*.*', './vendors'),
    statics('./src/workerio/test/statics', '*.*', './tests')

]);

module.exports = trees;

