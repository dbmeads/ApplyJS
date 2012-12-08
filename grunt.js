module.exports = function(grunt) {
	'use strict';

	// Project configuration.
	grunt.initConfig({
		lint : {
			files : ['grunt.js', 'src/**/*.js', 'test/**/*.js']
		},
        copy: {
            dist: {
                files: {
                    'apply.min.js':'src/apply/apply.js'
                }
            }
        },
        mindirect: {
            dist: ['apply.min.js']
        },
		watch : {
			files : [ '<config:jasmine.specs>'],
			tasks : 'jasmine'
		},
		jasmine : {
			src : ['lib/jquery/**/*.js', 'test/helpers/**/*.js', 'src/**/*.js'],
			specs : ['test/**/*.js']
		},
		jshint : {
			options : {
				curly : true,
				eqeqeq : true,
				immed : true,
				latedef : true,
				newcap : false,
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
                xit : false,
				spyOn : false
			}
		}
	});

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mindirect');
	grunt.loadNpmTasks('grunt-jasmine-runner');

	// Default task.
	grunt.registerTask('default', 'lint jasmine copy mindirect');

};