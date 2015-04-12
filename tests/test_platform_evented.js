/* global require, module, test, ok, equal, deepEqual, throws */

require(['workerio/platform/platform'], function (Platform) {
    module('platform evented tests', {});

    test('on event should work', function () {

        var o = Platform.Object
            .extend(Platform.Evented)
            .create();

        var i = 0;

        o.on('event', function () {
            i++;
        });

        o.trigger('event');
        o.trigger('event');


        equal(i, 2);

    });

    test('one event should work', function () {

        var o = Platform.Object
            .extend(Platform.Evented)
            .create();

        var i = 0;

        o.one('event', function () {
            i++;
        });

        o.trigger('event');
        o.trigger('event');


        equal(i, 1);

    });

    test('un event should work', function () {

        var o = Platform.Object
            .extend(Platform.Evented)
            .create();

        var i = 0;

        var listener = o.on('event', function () {
            i++;
        });

        // another listener to ensure un working properly
        o.on('event', function () {
            i++;
        });

        o.trigger('event');

        equal(i, 2);

        o.un(listener);

        // will be run *1
        o.trigger('event');

        equal(i, 3);

    });


});