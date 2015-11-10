/*
 * grunt-language-fallback
 * https://github.com/johnbenz13/grunt-language-fallback
 *
 * Copyright (c) 2015 Jonathan Bensaid
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  /**
   * Parse the language file and extract the translations as an object
   * @param source
   * @returns {{}}
   */
  function getLanguageObject(source) {
    var languages = {},
      regex = /gettextCatalog.setStrings\((.*)\)\;/g,
      match = regex.exec(source),
      language;


    while (match != null) {
      language = match[1].split(/,(.+)?/);
      languages[language[0].slice(1, - 1)] = JSON.parse(language[1]);

      match = regex.exec(source);
    }

    return languages;
  }

  /**
   * Loop over the baseLanguage and update the other language with it when a string is missing
   * @param languages
   * @param baseLanguageKey
   * @returns {{}}
   */
  function updateLanguages(languages, baseLanguageKey) {
    var baseLanguage = languages[baseLanguageKey],
      updatedLanguages = {};

    for (var locale in languages) {
      if (locale === baseLanguageKey) {
        updatedLanguages[baseLanguageKey] = baseLanguage;
      } else {
        updatedLanguages[locale] = {};
        for (var key in baseLanguage) {
          //console.log('working on the key', key);
          if (languages[locale][key]) {
            updatedLanguages[locale][key] = languages[locale][key];
          } else {
            updatedLanguages[locale][key] = baseLanguage[key];
          }
        }
      }
    }

    return updatedLanguages;
  }

  function getUpdatedFile(updatedLanguages) {
    var updatedFile = 'angular.module(\'gettext\').run([\'gettextCatalog\', function (gettextCatalog) {\n';
    updatedFile += '/* jshint -W100 */\n';

    for (var locale in updatedLanguages) {
      updatedFile += 'gettextCatalog.setStrings(' + JSON.stringify(updatedLanguages[locale]) + ');\n';
    }

    updatedFile += '/* jshint +W100 */\n';
    updatedFile += '}]);\n';

    return updatedFile;
  }

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('language_fallback', 'Fallback to english (or any choosen language) the translations that don\'t have values', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      punctuation: '.',
      separator: ', ',
      language: 'en'
    });

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        return grunt.file.read(filepath);
      }).join(grunt.util.normalizelf(options.separator));

      // Handle options.
      src += options.punctuation;

      var languages = getLanguageObject(src);

      var updatedLanguages = updateLanguages(languages, options.language);
      var updatedFile = getUpdatedFile(updatedLanguages);


      // Write the destination file.
      grunt.file.write(f.dest, updatedFile);

      // Print a success message.
      grunt.log.writeln('File "' + f.dest + '" created.');
    });
  });

};
