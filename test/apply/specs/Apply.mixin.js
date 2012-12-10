/*global window, apply, mixin, it, expect, Mixin, collection */
describe('apply.mixin', function () {
    'use strict';

    apply.toScope(window);

    it('should be able to provide an extended constructor', function () {
        var result = mixin({prop1:'test'});

        expect(result.prototype.prop1).toBe('test');
    });

    it('should provide a constructor capable of invoking an init function if provided', function () {
        var Constructor = mixin({init:function (message) {
            this.message = message;
        }});

        var result = new Constructor('sweet');

        expect(result.message).toBe('sweet');
    });

    it('should be able to apply mixins with properties overlaid in order from lowest to highest ordinal', function () {
        var result = mixin({prop1:'obj2', prop3:'obj2'}, {prop1:'obj1', prop2:'obj1'});

        expect(result.prototype.prop1).toBe('obj1');
        expect(result.prototype.prop2).toBe('obj1');
        expect(result.prototype.prop3).toBe('obj2');
    });

    it('should provide a mixin function on any returned constructor that allows additional constructors to be generated that include it as one of the mixins', function () {
        var Constructor = mixin({prop1:'Constructor', prop2:'Constructor'});

        var result = Constructor.mixin({prop1:'result'});

        expect(result.mixin).toBeDefined();
        expect(result.prototype.prop1).toBe('result');
        expect(result.prototype.prop2).toBe('Constructor');
        expect(Constructor.prototype.prop1).toBe('Constructor');
    });

    it('should cascade init functions across mixins', function () {
        var Constructor = mixin({init:function () {
            this.prop1 = 'prop1';
        }}).mixin({init:function () {
                this.prop2 = 'prop2';
            }});

        var result = new Constructor();

        expect(result.prop1).toBeDefined();
        expect(result.prop2).toBeDefined();
    });

    it('should support passing mixins as multiple parameters', function () {
        var result = mixin({prop1:'prop1'}, {prop2:'prop2'});

        expect(result.prototype.prop1).toBe('prop1');
        expect(result.prototype.prop2).toBe('prop2');
    });

    it('should support an optional namespace as the first parameter', function () {
        var result = mixin('Mixin.Object2', {prop1:'prop1'}, {prop2:'prop2'});

        expect(Mixin.Object2).toBeDefined();
        expect(Mixin.Object2.prototype.prop1).toBe('prop1');
        expect(Mixin.Object2.prototype.prop2).toBe('prop2');
    });

    it('should also support namespaces when invoking mixin from a previously generated constructor', function () {
        var result = mixin({prop1:'prop1'}).mixin('Mixin.Object3', {prop2:'prop2'});

        expect(Mixin.Object3).toBeDefined();
        expect(Mixin.Object3.prototype.prop1).toBe('prop1');
        expect(Mixin.Object3.prototype.prop2).toBe('prop2');
    });

    it('should assume that if the constructor is invoked without a new instance of itself, that mixin is desired', function () {
        var result = mixin({prop1:'prop1'})({prop2:'prop2'});

        expect(result.prototype.prop1).toBe('prop1');
        expect(result.prototype.prop2).toBe('prop2');
    });

    it('should support namespacing when mixins are applied through constructor invocation', function () {
        mixin({prop1:'prop1'})('Mixin.MyObject', {prop2:'prop2'});

        expect(Mixin.MyObject).toBeDefined();
        expect(Mixin.MyObject.prototype.prop1).toBe('prop1');
        expect(Mixin.MyObject.prototype.prop2).toBe('prop2');
    });

    it('should support a "construct" method on the constructor that will take a callback to be invoked on any additional constructors generated with this mixin', function () {
        var Mixin = mixin({test: 1}).construct(function(constructor){ constructor.prototype.test = 2; });

        expect(Mixin.mixin({prop2: 'prop'}).prototype.test).toBe(2);
    });

    it('should retain the list of original mixins on the constructor', function () {
        var mixins = [
            {},
            {}
        ];

        var Mixin = mixin(mixins[0], mixins[1]);

        expect(Mixin.mixins[0]).toBe(mixins[0]);
        expect(Mixin.mixins[1]).toBe(mixins[1]);
    });

});