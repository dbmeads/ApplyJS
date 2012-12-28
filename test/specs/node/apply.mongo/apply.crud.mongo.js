(function (root, apply) {
	'use strict';

	describe('apply.crud.mongo', function () {

		var mongo;

		beforeEach(function () {
			mongo = apply.crud.mongo;
		});

		it('should define a crud mixin', function () {
			expect(mongo.destroy).toBeDefined();
			expect(mongo.fetch).toBeDefined();
			expect(mongo.save).toBeDefined();
		});

		it('should have server and port properties that are defaulted to "localhost" and "27017"', function () {
			expect(mongo.options.host).toBe('localhost');
			expect(mongo.options.port).toBe(27017);
		});

		it('should throw an exception if a model is instantiated without declaring db and collection options', function () {
			expect(function () {
				apply.Model(mongo).singleton();
			}).toThrow('All mongoDB models must have a db and collection declared.');
		});

		describe('model', function () {

			var model;

			beforeEach(function () {
				model = apply.Model(mongo, {
					options: {
						db: 'int',
						collection: 'user'
					}
				}).singleton();
			});

			describe('save', function () {
				it('should attempt to connect to mongodb when save is invoked', function () {
					spyOn(model.client, 'connect');

					model.save();

					expect(model.client.connect).toHaveBeenCalled();
				});

				it('should attempt to insert a document', function () {});
			});

			describe('fetch', function () {
				it('should attempt to connect to mongodb when save is invoked', function () {
					spyOn(model.client, 'connect');

					model.fetch();

					expect(model.client.connect).toHaveBeenCalled();
				});
			});

			describe('destroy', function () {
				it('should attempt to connect to mongodb when save is invoked', function () {
					spyOn(model.client, 'connect');

					model.destroy();

					expect(model.client.connect).toHaveBeenCalled();
				});
			});
		});
	});
})(this, this.apply);