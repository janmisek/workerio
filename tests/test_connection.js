/* global require, module, test, ok, equal, deepEqual, throws */

require(['workerio/connection/connection', 'workerio/platform/platform'],

    function (Connection, Platform) {

        var method = function () {
            return function () {
            };
        };

        var mockedPort = function () {
            var PortMock = Platform.Object
                .extend(Platform.Evented)
                .create();

            PortMock.addEventListener = PortMock.on;
            PortMock.onmessage = method();
            PortMock.postMessage = function (msg) {
                this.trigger('message', {data: msg});
            };

            return PortMock;
        };

        module('connection tests', {});

        test('connection should work', function () {
            throws(function () {
                // cannot create without port and iface name
                var c = Connection.create();
            });

            var c = Connection.create({
                autoDefinitionRetrieval: false,
                iface: 'iface',
                port: mockedPort()
            });

            ok('connection created');
        });

        test('wait for message should work', function () {
            var port = mockedPort();

            var c = Connection.create({
                autoDefinitionRetrieval: false,
                iface: 'iface',
                port: port
            });

            setTimeout(function () {
                c.trigger('message', {value: 1});
            }, 200);

            return c.waitForMessage(function (data) {
                return data.value === 1;
            }, 1000).then(function () {
                ok('responsed');
            });
        });

        test('wait for message should timeout', function () {
            var port = mockedPort();

            var c = Connection.create({
                autoDefinitionRetrieval: false,
                iface: 'iface',
                port: port
            });

            return c.waitForMessage(function () {
                return true;
            }, 100).catch(function () {
                ok('responsed');
            });
        });

        test('send definition should work and wait for should retrieve definition', function () {
            var port = mockedPort();

            var c = Connection.create({
                autoDefinitionRetrieval: false,
                iface: 'iface',
                port: port
            });

            var promise = c.retrieveDefinition().then(function (def) {
                ok('should be executed');
                equal(def.method, 'function');
            });

            c.sendDefinition({
                method: 'function'
            });

            return promise;
        });

        test('wait for should retrieve definition automatically', function () {
            var port = mockedPort();

            var c = Connection.create({
                iface: 'iface',
                port: port
            });

            c.sendDefinition({
                method: 'function'
            });

            return c.serverDefinition.then(function() {
                ok('retrieval is running');
            });

        });



        test('request/respond should work', function () {
            var port = mockedPort();

            var c = Connection.create({
                autoDefinitionRetrieval: false,
                iface: 'iface',
                port: port
            });

            port.on('message', function (msg) {
                if (msg.data.t === Connection.MSG_TYPE_REQUEST) {
                    c.respond(msg.data, {value: 1});
                }
            });

            return c.request('m', {param: 'value'}).then(function (data) {
                ok('responded');
                equal(data.a.value, 1);
            });

        });

        test('messages should be consumed by proper connection', function () {
            var port = mockedPort();

            var i = 0;
            var j = 0;

            var c1 = Connection.create({
                autoDefinitionRetrieval: false,
                iface: 'iface1',
                port: port
            });

            var c2 = Connection.create({
                autoDefinitionRetrieval: false,
                iface: 'iface2',
                port: port
            });


            c1.on('request', function (msg) {
                i++;
            });

            c2.on('request', function (msg) {
                j++;
            });

            port.postMessage({
                ifc: 'iface1',
                t: Connection.MSG_TYPE_REQUEST,
                prt: Connection.MSG_PROTOCOL
            });

            port.postMessage({
                ifc: 'iface2',
                t: Connection.MSG_TYPE_REQUEST,
                prt: Connection.MSG_PROTOCOL
            });

            equal(i, 1);
            equal(j,1);

        });



        test('response mismatch cannot happen', function () {
            var port = mockedPort();

            var c = Connection.create({
                autoDefinitionRetrieval: false,
                iface: 'iface',
                port: port
            });

            port.on('message', function (msg) {
                if (msg.data.type === 'request') {
                    var rq = {
                        d: 'mismatched dialog',
                        t: Connection.MSG_TYPE_REQUEST,
                        m: 'something',
                        a: {}
                    };
                    c.respond(rq, {value: 1});
                }
            });

            return c.request('method', {param: 'value'})
                .catch(function (data) {
                    ok('should timeouted because no response came in');
                });

        });


    }
)
;