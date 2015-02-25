module.exports = function (grunt) {
    var coverageOutputPath = grunt.option('coverage-output') || 'coverage.html';

    grunt.initConfig({
        env: {
            coverage: {
                WITH_COVERAGE: true
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: ['test/**/*.js']
            },
            coverage: {
                options: {
                    reporter: 'html-cov',
                    quiet: true,
                    captureFile: coverageOutputPath
                },
                src: ['test/**/*.js']
            }
        },
        jscoverage: {
            options: {
                inputDirectory: 'lib',
                outputDirectory: 'lib-cov',
                highlight: true
            }
        },
        clean: {
            jscoverage: [
                'lib-cov'
            ]
        }
    });

    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks("grunt-jscoverage");
    grunt.loadNpmTasks("grunt-contrib-clean");

    grunt.registerTask('coverage', ['jscoverage', 'env:coverage', 'mochaTest', 'clean']);
    grunt.registerTask('test', ['mochaTest:test']);
    grunt.registerTask('default', 'test');
};
