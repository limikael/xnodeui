var qsub = require("qsub");
var async = require("async");
var fs = require("fs");
var fse = require("fs-extra");

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json')
	});

	grunt.registerTask("browserify", function() {
		var done = this.async();

		async.series([

			function(next) {
				var job = new qsub("./node_modules/.bin/browserify");
				job.arg("--debug", "-o", "test/xnodeuitest.bundle.js", "test/xnodeuitest.js");
				job.show().expect(0);

				job.run().then(next, grunt.fail.fatal);
			},

			function() {
				done();
			}
		]);
	});

	grunt.registerTask("default", function() {
		console.log("Available tasks:");
		console.log("");
		console.log("  browserify    - Compile javascript bundle for test.");
	});
};