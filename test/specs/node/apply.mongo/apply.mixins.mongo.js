(function (root, apply) {
	'use strict';

	describe('apply.mixins.mongo', function () {

		var mongo, mongodb;

		beforeEach(function () {
			mongo = apply.mixins.mongo;
			mongodb = root.mongodb;
		});

		it('should define a crud mixin', function () {
			expect(mongo.destroy).toBeDefined();
			expect(mongo.fetch).toBeDefined();
			expect(mongo.save).toBeDefined();
		});

		it('should have server and port properties that are defaulted to "localhost" and "27017"', function () {
			expect(mongo.host).toBe('localhost');
			expect(mongo.port).toBe(27017);
		});

		it('should throw an exception if a model is instantiated without declaring db and collection options', function () {
			expect(function () {
				apply.Model(mongo).instance();
			}).toThrow('All mongoDB models must have a db and collection declared.');
		});

		describe('model', function () {

			var model;

			beforeEach(function () {
				model = apply.Model(mongo, {
					db: 'int',
					collection: 'user'
				}).instance();
			});

			describe('save', function () {
				it('should attempt to connect to mongodb when save is invoked', function () {
					spyOn(root.mongodb.MongoClient, 'connect');

					model.save();

					expect(mongodb.MongoClient.connect).toHaveBeenCalled();
				});

				it('should attempt to insert a document', function () {});
			});

			describe('fetch', function () {
				it('should attempt to connect to mongodb when save is invoked', function () {
					spyOn(mongodb.MongoClient, 'connect');

					model.fetch();

					expect(mongodb.MongoClient.connect).toHaveBeenCalled();
				});
			});

			describe('destroy', function () {
				it('should attempt to connect to mongodb when save is invoked', function () {
					spyOn(mongodb.MongoClient, 'connect');

					model.destroy();

					expect(mongodb.MongoClient.connect).toHaveBeenCalled();
				});
			});
		});
	});
})(this, this.apply);