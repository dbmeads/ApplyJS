/*global apply, describe, it, expect, spyOn */
describe('apply.logger', function () {
    'use strict';

    var messages;

    beforeEach(function () {
        apply.logger = new apply.Logger();

        messages = [];

        spyOn(console, 'log').andCallFake(function (message) {
            messages.push(message);
        });
    });

    it('should support a "debug" level and log to console by default', function () {
        apply.logger.debug('test');

        expect(console.log).toHaveBeenCalledWith('test');
    });

    it('should also support "error", "warning" and "info" level logging by default', function () {
        apply.logger.error('test');
        apply.logger.warning('test');
        apply.logger.info('test');

        expect(console.log.callCount).toBe(3);
    });

    it('should support a config method that allows desired logging levels to be set', function () {
        apply.logger.config({debug:false, error:true, info:false});

        apply.logger.debug('test');

        expect(console.log).not.toHaveBeenCalled();

        apply.logger.error('test');

        expect(console.log).toHaveBeenCalled();

        apply.logger.info('test');

        expect(console.log.callCount).toBe(1);
    });

    it('should automatically add any loggers provided in config that are not already present', function () {
        apply.logger.config({myLevel:true, myOtherLevel:false});

        apply.logger.myLevel('test');
        apply.logger.myOtherLevel('test');

        expect(console.log.callCount).toBe(1);
    });

    it('should support function chaining for levels', function () {
        apply.logger.debug('test').info('test').error('test').warning('test');

        expect(console.log.callCount).toBe(4);
    });

    it('should expose the apply.Logger constructor so that we can generate features and create additional loggers if desired', function () {
        var myLogger = apply.Logger({test:'prop'}).singleton();

        myLogger.debug('test');

        expect(console.log).toHaveBeenCalledWith('test');
    });

    describe('log', function () {

        beforeEach(function () {
            apply.logger = apply.Logger({log:function (options) {
                options.message = '{{' + options.message + '}}';
            }}).singleton();
        });


        it('should delegate all logging to a reverse cascading "log" method that takes the "level" and "message" in an options object so that the logging can be easily enhanced', function () {
            apply.logger.config({myLevel:true});

            apply.logger.debug('1').error('2').info('3').warning('4').myLevel('5');

            expect(messages.length).toBe(5);
            expect(messages[0]).toBe('{{1}}');
            expect(messages[1]).toBe('{{2}}');
            expect(messages[2]).toBe('{{3}}');
            expect(messages[3]).toBe('{{4}}');
            expect(messages[4]).toBe('{{5}}');
        });
    });

});