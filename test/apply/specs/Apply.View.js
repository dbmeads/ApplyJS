/*global $, Apply, spyOn, it, expect, ajax */
describe('Apply.View', function() {
	'use strict';
	
	it('should create a div element by default', function() {
		var view = new Apply.View();
		
		var result = view.render();
		
		expect(result).toBeDefined();
		expect(result.is('div')).toBe(true);
	});
	
	it('should load and render a template if one is provided', function() {
		ajax('<div><a href="javascript://">Link</a></div>');
		var MyView = Apply.View({resource: 'Apply.View.atl'});
		
		var result = new MyView().render();
		
		expect(result.html()).toBe('<a href="javascript://">Link</a>');
	});
	
});