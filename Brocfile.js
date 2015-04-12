/* global module, require */
var esTranspiler = require('broccoli-babel-transpiler');
var mergeTrees = require('broccoli-merge-trees');
var pickFiles = require('broccoli-static-compiler');
var concatenate = require('broccoli-concat');
var uglifyJs = require('broccoli-uglify-js');
var path = require('path');

var dist = '/dist';

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
    var inputPath = path.resolve(sourceDir);
    var outputPath = path.join(dist, app+'.js');
    options = options || {}
    options.moduleIds = true;
    options.filterExtensions = ['js'];
    options.modules = options.modules || 'umd';
    options.moduleRoot = app;
    var transpiled = esTranspiler(inputPath, options);

    var concatenated = concatenate(transpiled, {
        srcDir: './',
        inputFiles : ['**/*.js'],
        outputFile : outputPath
    });

    var uglified = uglifyJs(concatenated, {
        compress: true
    });

    return uglified;
};


var trees = mergeTrees([

    bundler('src/workerio', 'workerio'),

    statics('node_modules/requirejs', 'require.js', './vendors'),
    statics('bower_components/qunit/qunit', '*.*', './vendors'),
    statics('tests', '*.*', './tests'),

]);

module.exports = trees;