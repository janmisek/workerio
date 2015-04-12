import Platform from './../platform/platform';
import Helpers from './helpers';

/**
 *
 * Builds the client and server proxy interface for
 * standard object method ( property of function type )
 *
 * @module workerio
 * @namespace workerio.builder
 * @class FunctionPropertyBuilder
 */
var FunctionPropertyBuilder = Platform.Object.extend({

    /**
     * @type {workerio.builder.Helpers}
     */
    helpers: null,

    init: function () {
        this.helpers = Helpers.create();
    },

    /**
     * Builds methods used on client interface to execute server methods
     * Using connection
     * @param {workerio.connection.Connection}
     * @param {Object} serverDefinition definition of interface received from server
     * @param {Object} mixin contains built definition
     * @param {String} propertyName name of property of interface
     * @returns void
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
     * @param {workerio.connection.Connection}
     * @param {Object} implementation object to be proxied on client
     * @param {Object} mixin to add implementation definition
     * @param {String} propertyName property to be built
     * @returns void
     */
    buildServerInterface: function (connection, implementation, mixin, propertyName) {
        // assign the method to be run later
        var ctx = implementation;
        var method = implementation[propertyName];
        var executeImplementation = this.helpers.executeImplementation;

        mixin.serverEvents[propertyName] = function () {
            connection.on('request', function (request) {
                if (request.m === propertyName) {
                    executeImplementation(ctx, method, request.a)
                        .then(function (result) {
                            connection.respond(request, result);
                        });

                }
            }.bind(this));
        };

        mixin.serverDefinition[propertyName] = 'function';

    }


});

export default FunctionPropertyBuilder;