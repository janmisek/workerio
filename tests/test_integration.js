/* global require, module, test, ok, equal, deepEqual */

require(['workerio/platform/platform', 'workerio/client', 'workerio/server'],
    function (Platform, Client, Server) {

        module('integration client/server test', {});

        var method = function () {
            return function () {
            };
        };

        test('Engine works - simple test', function () {
            return new Platform.Promise(function (resolve) {

                var worker = new Worker('worker.js');
                var client = Client.create({port: worker, iface: 'shoutService'});
                client.getInterface().then(function (ShoutService) {
                    var shoutService = ShoutService.create();
                    shoutService.shout('Hello world').then(function (result) {
                        equal(result, 'Hello world');
                        resolve();
                    });

                });

            });
        });

        test('Engine works for multiple calls', function () {
            return new Platform.Promise(function (resolve) {

                var worker = new Worker('worker.js');
                var k = 50;
                var j = 0;
                var client = Client.create({port: worker, iface: 'shoutService'});
                client.getInterface().then(function (ShoutService) {
                    var shoutService = ShoutService.create();
                    var all = [];
                    for (var i = 0; i < k; i++) {
                        all.push(shoutService.shout('Hello world').then(function() {j++;}));
                        all.push(shoutService.shoutAsynchronously('Hello world').then(function() {j++;}));
                    }
                    return Platform.Promise
                        .all(all)
                        .then(function () {
                            ok('resolved');
                            equal(j,k*2);
                            resolve();
                        });
                });

            });
        });

        test('Synchronous method call should work', function () {
            return new Platform.Promise(function (resolve) {

                var worker = new Worker('worker.js');
                var client = Client.create({port: worker, iface: 'shoutService'});

                client.getInterface().then(function (ShoutService) {
                    var shoutService = ShoutService.create();
                    shoutService.shoutAsynchronously('Hello world').then(function (result) {
                        equal(result, 'Hello world');
                        resolve();
                    });

                });


            });
        });
        
        

    });