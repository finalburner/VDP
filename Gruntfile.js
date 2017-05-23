module.exports = function(grunt) {
var jsfolder = "/App/www/js/"

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    // Task configuration.
    ngAnnotate: {
        options: {
            singleQuotes: true,
        },
        demo: {
            files:  [{
                expand: true,
                src: ['App/www/js/grunt/*.js', 'client/grunt/*.js'],
                dest: '.'

            }],
        }
    },
    uglify: {
        demo: {
            files:  [{
                expand: true,
                src: ['App/www/js/grunt/*.js', 'client/grunt/*.js'],
                dest: '.'
            }],
        }
    }
  });

  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task.
  grunt.registerTask('default', ['ngAnnotate', 'uglify']);

};
