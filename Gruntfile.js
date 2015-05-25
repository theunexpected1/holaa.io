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
					'./public/js/build/main.js': ['public/js/src/**/*.js']
				}
			},
			dist: {
				files: {
					'./public/js/build/main.js': ['public/js/src/**/*.js']
				}
			}
		},

		sass: {
			dev: {
				files: {
					'./public/css/build/main.css': ['./public/css/src/**/*.scss', './public/css/src/**/*.sass']
				}
			},
			dist: {
				files: '<%=sass.dev.files%>'
			}
		},

		watch: {
			dev: {
				files: ['./public/css/src/**/*.scss', './public/css/src/**/*.sass'],
				tasks: ['sass:dev']
			},
			dist: {
				files: '<%=watch.dev.files%>',
				tasks: ['sass:dev']
			},
		},

		concurrent: {
			dev: {
				options: {
					logConcurrentOutput: true
				},
				tasks: ['browserify:dev', 'sass:dev', 'watch:dev']
			},
			dist: {
				options: {
					logConcurrentOutput: true
				},
				tasks: ['browserify:dist', 'sass:dist']
			}
		}

	});

	grunt.loadNpmTasks('grunt-browserify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-concurrent');

	grunt.registerTask('default', ['sass:' + mode, 'browserify:' + mode]);
	grunt.registerTask('dev', ['concurrent:dev']);

	grunt.registerTask('dist', ['concurrent:dist']);
};
