/*
 * Module: apply.mongo
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
define('apply/mongo', ['apply', 'mongodb'], function (apply, mongodb) {
	'use strict';

	var url = function (model) {
		return 'mongodb://' + model.host + ':' + model.port + '/' + model.db;
	};

	var collection = function (obj, callback) {
		mongodb.MongoClient.connect(url(obj), function (err, db) {
			db.collection(obj.collection, function (err, coll) {
				callback.call(this, coll, obj);
			});
		});
	};

	var error = function (obj, err, options) {
		if (err && options.error) {
			options.error.call(err, obj);
			return true;
		}
		return false;
	};

	apply.namespace('apply.mixins.mongo', {
		init: function () {
			if (!this.db || !this.collection) {
				throw 'All mongoDB models must have a db and collection declared.';
			}
		},
		host: 'localhost',
		port: 27017,
		save: function (options) {
			collection(this, function (coll, obj) {
				coll.insert(obj.deflate(), function (err, data) {
					if (!error(obj, err, options)) {
						if (options.success) {
							options.success.call(obj, obj.inflate(data[0]));
						}
					}
				});
			});
		},
		fetch: function (options) {
			collection(this, function (coll, obj) {
				coll.find(obj.deflate()).toArray(function (err, data) {
					if (!error(obj, err, options)) {
						if (options.success) {
							options.success.call(obj, obj.inflate(data));
						}
					}
				});
			});
		},
		destroy: function (options) {
			collection(this, function (coll, obj) {
				coll.remove(obj.deflate(), function (err) {
					if (!error(obj, err, options)) {
						if (options.success) {
							options.success.call(obj, obj);
						}
					}
				});
			});
		},
		toString: function () {
			return JSON.stringify(this.deflate ? this.deflate() : this);
		}
	});

	apply.namespace('apply.mongo.Model', apply.Model(apply.mixins.mongo, {
		id: '_id'
	}));

	apply.namespace('apply.mongo.List', apply.List(apply.mixins.mongo, {
		mapping: apply.mongo.Model
	}));

	return apply;
});