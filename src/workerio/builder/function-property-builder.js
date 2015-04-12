import Platform from './../platform/platform';

var FunctionPropertyBuilder = Platform.Object.extend({

    /**
     * Builds methods used on client interface to execute server methods
     * Using connection
     * @returns [{Function}]
     */
    buildClientInterface: function (connection, serverDefinition, mixin, propertyName) {
        // create proxy method on mixin
        mixin[propertyName] = function () {
            var args = Array.prototype.slice.call(arguments);
            return connection
                .request(propertyName, args)
                .then(function (response) {
                    return response.a;
                });
        };

        // update client's server definition
        mixin.serverDefinition[propertyName] = serverDefinition[propertyName];

    },

    /**
     * Builds methods on server interface to listen and respond to incomming methods call from client.
     * Using connection
     * @returns [{Function}]
     */
    buildServerInterface: function (connection, implementation, mixin, propertyName) {
        // assign the method to be run later
        implementation = implementation[propertyName];

        mixin.serverEvents[propertyName] = function () {
            connection.on('request', function (request) {
                if (request.m === propertyName) {
                    var result = implementation(request.a);
                    connection.respond(request, result);
                }
            }.bind(this));
        };

        mixin.serverDefinition[propertyName] = 'function';

    }


});

export default FunctionPropertyBuilder;