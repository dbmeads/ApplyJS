/*global Apply, describe, it, expect, spyOn */
describe('Apply.logger', function () {
    'use strict';

    var messages;

    beforeEach(function () {
        Apply.logger = new Apply.Logger();

        messages = [];

        spyOn(console, 'log').andCallFake(function (message) {
            messages.push(message);
        });
    });

    it('should support a "debug" level and log to console by default', function () {
        Apply.logger.debug('test');

        expect(console.log).toHaveBeenCalledWith('test');
    });

    it('should also support "error", "warning" and "info" level logging by default', function () {
        Apply.logger.error('test');
        Apply.logger.warning('test');
        Apply.logger.info('test');

        expect(console.log.callCount).toBe(3);
    });

    it('should support a config method that allows desired logging levels to be set', function () {
        Apply.logger.config({debug:false, error:true, info:false});

        Apply.logger.debug('test');

        expect(console.log).not.toHaveBeenCalled();

        Apply.logger.error('test');

        expect(console.log).toHaveBeenCalled();

        Apply.logger.info('test');

        expect(console.log.callCount).toBe(1);
    });

    it('should automatically add any loggers provided in config that are not already present', function () {
        Apply.logger.config({myLevel:true, myOtherLevel:false});

        Apply.logger.myLevel('test');
        Apply.logger.myOtherLevel('test');

        expect(console.log.callCount).toBe(1);
    });

    it('should support function chaining for levels', function () {
        Apply.logger.debug('test').info('test').error('test').warning('test');

        expect(console.log.callCount).toBe(4);
    });

    it('should expose the Apply.Logger constructor so that we can mixin features and create additional loggers if desired', function () {
        var myLogger = Apply.Logger({test:'prop'}).singleton();

        myLogger.debug('test');

        expect(console.log).toHaveBeenCalledWith('test');
    });

    describe('log', function () {

        beforeEach(function () {
            Apply.logger = Apply.Logger({log:function (options) {
                options.message = '{{' + options.message + '}}';
            }}).singleton();
        });


        it('should delegate all logging to a reverse cascading "log" method that takes the "level" and "message" in an options object so that the logging can be easily enhanced', function () {
            Apply.logger.config({myLevel:true});

            Apply.logger.debug('1').error('2').info('3').warning('4').myLevel('5');

            expect(messages.length).toBe(5);
            expect(messages[0]).toBe('{{1}}');
            expect(messages[1]).toBe('{{2}}');
            expect(messages[2]).toBe('{{3}}');
            expect(messages[3]).toBe('{{4}}');
            expect(messages[4]).toBe('{{5}}');
        });
    });

});