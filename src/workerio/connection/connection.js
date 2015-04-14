import Platform from './../platform/platform';
/* global addEventListener */

/**
 * Connection encapsulates all worker or window port and provides standardized
 * interface for client and server to communicate with each other
 *
 * @module workerio
 * @namespace workerio.connection
 * @class Connection
 */
var Connection = Platform.Object.extend(
    Platform.Evented,
    {

        port: null,
        iface: null,
        timeout: 500,
        serverDefinition: null,
        autoDefinitionRetrieval: true,

        init: function () {
            this.initPort();
            if (this.autoDefinitionRetrieval) {
                this.initDefinitionRetrieval();
            }
        },

        initPort: function () {
            // validate port
            if (!this.port || !this.port.postMessage) {
                throw new Error('Invalid port');
            }
            // validate iface name
            if (!this.iface) {
                throw new Error('Interface name not specified');
            }

            // interconnect with port
            this.port.addEventListener("message", function (event) {
                var data = event.data;

                // ignore non workerio messages
                // ignore messages from other connections
                if (data.prt === Connection.MSG_PROTOCOL && data.ifc === this.iface) {
                    this.trigger('message', data);

                    if (data.t === Connection.MSG_TYPE_REQUEST) {
                        this.trigger('request', data);
                        return;
                    }

                    if (data.t === Connection.MSG_TYPE_RESPONSE) {
                        this.trigger('response', data);
                        return;
                    }

                    if (data.t === Connection.MSG_TYPE_DEFINITION) {
                        this.trigger('definition', data);
                        return;
                    }

                    throw new Error('Unsupported message type');

                }

            }.bind(this));
        },

        initDefinitionRetrieval: function () {
            if (!this.serverDefinition) {
                this.serverDefinition = this

                    .waitForMessage(function (response) {
                        return (
                        response.t === Connection.MSG_TYPE_DEFINITION
                        );
                    }, true, `Interface definition of ${this.iface} has not been received in defined timeout.`)

                    .then(function (message) {
                        return message.def;
                    });
            }
            return this.serverDefinition;
        },

        retrieveDefinition: function () {
            this.initDefinitionRetrieval();
            return this.serverDefinition;

        },

        sendDefinition: function (serverDefinition) {
            this.port.postMessage({
                prt: Connection.MSG_PROTOCOL,
                ifc: this.iface,
                t: Connection.MSG_TYPE_DEFINITION,
                def: serverDefinition
            });
        },


        waitForMessage: function (condition, useTimeout, timeoutMessage = null) {
            return new Platform.Promise(function (resolve, reject) {
                var listener, timeout;

                // listen for response
                listener = this.on('message', function (response) {
                    if (condition(response)) {
                        this.un(listener);
                        clearTimeout(timeout);
                        resolve(response);
                    }
                }.bind(this));

                if (useTimeout) {
                    // set response timeout
                    timeout = setTimeout(function () {
                        this.un(listener);
                        clearTimeout(timeout);

                        var message = 'Request timeouted.';
                        if (timeoutMessage) {
                            message = message + ' ' + timeoutMessage;
                        }
                        reject(new Error(message));
                    }.bind(this), this.timeout);
                }

            }.bind(this));
        },

        respond: function (request, args) {
            var response = {
                prt: Connection.MSG_PROTOCOL,
                t: Connection.MSG_TYPE_RESPONSE,
                ifc: this.iface,
                d: request.d,
                a: args
            };

            this.port.postMessage(response);

            return response;
        },


        request: function (callee, args) {
            let request, listener, timeout;

            //@todo: better random dialog
            // create request object
            request = {
                prt: Connection.MSG_PROTOCOL,
                t: Connection.MSG_TYPE_REQUEST,
                ifc: this.iface,
                d: Math.random(),
                m: callee,
                a: args
            };

            var promise = this.waitForMessage(function (response) {
                return (
                response.t === Connection.MSG_TYPE_RESPONSE &&
                response.d === request.d
                );
            }, this.timeout);

            // post the message
            this.port.postMessage(request);

            return promise;
        }


    });


Object.defineProperty(Connection, 'MSG_TYPE_REQUEST', {
    value: 'rx',
    writable: false
});

Object.defineProperty(Connection, 'MSG_TYPE_RESPONSE', {
    value: 'tx',
    writable: false
});

Object.defineProperty(Connection, 'MSG_TYPE_DEFINITION', {
    value: 'def',
    writable: false
});

Object.defineProperty(Connection, 'MSG_PROTOCOL', {
    value: 'wio',
    writable: false
});


export default Connection;
