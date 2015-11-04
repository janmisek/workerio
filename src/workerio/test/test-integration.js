/* global require, module, test, ok, equal, deepEqual, throws, notEqual */

import Client from './../client';
import Server from './../server';
import Platform from './../platform/platform';
import Workerio from './../index';
import PortMock from './mock/port';

export default function () {

    module('integration client/server test', {});

    var method = function () {
        return function () {
        };
    };

    test('Engine works - simple test', function () {
        return new Platform.Promise(function (resolve) {

            var worker = new Worker('worker.js');
            Workerio.getInterface(worker, 'shoutService')
                .then(function (ShoutService) {
                    var shoutService = ShoutService.create();
                    shoutService.shout('Hello world').then(function (result) {
                        equal(result, 'Hello world');
                        resolve();
                    });
                });

        });
    });

    test('Should be possible to extend built interface', function () {
        return new Platform.Promise(function (resolve) {

            var worker = new Worker('worker.js');
            Workerio.getInterface(worker, 'shoutService')
                .then(function (ShoutService) {

                    var MyShoutService = ShoutService.extend({
                        shout: function (name) {
                            var supr = ShoutService.prototype.shout.apply(this, arguments);

                            return supr.then(function (result) {
                                return result + ', How are you?';
                            });
                        }
                    });

                    var shoutService = MyShoutService.create();

                    shoutService.shout('Hello Michael')
                        .then(function (result) {
                            equal(result, 'Hello Michael, How are you?');
                            resolve();
                        });


                });

        });
    });


    test('Engine works for multiple calls', function () {
        return new Platform.Promise(function (resolve) {

            var k = 50;
            var j = 0;

            var worker = new Worker('worker.js');
            Workerio.getInterface(worker, 'shoutService')
                .then(function (ShoutService) {
                    var shoutService = ShoutService.create();
                    var all = [];
                    for (var i = 0; i < k; i++) {
                        all.push(shoutService.shout('Hello world').then(function () {
                            j++;
                        }));
                        all.push(shoutService.shoutAsynchronously('Hello world').then(function () {
                            j++;
                        }));
                    }
                    return Platform.Promise
                        .all(all)
                        .then(function () {
                            ok('resolved');
                            equal(j, k * 2);
                            resolve();
                        });
                });

        });
    });

    test('Synchronous method call should work', function () {
        return new Platform.Promise(function (resolve) {

            var worker = new Worker('worker.js');
            Workerio.getInterface(worker, 'shoutService')
                .then(function (ShoutService) {

                    var shoutService = ShoutService.create();
                    shoutService.shoutAsynchronously('Hello world').then(function (result) {
                        equal(result, 'Hello world');
                        resolve();
                    });

                });


        });
    });

    test('Context is preserved', function () {
        return new Platform.Promise(function (resolve) {

            var worker = new Worker('worker.js');
            Workerio.getInterface(worker, 'shoutService')
                .then(function (ShoutService) {
                    var shoutService = ShoutService.create();
                    shoutService.getValueOfObject().then(function (result) {
                        equal(result, 'value-of-object');
                        resolve();
                    });

                });


        });
    });


    test('More more parameters and object returned', function () {
        return new Platform.Promise(function (resolve) {

            var worker = new Worker('worker.js');
            Workerio.getInterface(worker, 'shoutService')
                .then(function (ShoutService) {
                    var shoutService = ShoutService.create();
                    return shoutService
                        .moreParametersReturnsObject('1', '2')
                        .then(function (o) {
                            deepEqual(o, {param1: '1', param2: '2'});
                            resolve();
                        });
                });
        });
    });

    test('Cannot publish existing interface', function () {
        Workerio.publishInterface(PortMock, 'theInterface', {});
        throws(function () {
            Workerio.publishInterface(PortMock, 'theInterface', {});
        });
    });

    test('Only port interface is allowed', function () {
        Workerio.checkPortInterface(PortMock);
        throws(function () {
            Workerio.checkPortInterface({});
        });
    });


    test('Twice request for interface returns same one', function () {
        return new Platform.Promise(function (resolve) {

            var worker = new Worker('worker.js');


            var p1 = Workerio.getInterface(worker, 'shoutService');
            var p2 = Workerio.getInterface(worker, 'shoutService');

            equal(p1, p2);

            return Platform.AllPromises([p1, p2])
                .then(function (more) {
                    equal(more[0], more[1]);
                    resolve()
                });

        });
    });

    test('More interfaces are retrieved at once', function () {
        return new Platform.Promise(function (resolve) {

            var worker = new Worker('worker.js');
            Workerio.getInterfaces(worker, ['shoutService', 'shoutService2'])
                .then(function (Services) {
                    ok(typeof Services.shoutService === 'function');
                    ok(typeof Services.shoutService2 === 'function');
                    resolve();
                });


        });
    });

    test('Timeouted interface retrieval contains proper exception', function () {
        return new Platform.Promise(function (resolve) {

            var serviceName = 'not-published-service';
            var worker = new Worker('worker.js');
            Workerio.getInterface(worker, serviceName)
                .catch(function (error) {
                    notEqual(error.message.indexOf(serviceName), -1);
                    resolve();
                });


        });
    });

    test('Should return exception when failed with error', function () {
        //@test expected and unexcpected error
        return new Platform.Promise(function (resolve) {

            var worker = new Worker('worker.js');
            Workerio.getInterface(worker, 'shoutService')
                .then(function (ShoutService) {
                    var shoutService = ShoutService.create();
                    return shoutService
                        .failedWithError()
                        .catch(function (e) {
                            equal(e.message, 'Error happens');
                            ok(e.stack);
                            resolve();
                        });
                });
        });
    });

    test('Should return exception when failed with string', function () {
        //@test expected and unexcpected error
        return new Platform.Promise(function (resolve) {

            var worker = new Worker('worker.js');
            Workerio.getInterface(worker, 'shoutService')
                .then(function (ShoutService) {
                    var shoutService = ShoutService.create();
                    return shoutService
                        .failedWithString()
                        .catch(function (e) {
                            equal(e.message, 'Error happens');
                            ok(!e.stack);
                            resolve();
                        });
                });
        });
    });


}