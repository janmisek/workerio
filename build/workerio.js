(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define('workerio', factory) :
    global.workerio = factory()
}(this, function () { 'use strict';

    // wrapper function to call be able call 'new' with given arguments
    // http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible'
    'use strict';

    function construct(constructor, args) {
        function WorkerIOObject() {
            return constructor.apply(this, args);
        }
        WorkerIOObject.prototype = constructor.prototype;
        return new WorkerIOObject();
    }

    var object__create = function create() {
        var args = Array.prototype.slice.call(arguments);
        return construct(this, args);
    };

    var extend = (function (_extend) {
        function extend() {
            return _extend.apply(this, arguments);
        }

        extend.toString = function () {
            return _extend.toString();
        };

        return extend;
    })(function () {

        // create constructor for class
        var constructor = function constructor() {
            for (var i = 0; i < arguments.length; i++) {
                var extension = arguments[i];

                if (!(extension instanceof Object)) {
                    throw new Error('Only Objects could be passed to constryuctor');
                }

                for (var n in extension) {
                    if (extension.hasOwnProperty(n)) {
                        this[n] = extension[n];
                    }
                }
            }
            if (this.init) {
                if (typeof this.init === 'function') {
                    this.init.apply(this, arguments);
                } else {
                    throw new Error('init hook must be function');
                }
            }
        };

        // update prototype
        var superprototype = this.prototype;
        var prototype = Object.create(superprototype);
        for (var i = 0; i < arguments.length; i++) {
            var extension = arguments[i];
            for (var n in extension) {
                if (extension.hasOwnProperty(n)) {
                    prototype[n] = extension[n];
                }
            }
        }

        constructor.superconstructor = this;
        constructor.superprototype = superprototype;
        constructor.prototype = prototype;
        constructor.prototype.constructor = prototype.constructor || constructor;
        constructor.extend = extend;
        constructor.create = object__create;

        return constructor;
    });

    var BaseObject = extend.apply(function () {});

    var object = BaseObject;

    "use strict";

    var Evented = {

        on: function on(name) {
            var callback = arguments[1] === undefined ? false : arguments[1];

            if (!this.listeners) {
                this.listeners = {};
            }

            if (!this.listeners[name]) {
                this.listeners[name] = [];
            }

            var listener = {
                callback: callback,
                one: false
            };

            this.listeners[name].unshift(listener);
            return listener;
        },

        one: function one(name, callback) {
            var timeout = arguments[2] === undefined ? false : arguments[2];

            if (!this.listeners) {
                this.listeners = {};
            }

            if (!this.listeners[name]) {
                this.listeners[name] = [];
            }
            var listener = {
                callback: callback,
                one: true
            };

            this.listeners[name].unshift(listener);
            return listener;
        },

        un: function un(listener) {
            if (!this.listeners) {
                this.listeners = {};
            }

            for (var key in this.listeners) {
                if (this.listeners.hasOwnProperty(key)) {
                    var listeners = this.listeners[key];
                    if (Array.isArray(listeners)) {
                        for (var i = 0; i < listeners.length; i++) {
                            if (listeners[i] === listener) {
                                listeners.splice(i, 1);
                            }
                        }
                    }
                }
            }
        },

        trigger: function trigger(name) {
            for (var _len = arguments.length, params = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                params[_key - 1] = arguments[_key];
            }

            if (!this.listeners) {
                this.listeners = {};
            }

            if (Array.isArray(this.listeners[name])) {
                var listeners = this.listeners[name];
                for (var i = 0; i < listeners.length; i++) {
                    var listener = listeners[i];
                    if (listener.one) {
                        this.un(listener);
                    }
                    listener.callback.apply(listener.callback, params);
                }
            }
        }

    };

    var evented = Evented;

    "use strict";

    var deferred__ResolvedPromise = function ResolvedPromise() {
        var args = arguments;
        return new Promise(function (resolve) {
            resolve.apply(resolve, args);
        });
    };

    var deferred = {
        Promise: Promise,
        ResolvedPromise: deferred__ResolvedPromise
    };

    'use strict';

    var Platform = {
        Promise: deferred.Promise,
        ResolvedPromise: deferred.ResolvedPromise,
        Evented: evented,
        Object: object
    };

    'use strict';

    var Helpers = Platform.Object.extend({

        /**
         * Executes method on proxied object on server. Make
         * synchronous and asynchronous methods compatibile
         * returning Promise/A+ always
         *
         * @param {Object} ctx
         * @param {Function} impl
         * @param {Array}
         * @param {Function} callback
         * @return {workerio.platform.Promise}
         */
        executeImplementation: function executeImplementation(ctx, impl, args) {

            return new Platform.Promise(function (resolve) {
                var r = impl.apply(ctx, args);

                if (r && typeof r.then === 'function') {
                    r.then(function (r) {
                        resolve(r);
                    });
                } else {
                    resolve(r);
                }
            });
        }

    });

    var helpers = Helpers;

    'use strict';

    var FunctionPropertyBuilder = Platform.Object.extend({

        /**
         * @type {workerio.builder.Helpers}
         */
        helpers: null,

        init: function init() {
            this.helpers = helpers.create();
        },

        /**
         * Builds methods used on client interface to execute server methods
         * Using connection
         * @param {workerio.connection.Connection} connection
         * @param {Object} serverDefinition definition of interface received from server
         * @param {Object} mixin contains built definition
         * @param {String} propertyName name of property of interface
         * @returns void
         */
        buildClientInterface: function buildClientInterface(connection, serverDefinition, mixin, propertyName) {
            // create proxy method on mixin
            mixin[propertyName] = function () {
                var args = Array.prototype.slice.call(arguments);
                return connection.request(propertyName, args).then(function (response) {
                    return response.a;
                });
            };

            // update client's server definition
            mixin.serverDefinition[propertyName] = serverDefinition[propertyName];
        },

        /**
         * Builds methods on server interface to listen and respond to incomming methods call from client.
         * Using connection
         * @param {workerio.connection.Connection} connection
         * @param {Object} implementation object to be proxied on client
         * @param {Object} mixin to add implementation definition
         * @param {String} propertyName property name to be built
         * @returns void
         */
        buildServerInterface: function buildServerInterface(connection, implementation, mixin, propertyName) {
            // assign the method to be run later
            var ctx = implementation;
            var method = implementation[propertyName];
            var executeImplementation = this.helpers.executeImplementation;

            mixin.serverEvents[propertyName] = function () {
                connection.on('request', (function (request) {
                    if (request.m === propertyName) {
                        executeImplementation(ctx, method, request.a).then(function (result) {
                            connection.respond(request, result);
                        });
                    }
                }).bind(this));
            };

            mixin.serverDefinition[propertyName] = 'function';
        }

    });

    var function_property_builder = FunctionPropertyBuilder;

    'use strict';

    var BaseInterface = Platform.Object.extend();

    var BaseClientInterface = BaseInterface.extend({
        serverDefinition: null
    });

    var BaseServerInterface = BaseInterface.extend({
        serverEvents: null,
        init: function init() {
            for (var key in this.serverEvents) {
                if (this.serverEvents.hasOwnProperty(key)) {
                    this.serverEvents[key]();
                }
            }
        }
    });

    var BaseInterfaces = {
        BaseInterface: BaseInterface,
        BaseClientInterface: BaseClientInterface,
        BaseServerInterface: BaseServerInterface
    };

    'use strict';

    var InterfaceBuilder = Platform.Object.extend({

        propertyBuilders: null,

        init: function init() {
            this.propertyBuilders = {};
            this.propertyBuilders['function'] = function_property_builder;
        },

        parsePropertyType: function parsePropertyType(property) {
            return typeof property;
        },

        getPropertyBuilder: function getPropertyBuilder(type) {
            return this.propertyBuilders[type];
        },

        factoryClientInterface: function factoryClientInterface(mixin) {
            var iface = BaseInterfaces.BaseClientInterface.extend(mixin);
            return iface;
        },

        factoryServerInterface: function factoryServerInterface(mixin) {
            var iface = BaseInterfaces.BaseServerInterface.extend(mixin);
            return iface;
        },

        factoryMixin: function factoryMixin() {
            return {
                serverDefinition: {},
                serverEvents: {}
            };
        },

        buildServerInterface: function buildServerInterface(connection, implementation) {

            var mixin = this.factoryMixin();

            for (var propName in implementation) {
                if (implementation.hasOwnProperty(propName)) {
                    var type = this.parsePropertyType(implementation[propName]);
                    var builder = this.getPropertyBuilder(type);
                    if (builder) {
                        builder.create().buildServerInterface(connection, implementation, mixin, propName);
                    }
                }
            }

            var iface = this.factoryServerInterface(mixin);
            return iface;
        },

        buildClientInterface: function buildClientInterface(connection, serverDefinition) {

            var mixin = this.factoryMixin();

            for (var propName in serverDefinition) {
                if (serverDefinition.hasOwnProperty(propName)) {

                    var builder = this.getPropertyBuilder(serverDefinition[propName]);
                    if (builder) {
                        builder.create().buildClientInterface(connection, serverDefinition, mixin, propName);
                    }
                }
            }

            var iface = this.factoryClientInterface(mixin);
            return iface;
        }

    });

    var Builder = InterfaceBuilder;

    'use strict';

    var Connection = Platform.Object.extend(Platform.Evented, {

        port: null,
        iface: null,
        timeout: 500,
        serverDefinition: null,
        autoDefinitionRetrieval: true,

        init: function init() {
            this.initPort();
            if (this.autoDefinitionRetrieval) {
                this.initDefinitionRetrieval();
            }
        },

        initPort: function initPort() {
            // validate port
            if (!this.port || !this.port.postMessage) {
                throw new Error('Invalid port');
            }
            // validate iface name
            if (!this.iface) {
                throw new Error('Interface name not specified');
            }

            // interconnect with port
            this.port.addEventListener('message', (function (event) {
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
            }).bind(this));
        },

        initDefinitionRetrieval: function initDefinitionRetrieval() {
            if (!this.serverDefinition) {
                this.serverDefinition = this.waitForMessage(function (response) {
                    return response.t === Connection.MSG_TYPE_DEFINITION;
                }).then(function (message) {
                    return message.def;
                });
            }
            return this.serverDefinition;
        },

        retrieveDefinition: function retrieveDefinition() {
            this.initDefinitionRetrieval();
            return this.serverDefinition;
        },

        sendDefinition: function sendDefinition(serverDefinition) {
            this.port.postMessage({
                prt: Connection.MSG_PROTOCOL,
                ifc: this.iface,
                t: Connection.MSG_TYPE_DEFINITION,
                def: serverDefinition
            });
        },

        waitForMessage: function waitForMessage(condition, useTimeout) {
            return new Platform.Promise((function (resolve, reject) {
                var listener, timeout;

                // listen for response
                listener = this.on('message', (function (response) {
                    if (condition(response)) {
                        this.un(listener);
                        clearTimeout(timeout);
                        resolve(response);
                    }
                }).bind(this));

                if (useTimeout) {
                    // set response timeout
                    timeout = setTimeout((function () {
                        this.un(listener);
                        clearTimeout(timeout);
                        // @todo: more comprehensive message here
                        reject(new Error('Request timeouted'));
                    }).bind(this), useTimeout);
                }
            }).bind(this));
        },

        respond: function respond(request, args) {
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

        request: function request(callee, args) {
            var request = undefined,
                listener = undefined,
                timeout = undefined;

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
                return response.t === Connection.MSG_TYPE_RESPONSE && response.d === request.d;
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

    var connection_connection = Connection;

    'use strict';

    var Client = Platform.Object.extend({

        connection: null,
        builder: null,
        iface: null,
        built: null,

        init: function init() {
            this.connection = connection_connection.create({
                iface: this.iface,
                port: this.port
            });
            this.builder = Builder.create();
        },

        getInterface: function getInterface(name) {
            if (this.built) {
                return Platform.ResolvedPromise(this.built);
            } else {
                return this.connection.retrieveDefinition().then((function (serverDefinition) {
                    this.built = this.builder.buildClientInterface(this.connection, serverDefinition);
                    return this.built;
                }).bind(this));
            }
        }
    });

    var client = Client;

    'use strict';

    var Server = Platform.Object.extend({

        connection: null,
        builder: null,
        iface: null,
        built: null,

        publishInterface: function publishInterface(iface, implementation) {
            if (this.built) {
                throw new Error('Already published');
            }
            if (!implementation) {
                throw new Error('Implementation not provided');
            }

            this.iface = iface;

            this.connection = connection_connection.create({
                iface: this.iface,
                port: this.port
            });

            this.builder = Builder.create();

            this.built = this.builder.buildServerInterface(this.connection, implementation).create();

            this.connection.sendDefinition(this.built.serverDefinition);

            return this.built;
        }

    });

    var server = Server;

    'use strict';

    var index = {
        Connection: connection_connection,
        Client: client,
        Server: server,
        Platform: Platform
    };

    return index;

}));