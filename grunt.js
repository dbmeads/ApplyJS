module.exports = function(grunt) {
	'use strict';

	// Project configuration.
	grunt.initConfig({
		lint : {
			files : ['grunt.js', 'src/**/*.js', 'test/**/*.js']
		},
		watch : {
			files : [ '<config:jasmine.specs>'],
			tasks : 'jasmine'
		},
		jasmine : {
			src : ['lib/jquery/**/*.js', 'src/**/*.js'],
			specs : ['test/**/*.js']
		},
		jshint : {
			options : {
				curly : true,
				eqeqeq : true,
				immed : true,
				latedef : true,
				newcap : true,
				noarg : true,
				sub : true,
				undef : true,
				boss : true,
				eqnull : true,
				node : true,
				es5 : true
			},
			globals : {
				jasmine : false,
				describe : false,
				beforeEach : false,
				expect : false,
				it : false,
				spyOn : false
			}
		}
	});

	grunt.loadNpmTasks('grunt-jasmine-runner');

	// Default task.
	grunt.registerTask('default', 'lint jasmine');

};