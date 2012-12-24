/*
 * Module: apply.mongo
 * Copyright 2012 David Meads
 * Released under the MIT license
 */
(function (root) {
	'use strict';

	var defined;

	function module(apply, mongodb) {

		if (!defined) {
			defined = true;

			var url = function (model) {
				return 'mongodb://' + model.options.host + ':' + model.options.port + '/' + model.options.db;
			};

			var collection = function (model, callback) {
				mongodb.MongoClient.connect(url(model), function (err, db) {
					db.collection(model.options.collection, function (err, coll) {
						callback.call(model, coll);
					});
				});
			};

			apply.namespace('apply.crud.mongo', {
				init: function () {
					if (!this.options.db || !this.options.collection) {
						throw 'All mongoDB models must have a db and collection declared.';
					}
				},
				client: mongodb.MongoClient,
				options: {
					host: 'localhost',
					port: 27017
				},
				save: function () {
					collection(this, function (model, coll) {

					});
				},
				fetch: function () {
					collection(this, function (model, coll) {

					});
				},
				destroy: function () {
					collection(this, function (model, coll) {

					});
				}
			});

			apply.namespace('apply.model.Mongo', apply.Model(apply.crud.mongo));
		}

		return apply;
	}

	define('apply/mongo', ['apply', 'mongodb'], module);
})(this);