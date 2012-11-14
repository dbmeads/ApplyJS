/*global $, Apply, window, spyOn, it, expect, jasmine, ajax */
describe('Apply.Model', function() {
	'use strict';
	
	it('should be able to construct a model that has attributes set on it', function() {
		var model = new Apply.Model({name: 'Dave'});
		
		expect(model.attributes.name).toBe('Dave');
	});
	
	it('should be able to create a 2nd mixed in constructor from Apply.Model by calling Apply.Model.mixin()', function() {
		var NewModel = Apply.Model.mixin({prop1: 'Model'});
		
		expect(NewModel.prototype.prop1).toBe('Model');
	});
	
	it('should support setting of attributes after a model is created without touching other attributes', function() {
		var model = new Apply.Model({firstname: 'Dave'});
		
		model.set({lastname: 'Meads'});
		
		expect(model.attributes.firstname).toBe('Dave');
		expect(model.attributes.lastname).toBe('Meads');
	});
	
	it('should support the return of attributes via a get method', function() {
		var model = new Apply.Model({firstname: 'Dave'});
		
		expect(model.get('firstname')).toBe('Dave');
	});
	
	it('should support a save method that will POST to a urlRoot if id is not defined', function() {
		ajax();
		var model = new (Apply.Model.mixin({urlRoot: '/users'}))({firstname: 'Dave'});
		
		model.save();
		
		expect($.ajax).toHaveBeenCalledWith({url: '/users', type: 'POST', data: '{"firstname":"Dave"}', contentType: 'application/json'});
	});

	it('should support a save method that will PUT to urlRoot/{id} if id is defined', function() {
		ajax();
		var model = new (Apply.Model.mixin({urlRoot: '/users'}))({id: 1, firstname: 'Dave'});
		
		model.save();
		
		expect($.ajax).toHaveBeenCalledWith({url: '/users/1', type: 'PUT', data: '{"id":1,"firstname":"Dave"}', contentType: 'application/json'});
	});

	it('should support a destroy method that will DELETE a urlRoot/{id}', function() {
		ajax();
		var model = new (Apply.Model.mixin({urlRoot: '/users'}))({id: 1});
		
		model.destroy();
		
		expect($.ajax).toHaveBeenCalledWith({url: '/users/1', type: 'DELETE'});
	});
	
	it('should support a fetch method that will GET a urlRoot/{id}', function() {
		ajax();
		var model = new (Apply.Model.mixin({urlRoot: '/users'}))({id: 1});
		
		model.fetch();
		
		expect($.ajax).toHaveBeenCalledWith({url: '/users/1', type: 'GET'});
	});
	
	it('should apply any fetched attributes to the model', function() {
		ajax({id: 1, firstname: 'Dave'});
		var model = new (Apply.Model.mixin({urlRoot: '/users'}))({id: 1});
		
		model.fetch();

		expect(model.get('id')).toBe(1);
		expect(model.get('firstname')).toBe('Dave');
	});
	
	it('should be able to handle nested models via mappings', function() {
		var Student = Apply.Model({mappings: {'school': Apply.Model}});
		
		var result = new Student({name: 'Sam', school: {name: 'Prime Elementary'}});
		
		expect(result.get('name')).toBe('Sam');
		expect(result.get('school').constructor).toBe(Apply.Model);
		expect(result.get('school').get('name')).toBe('Prime Elementary');
	});
	
	it('should support a toJson function that stringifies an object', function() {
		var Student = Apply.Model({mappings: {'school': Apply.Model}});
		
		var result = new Student({name: 'Sam', school: {name: 'Prime Elementary'}});
		
		expect(result.toJson()).toBe('{"name":"Sam","school":{"name":"Prime Elementary"}}');
	});
	
	it('should save models with the appropriate json', function() {
		ajax();
		var Student = Apply.Model({urlRoot: '/students', mappings: {'school': Apply.Model}});
		
		new Student({name: 'Sam', school: {name: 'Prime Elementary'}}).save();
				
		expect($.ajax).toHaveBeenCalledWith({url: jasmine.any(String), type: jasmine.any(String), contentType: jasmine.any(String), data: '{"name":"Sam","school":{"name":"Prime Elementary"}}'});
	});
	
	it('should delegate "save" calls to the top level parent by default', function() {
		ajax();
		var Student = Apply.Model({urlRoot: '/students', mappings: {'school': Apply.Model}});
		
		new Student({name: 'Sam', school: {name: 'Prime Elementary'}}).get('school').save();
				
		expect($.ajax).toHaveBeenCalledWith({url: jasmine.any(String), type: jasmine.any(String), contentType: jasmine.any(String), data: '{"name":"Sam","school":{"name":"Prime Elementary"}}'});
	});
	
	it('should delegate "fetch" calls to the top level parent by default', function() {
		ajax();
		var Student = Apply.Model({urlRoot: '/students', mappings: {'school': Apply.Model}});
		
		new Student({id: 1, name: 'Sam', school: {name: 'Prime Elementary'}}).get('school').fetch();
				
		expect($.ajax).toHaveBeenCalledWith({url: '/students/1', type: 'GET'});
	});
	
	it('should delegate "destroy" calls to the top level parent by default', function() {
		ajax();
		var Student = Apply.Model({urlRoot: '/students', mappings: {'school': Apply.Model}});
		
		new Student({id: 1, name: 'Sam', school: {name: 'Prime Elementary'}}).get('school').destroy();
				
		expect($.ajax).toHaveBeenCalledWith({url: '/students/1', type: 'DELETE'});
	});
	
});