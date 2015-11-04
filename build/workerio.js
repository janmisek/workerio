(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define('workerio', factory) :
    global.workerio = factory()
}(this, function () { 'use strict';

    'use strict';

    function construct(constructor, args) {
        function WorkerIOObject() {
            return constructor.apply(this, args);
        }
        WorkerIOObject.prototype = constructor.prototype;
        return new WorkerIOObject();
    }

    var platform_object__create = function create() {
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
        constructor.create = platform_object__create;

        return constructor;
    });

    var BaseObject = extend.apply(function () {});

    var platform_object = BaseObject;

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

    var Deffered__HashedPromises = function HashedPromises(object) {
        var promises = [];
        var keys = [];
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                promises.push(object[key]);
                keys.push(key);
            }
        }
        return Promise.all(promises).then(function (results) {
            for (var i = 0; i < results.length; i++) {
                var result = results[i];
                object[keys[i]] = results[i];
            }
            return object;
        });
    };

    var Deffered = {
        AllPromises: Promise.all.bind(Promise),
        ResolvedPromise: Promise.resolve.bind(Promise),
        HashedPromises: Deffered__HashedPromises
    };

    'use strict';

    var Platform = {
        Promise: Promise,
        ResolvedPromise: Deffered.ResolvedPromise,
        AllPromises: Deffered.AllPromises,
        HashedPromises: Deffered.HashedPromises,
        Evented: evented,
        Object: platform_object
    };

    'use strict';

    var Helpers = Platform.Object.extend({
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
        helpers: null,

        init: function init() {
            this.helpers = helpers.create();
        },
        buildClientInterface: function buildClientInterface(connection, serverDefinition, mixin, propertyName) {
            mixin[propertyName] = function () {
                var args = Array.prototype.slice.call(arguments);
                return connection.request(propertyName, args).then(function (response) {
                    return response.a;
                });
            };

            mixin.serverDefinition[propertyName] = serverDefinition[propertyName];
        },
        buildServerInterface: function buildServerInterface(connection, implementation, mixin, propertyName) {
            var ctx = implementation;
            var method = implementation[propertyName];
            var executeImplementation = this.helpers.executeImplementation;

            mixin.serverEvents[propertyName] = function () {
                connection.on('request', (function (request) {
                    if (request.m === propertyName) {
                        executeImplementation(ctx, method, request.a).then(function (result) {
                            connection.respond(request, true, result);
                        })['catch'](function (error) {
                            connection.respond(request, false, error);
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
        timeout: 2000,
        serverDefinition: null,
        autoDefinitionRetrieval: true,

        init: function init() {
            this.initPort();
            if (this.autoDefinitionRetrieval) {
                this.initDefinitionRetrieval();
            }
        },

        initPort: function initPort() {
            if (!this.port || !this.port.postMessage) {
                throw new Error('Invalid port');
            }

            if (!this.iface) {
                throw new Error('Interface name not specified');
            }

            this.port.addEventListener('message', (function (event) {
                var data = event.data;

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
                }, true, 'Interface definition of ' + this.iface + ' has not been received in defined timeout.').then(function (message) {
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
            var timeoutMessage = arguments[2] === undefined ? null : arguments[2];

            return new Platform.Promise((function (resolve, reject) {
                var listener, timeout;

                listener = this.on('message', (function (response) {
                    if (condition(response)) {
                        this.un(listener);
                        clearTimeout(timeout);
                        resolve(response);
                    }
                }).bind(this));

                if (useTimeout) {
                    timeout = setTimeout((function () {
                        this.un(listener);
                        clearTimeout(timeout);

                        var message = 'Request timeouted.';
                        if (timeoutMessage) {
                            message = message + ' ' + timeoutMessage;
                        }
                        reject(new Error(message));
                    }).bind(this), this.timeout);
                }
            }).bind(this));
        },
        respond: function respond(request, isSuccess, args) {
            var response = {
                prt: Connection.MSG_PROTOCOL,
                t: Connection.MSG_TYPE_RESPONSE,
                s: isSuccess,
                ifc: this.iface,
                d: request.d
            };

            if (isSuccess) {
                response.a = args;
            } else {
                var error = {
                    m: typeof args.message === 'string' ? args.message : String(args),
                    s: typeof args.stack === 'string' ? args.stack : ''
                };
                response.a = error;
            }

            this.port.postMessage(response);

            return response;
        },
        request: function request(callee, args) {
            var request = undefined,
                listener = undefined,
                timeout = undefined;

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
            });

            this.port.postMessage(request);

            promise = promise.then(function (response) {
                if (!response.s) {
                    var message = response.a.m ? response.a.m : 'Unexpected error';
                    var error = new Error(message);
                    error.stack = response.a.s;
                    throw error;
                }
                return response;
            });

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

        getInterface: function getInterface() {
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
                autoDefinitionRetrieval: false,
                iface: this.iface,
                port: this.port
            });

            this.builder = Builder.create();

            this.built = this.builder.buildServerInterface(this.connection, implementation).create();

            this.connection.sendDefinition(this.built.serverDefinition);

            return this.built;
        }

    });

    var _server = Server;

    'use strict';

    var Wokrkerio = {
        publishInterface: function publishInterface(port, name, implementation) {
            if (this.isPublished(port, name)) {
                throw new Error('Interface ' + name + ' is already published on port');
            }

            var server = _server.create({ port: port }).publishInterface(name, implementation);
            this._published.push({
                port: port,
                name: name,
                server: server
            });

            return this;
        },
        getInterfaces: function getInterfaces(port, names) {
            this.checkPortInterface(port);

            if (!Array.isArray(names)) {
                throw new Error('Please provide array of interface names');
            }

            var ifaces = {};

            for (var i = 0; i < names.length; i++) {
                ifaces[names[i]] = this.getInterface(port, names[i]);
            }

            return new Platform.HashedPromises(ifaces);
        },
        getInterface: function getInterface(port, name) {
            this.checkPortInterface(port);

            if (typeof name !== 'string') {
                throw new Error('Interface name must be String. Please use namespaced names such as MyApplication.MyInterface to prevent collisions');
            }

            var promise = null;
            for (var i = 0; i < this._subscribed.length; i++) {
                var subscribed = this._subscribed[i];
                if (subscribed.port === port && subscribed.name === name) {
                    promise = subscribed;
                    break;
                }
            }

            if (!promise) {
                promise = client.create({ port: port, iface: name }).getInterface(name);
                promise.name = name;
                promise.port = port;
                this._subscribed.push(promise);
            }

            return promise;
        },
        isPublished: function isPublished(port, name) {
            for (var i = 0; i < this._published.length; i++) {
                var published = this._published[i];
                if (published.port === port && published.name === name) {
                    return true;
                }
            }
            return false;
        },
        checkPortInterface: function checkPortInterface(port) {
            if (!(typeof port === 'object' && typeof port.onmessage !== undefined && typeof port.addEventListener === 'function' && typeof port.postMessage === 'function')) {
                if (!this.isPortInterface(port)) {
                    throw new Error(['Port has invalid interface. Port must have addListener, postMessage method and message event.', 'Generally port should be window, worker or self inside worker.'].join());
                }
            }
        },

        _published: [],
        _subscribed: [],

        Client: client,
        Server: _server,
        Connection: connection_connection,
        Platform: Platform };

    var index = Wokrkerio;

    return index;

}));