/*
 * grunt-language-fallback
 * https://github.com/johnbenz13/grunt-language-fallback
 *
 * Copyright (c) 2015 Ben Bakhar
 * Licensed under the MIT license.
 */

'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function (grunt) {

  const readDir = (srcDir) => {
    return new Promise((resolve, reject) => {
      fs.readdir(srcDir, (err, res) => {

        if (err) {
          return reject(err);
        }
        resolve(res)
      });
    });
  };

  const readFile = (srcDir, p) => {
    console.log(srcDir, p, path.resolve(`${srcDir}/${p}`))
    return new Promise((resolve, reject) => {
      fs.readFile(path.resolve(`${srcDir}/${p}`), 'utf8', (err, res) => {

        if (err) {
          return reject(err);
        }
        resolve({path: p, data: JSON.parse(res)})
      });
    });
  };

  const readFiles = (srcDir) => {
    return (paths) => {
      return Promise.all(paths.map(p => readFile(srcDir, p)))
    }
  };

  const filterFiles = (files) => {
    return files.filter(f => /.json$/.test(f));
  };

  const writeFiles = (destDir) => {
    return (files) => {
      return Promise.all(files.map(f => {
        return new Promise((resolve, reject) => {
          fs.writeFile(path.resolve(`${destDir}/${f.path}`), JSON.stringify(f.data), 'utf8', (err, res) => {
            if (err) {
              return reject(err);
            }
            return resolve(res)
          })
        })
      }))
    }
  };

  const extendFilesWithFallback = (fallbackLang) => {
    return (files) => {
      return files.map((f, i) => {

        // copy object
        let extended = JSON.parse(JSON.stringify(fallbackLang));

        Object.assign(extended.en, f.data[Object.keys(f.data)[0]]);
        f.data[Object.keys(f.data)[0]] = extended.en;

        return f;
      });
    }
  };

  grunt.registerMultiTask('language_fallback', 'Extend translations with fallback language', function () {

    // set task as async
    var done = this.async();
    var srcDir = path.resolve(this.data.src);
    var destDir = path.resolve(this.data.dest);
    var fallbackLang = require(`${path.resolve(srcDir, this.data.language)}.json`);

    const onSuccess = () => {
      grunt.log.writeln('languages updated');
      done();
    };

    const onError = (err) => {
      grunt.log.error(err);
      done(false);
    };

    readDir(srcDir)
      .then(filterFiles)
      .then(readFiles(srcDir))
      .then(extendFilesWithFallback(fallbackLang))
      .then(writeFiles(destDir))
      .then(onSuccess)
      .catch(onError);
  });

};
