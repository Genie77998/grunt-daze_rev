/*
 * grunt-dazeRev
 *
 *
 * Copyright (c) 2015 wj77998
 * Licensed under the MIT license.
 */

'use strict';
var crypto = require('crypto');
var path = require('path');
var fs = require('fs');
module.exports = function(grunt) {
    function md5(filepath, algorithm, encoding, fileEncoding) {
            var hash = crypto.createHash(algorithm);
            grunt.log.verbose.write('Hashing ' + filepath + '...');
            hash.update(grunt.file.read(filepath), fileEncoding);
            return hash.digest(encoding);
        }
        // Please see the Grunt documentation for more information regarding task
        // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('dazeRev', '文件添加MD5戳', function() {
        // Merge task-specific and/or target-specific options with these defaults.
        var options = this.options({
            encoding: 'utf8',
            algorithm: 'md5',
            length: 32
        });

        this.files.forEach(function(file) {
            var appFolders = file.src.filter(function(filepath) {
                if (/^dev\/[0-9]{8}$/.test(filepath)) {
                    return true;
                }
                return false;
            });

            var result = {};
            appFolders.forEach(function(appFolder) {
                var appId = appFolder.match(/[0-9]{8}/)[0];
                result[appId] = [];

                var appFils = file.src.filter(function(filepath) {
                    if (filepath.indexOf(appFolder) != -1 && (filepath.indexOf(".") != -1 || filepath.indexOf('package') != -1)) {
                        return true;
                    }
                    return false;
                }).forEach(function(filepath) {
                    var hash = md5(filepath, options.algorithm, 'hex', options.encoding);
                    var hashObj = {
                        "path": filepath.replace(appFolder + '/', ""),
                        "hash": hash
                    };
                    result[appId].push(hashObj);
                });

                var certFilePath = appFolder + '/CERT',
                    certFile = grunt.file.readJSON(certFilePath);
                certFile.fileVer = result[appId];
                certFile.date = grunt.template.today("yyyy-mm-dd HH:mm:ss");

                //grunt.file.write(certFilePath, JSON.stringify(certFile, null, 4));
                //暂时去掉格式化的JSON输出
                grunt.file.write(certFilePath, JSON.stringify(certFile));
                grunt.log.write(certFilePath + " update ").ok();

            });
        });
    });
};
