/* global require, module, test, ok, equal, deepEqual */

require(['workerio/builder/interface-builder'], function (Builder) {

    module('builder tests', {});

    var method = function () {
        return function () {
        };
    };

    var connectionMock = {
        on: method()
    };

    test('should create proper server interface', function () {
        var o = {
            method: method(),
            property: 'value'
        };

        var builder = Builder.create();
        var ClientInterface = builder.buildServerInterface(connectionMock, o);
        var iface = ClientInterface.create();

        ok(iface.serverEvents.method, 'only methods are propagated');
        ok(!iface.serverEvents.property, 'properies are ignored for now');
        equal(iface.serverDefinition.method, 'function', 'server definition exists');
    });

    test('should create proper client interface', function () {
        var def = {
            method: 'function',
            property: 'some-other-type'
        };

        var builder = Builder.create();
        var ClientInterface = builder.buildClientInterface(connectionMock, def);
        var iface = ClientInterface.create();

        ok(iface.serverDefinition.method, 'only methods are propagated');
        ok(!iface.serverDefinition.property, 'properies are ignored for now');
        ok(iface.method, 'only methods are propagated');
        ok(!iface.property, 'properies are ignored for now');
    });


});