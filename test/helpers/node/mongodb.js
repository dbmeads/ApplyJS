(function (root) {
	'use strict';

	root.mongodb = {
		MongoClient: {
			connect: function () {

			}
		}
	};

	define('mongodb', function () {
		return root.mongodb;
	});

})(this);