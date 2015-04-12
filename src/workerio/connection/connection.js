import Platform from './../platform/platform';
/* global addEventListener */

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
                if (data.id === Connection.MSG_IDENITY) {

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
                this.serverDefinition = this.waitForMessage(function (response) {
                    return (
                    response.t === Connection.MSG_TYPE_DEFINITION
                    );
                }).then(function (message) {
                    return message.def;
                });
            }
            return this.serverDefinition;
        },

        retrieveDefinition: function () {
            this.initDefinitionRetrieval();
            return this.serverDefinition;

        },

        sendDefition: function (serverDefinition) {
            this.port.postMessage({
                id: Connection.MSG_IDENITY,
                t: Connection.MSG_TYPE_DEFINITION,
                def: serverDefinition
            });
        },


        waitForMessage: function (condition, useTimeout) {
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
                        // @todo: more comprehensive message here
                        reject(new Error('Request timeouted'));
                    }.bind(this), useTimeout);
                }

            }.bind(this));
        },

        respond: function (request, args) {
            var response = {
                id: Connection.MSG_IDENITY,
                t: Connection.MSG_TYPE_RESPONSE,
                ifc: this.if,
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
                id: Connection.MSG_IDENITY,
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

Object.defineProperty(Connection, 'MSG_IDENITY', {
    value: 'wio',
    writable: false
});


export default Connection;
