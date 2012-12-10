/*global $, apply, window, spyOn, it, expect, jasmine, ajaxSpy */
describe('apply.Model', function () {
    'use strict';

    it('should be able to construct a model that has attributes set on it', function () {
        var model = new apply.Model({name:'Dave'});

        expect(model.attributes.name).toBe('Dave');
    });

    it('should be able to create a 2nd mixed in constructor from apply.Model by calling apply.Model.mixin()', function () {
        var NewModel = apply.Model.mixin({prop1:'Model'});

        expect(NewModel.prototype.prop1).toBe('Model');
    });

    it('should support setting of attributes after a model is created without touching other attributes', function () {
        var model = new apply.Model({firstname:'Dave'});

        model.set({lastname:'Meads'});

        expect(model.attributes.firstname).toBe('Dave');
        expect(model.attributes.lastname).toBe('Meads');
    });

    it('should support the return of attributes via a get method', function () {
        var model = new apply.Model({firstname:'Dave'});

        expect(model.get('firstname')).toBe('Dave');
    });

    it('should be able to handle nested models via mappings', function () {
        var Student = apply.Model({mappings:{'school':apply.Model}});

        var result = new Student({name:'Sam', school:{name:'Prime Elementary'}});

        expect(result.get('name')).toBe('Sam');
        expect(result.get('school').constructor).toBe(apply.Model);
        expect(result.get('school').get('name')).toBe('Prime Elementary');
    });

    it('should support model copying via the set method', function() {
        var model1 = new apply.Model({firstname: 'Patrick'});
        var model2 = new apply.Model().set(model1);

        expect(model2.attributes).toEqual(model1.attributes);
    });

    it('should support a getId method that will return whatever the id that the id property is mapped to', function () {
        expect(new (apply.Model({id:'uid'}))({uid:2}).getId()).toBe(2);
    });

    describe('events', function () {
        it('should support a change event that fires when any attribute changes', function () {
            var model = new apply.Model();
            var check = jasmine.createSpy();

            model.on('change', function(name, key) {
                expect(name).toBe('Dave');
                expect(key).toBe('name');
                check();
            });

            model.set({name: 'Dave'}, false);

            expect(check).toHaveBeenCalled();
        });

        it('should support a change event that fires when any attribute changes', function () {
            var model = new apply.Model();
            var check = jasmine.createSpy();

            model.on('change:name', function(name) {
                expect(name).toBe('Dave');
                check();
            });

            model.set({name: 'Dave'}, false);

            expect(check).toHaveBeenCalled();
        });
    });

    describe('crud', function () {
        it('should support a save method that will POST to a urlRoot if id is not defined', function () {
            ajaxSpy.setResult();
            var model = new (apply.Model.mixin({urlRoot:'/users'}))({firstname:'Dave'});

            model.save();

            expect($.ajax).toHaveBeenCalledWith({url:'/users', type:'POST', data:'{"firstname":"Dave"}', contentType:'application/json'});
        });

        it('should support a save method that will PUT to urlRoot/{id} if id is defined', function () {
            ajaxSpy.setResult();
            var model = new (apply.Model.mixin({urlRoot:'/users'}))({id:1, firstname:'Dave'});

            model.save();

            expect($.ajax).toHaveBeenCalledWith({url:'/users/1', type:'PUT', data:'{"id":1,"firstname":"Dave"}', contentType:'application/json'});
        });

        it('should support a destroy method that will DELETE a urlRoot/{id}', function () {
            ajaxSpy.setResult();
            var model = new (apply.Model.mixin({urlRoot:'/users'}))({id:1});

            model.destroy();

            expect($.ajax).toHaveBeenCalledWith({url:'/users/1', type:'DELETE'});
        });

        it('should support a fetch method that will GET a urlRoot/{id}', function () {
            ajaxSpy.setResult();
            var model = new (apply.Model.mixin({urlRoot:'/users'}))({id:1});

            model.fetch();

            expect($.ajax).toHaveBeenCalledWith({url:'/users/1', type:'GET'});
        });

        it('should apply any fetched attributes to the model', function () {
            ajaxSpy.setResult({id:1, firstname:'Dave'});
            var model = new (apply.Model.mixin({urlRoot:'/users'}))({id:1});

            model.fetch();

            expect(model.get('id')).toBe(1);
            expect(model.get('firstname')).toBe('Dave');
        });

        it('should save models with the appropriate json', function () {
            ajaxSpy.setResult();
            var Student = apply.Model({urlRoot:'/students', mappings:{'school':apply.Model}});

            new Student({name:'Sam', school:{name:'Prime Elementary'}}).save();

            expect($.ajax).toHaveBeenCalledWith({url:jasmine.any(String), type:jasmine.any(String), contentType:jasmine.any(String), data:'{"name":"Sam","school":{"name":"Prime Elementary"}}'});
        });
    });


    describe('delegation', function () {
        it('should delegate "save" calls to the top level parent by default', function () {
            ajaxSpy.setResult();
            var Student = apply.Model({urlRoot:'/students', mappings:{'school':apply.Model}});

            new Student({name:'Sam', school:{name:'Prime Elementary'}}).get('school').save();

            expect($.ajax).toHaveBeenCalledWith({url:jasmine.any(String), type:jasmine.any(String), contentType:jasmine.any(String), data:'{"name":"Sam","school":{"name":"Prime Elementary"}}'});
        });

        it('should delegate "fetch" calls to the top level parent by default', function () {
            ajaxSpy.setResult();
            var Student = apply.Model({urlRoot:'/students', mappings:{'school':apply.Model}});

            new Student({id:1, name:'Sam', school:{name:'Prime Elementary'}}).get('school').fetch();

            expect($.ajax).toHaveBeenCalledWith({url:'/students/1', type:'GET'});
        });

        it('should delegate "destroy" calls to the top level parent by default', function () {
            ajaxSpy.setResult();
            var Student = apply.Model({urlRoot:'/students', mappings:{'school':apply.Model}});

            new Student({id:1, name:'Sam', school:{name:'Prime Elementary'}}).get('school').destroy();

            expect($.ajax).toHaveBeenCalledWith({url:'/students/1', type:'DELETE'});
        });
    });

});