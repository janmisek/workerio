/* global require, module, test, ok, equal, deepEqual */

require(['workerio/platform/platform', 'workerio/client', 'workerio/server'],
    function (Platform, Client, Server) {

        module('integration client/server test', {});

        var method = function () {
            return function () {
            };
        };

        test('Engine works', function () {
            return new Platform.Promise(function (resolve) {

                var worker = new Worker('worker.js');
                var client = Client.create({port: worker, iface: 'shoutService'});
                client.getInterface().then(function (InterfaceFactory) {
                    var iface = InterfaceFactory.create();
                    iface.shout('Hello world').then(function (result) {
                        equal(result, 'Hello world');
                        resolve();
                    });

                });

            });
        });

        test('Engine works for multiple calls', function () {
            return new Platform.Promise(function (resolve) {

                var worker = new Worker('worker.js');
                var k = 100;
                var j = 0;
                var client = Client.create({port: worker, iface: 'shoutService'});
                client.getInterface().then(function (InterfaceFactory) {
                    var iface = InterfaceFactory.create();
                    var all = [];
                    for (var i = 0; i < k; i++) {
                        all.push(iface.shout('Hello world').then(function() {j++;}));
                    }
                    return Platform.Promise
                        .all(all)
                        .then(function () {
                            ok('resolved');
                            equal(j,k);
                            resolve();
                        });
                });

            });
        });


    });