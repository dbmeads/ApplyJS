/*
 * Module: apply.mongo
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	function module(apply, mongodb) {

		var url = function (model) {
			return 'mongodb://' + model.host + ':' + model.port + '/' + model.db;
		};

		var collection = function (model, callback) {
			mongodb.MongoClient.connect(url(model), function (err, db) {
				db.collection(model.collection, function (err, coll) {
					callback.call(this, coll, model);
				});
			});
		};

		var error = function (model, err, options) {
			if (err && options.error) {
				options.error.call(err, model);
				return true;
			}
			return false;
		};

		apply.namespace('apply.mongo.crud', {
			init: function () {
				if (!this.db || !this.collection) {
					throw 'All mongoDB models must have a db and collection declared.';
				}
			},
			host: 'localhost',
			port: 27017,
			save: function (options) {
				collection(this, function (coll, model) {
					coll.insert(model.deflate(), function (err, data) {
						if (!error(this, err, options)) {
							if (options.success) {
								options.success.call(this, model.set(data[0]));
							}
						}
					});
				});
			},
			fetch: function (options) {
				collection(this, function (coll, model) {
					coll.findOne(model.deflate(), function (err, data) {
						if (!error(this, err, options)) {
							if (options.success) {
								options.success.call(this, model.inflate(data));
							}
						}
					});
				});
			},
			destroy: function (options) {
				collection(this, function (coll, model) {
					coll.remove(this.deflate(), function (err) {
						if (!error(this, err, options)) {
							if (options.success) {
								options.success.call(this, model);
							}
						}
					});
				});
			},
			toString: function () {
				return JSON.stringify(this.deflate ? this.deflate() : this);
			}
		});

		apply.namespace('apply.mongo.Model', apply.Model(apply.mongo.crud));
	}

	define('apply/mongo', ['apply', 'mongodb'], function (apply, mongodb) {
		return apply.module(module, mongodb);
	});
})(this);