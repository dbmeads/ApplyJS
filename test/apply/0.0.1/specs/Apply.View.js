/*global $, Apply, spyOn, it, expect */
describe('Apply.View', function() {
	'use strict';
	
	var setupAjax = function(result) {
		spyOn($, 'ajax').andCallFake(function(options) {
			if(options && options.success) {
				options.success(result);
			}
			var deferred = $.Deferred();
			deferred.resolve(result);
			return deferred.promise();
		});
	};
	
	it('should create a div element by default', function() {
		var view = new Apply.View();
		
		var result = view.render();
		
		expect(result).toBeDefined();
		expect(result.is('div')).toBe(true);
	});
	
	it('should load and render a template if one is provided', function() {
		setupAjax('<div><a href="javascript://">Link</a></div>');
		var MyView = Apply.View({resource: 'Apply.View.atl'});
		
		var result = new MyView().render();
		
		expect(result.html()).toBe('<a href="javascript://">Link</a>');
	});
	
});