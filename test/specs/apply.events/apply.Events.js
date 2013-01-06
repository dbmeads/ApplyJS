(function (root, apply) {
	'use strict';

	describe('apply.Events', function () {

		var callback, events;

		beforeEach(function () {
			callback = jasmine.createSpy();
			events = new apply.Events();

		});

		it('should support an \'on\' method that allows callbacks to be registered', function () {
			events.on('test', callback);

			expect(events.events['test']).toEqual([callback]);
		});

		it('should support the triggering of events / callbacks that were previously registered', function () {
			var events = new apply.Events();
			var callbacks = [jasmine.createSpy(), jasmine.createSpy()];

			events.on('test', callbacks[0]);
			events.on('test', callbacks[1]);

			events.trigger('test');

			expect(callbacks[0]).toHaveBeenCalled();
			expect(callbacks[1]).toHaveBeenCalled();
		});

		it('should support a third parameter that takes the context to apply the callback to', function () {
			var obj = {};

			events.on('test', callback, obj);
			events.trigger('test');

			expect(callback.mostRecentCall.object).toBe(obj);
		});

		describe('trigger', function () {
			it('should support arguments that will be passed on to callbacks', function () {
				events.on('test', callback);
				events.trigger('test', 'an argument');

				expect(callback).toHaveBeenCalledWith('an argument');
			});
		});

	});
})(this, this.apply);