/*
 * Module: apply.mongo
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
define('apply/mongo', ['apply', 'mongodb', 'bson'], function (apply, mongodb, bson) {
	'use strict';

	function url(model) {
		return 'mongodb://' + model.host + ':' + model.port + '/' + model.db;
	}

	function collection(obj, callback) {
		mongodb.MongoClient.connect(url(obj), function (err, db) {
			if (db === null) {
				throw 'The \"' + obj.db + '\" database was not found.';
			}
			db.collection(obj.collection, function (err, coll) {
				callback.call(this, db, coll, obj);
			});
		});
	}

	function error(obj, err, options) {
		if (err && options.error) {
			options.error.call(err, obj);
			return true;
		}
		return false;
	}

	function normalize(obj) {
		if (typeof obj._id === 'string') {
			obj._id = bson.ObjectID(obj._id);
		}
		return obj;
	}

	apply.namespace('apply.mixins.mongo', {
		init: function () {
			if (!this.db || !this.collection) {
				throw 'All mongoDB models must have a db and collection declared.';
			}
		},
		host: 'localhost',
		port: 27017,
		save: function (options) {
			collection(this, function (db, coll, obj) {
				coll.insert(normalize(options.data || obj.deflate()), function (err, data) {
					if (!error(obj, err, options)) {
						obj.inflate(obj.add ? data : data[0]);
						if (options.success) {
							options.success.call(obj, obj);
						}
					}
					db.close();
				});
			});
		},
		fetch: function (options) {
			collection(this, function (db, coll, obj) {
				coll.find(normalize(options.data || obj.deflate())).toArray(function (err, data) {
					if (!error(obj, err, options)) {
						obj.inflate(obj.add ? data : data[0]);
						if (options.success) {
							options.success.call(obj, obj);
						}
					}
					db.close();
				});
			});
		},
		destroy: function (options) {
			collection(this, function (db, coll, obj) {
				coll.remove(normalize(options.data || obj.deflate()), function (err) {
					if (!error(obj, err, options)) {
						if (options.success) {
							options.success.call(obj, obj);
						}
					}
					db.close();
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
	}).composer(function () {
		apply.propogate(this.prototype, this.prototype.mapping.prototype, 'db');
		apply.propogate(this.prototype, this.prototype.mapping.prototype, 'collection');
	}));

	return apply;
});