'use strict';

module.exports = function(grunt){
	var mode = grunt.option('dist') ? 'dist' : 'dev';

	grunt.initConfig({
		browserify: {
			dev: {
				options: {
					keepAlive: true,
					watch: true
				},
				files: {
					'./public/js/build/bundle.js': ['public/jssrc/**/*.js']
				}
			},
			dist: {
				files: {
					'./public/js/build/bundle.js': ['public/jssrc/**/*.js']
				}
			}
		}
	});

	grunt.loadNpmTasks('grunt-browserify');
	grunt.registerTask('default', ['browserify:' + mode]);
};