/*global $, apply, ajaxSpy, window */
describe('apply.dependencies', function () {
    'use strict';

    var callback;

    beforeEach(function () {
        callback = jasmine.createSpy();
    });

    it('should grab a list of dependencies', function() {
        ajaxSpy.setResult('');

        apply.dependencies('test1.html', 'test2.html', 'test3.html');

        expect($.ajax.callCount).toBe(3);
        expect($.ajax.calls[0].args[0].url).toBe('test1.html');
        expect($.ajax.calls[1].args[0].url).toBe('test2.html');
        expect($.ajax.calls[2].args[0].url).toBe('test3.html');
    });

});