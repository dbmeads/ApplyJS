module.exports = function(grunt) {
	'use strict';

	// Project configuration.
	grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
		lint : {
			files : ['grunt.js', 'src/**/*.js', 'test/**/*.js']
		},
        concat: {
            dist: {
                src: ['src/apply.js', 'src/apply.web.js'],
                dest: 'apply.js'
            }
        },
        copy: {
            dist: {
                files: {
                    'apply.min.js':'apply.js'
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
			src : ['src/apply.amd.js', 'lib/**/*.js', 'test/helpers/**/*.js', 'src/apply.js', 'src/apply.web.js'],
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
				spyOn : false,

                // amd
                define: false,
                require: false,


                // apply.js
                apply : false
			}
		}
	});

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-mindirect');
	grunt.loadNpmTasks('grunt-jasmine-runner');

	// Default task.
	grunt.registerTask('default', 'lint jasmine concat copy mindirect');

};