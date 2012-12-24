module.exports = function (grunt) {
	'use strict';

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		beautify: {
			files: ['package.json', 'grunt.js', 'src/**/*.js', 'test/**/*.js']
		},
		beautifier: {
			options: {
				indentSize: 1
			}
		},
		lint: {
			files: ['grunt.js', 'src/**/*.js', 'test/**/*.js']
		},
		concat: {
			web: {
				src: ['src/loaders/amd.js', 'src/apply.js', 'src/apply.web.js'],
				dest: 'apply.js'
			},
			node: {
				src: ['src/loaders/node.js', 'src/apply.js'],
				dest: 'dist/node/apply.node.js'
			}
		},
		copy: {
			web: {
				files: {
					'apply.min.js': 'apply.js'
				}
			}
		},
		mindirect: {
			web: ['apply.min.js']
		},
		watch: {
			files: ['<config:jasmine.specs>'],
			tasks: 'jasmine'
		},
		jasmine: {
			src: ['src/loaders/amd.js', 'lib/**/*.js', 'test/helpers/**/*.js', 'src/apply.js', 'src/apply.web.js', 'src/node/apply.mongo.js'],
			specs: ['test/**/*.js']
		},
		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: false,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				node: true,
				es5: true
			},
			globals: {
				jasmine: false,
				describe: false,
				beforeEach: false,
				expect: false,
				it: false,
				xit: false,
				spyOn: false,

				define: false,

				apply: false
			}
		}
	});

	grunt.loadNpmTasks('grunt-beautify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-mindirect');
	grunt.loadNpmTasks('grunt-jasmine-runner');

	// Default task.
	grunt.registerTask('default', 'beautify lint jasmine concat copy mindirect');

};