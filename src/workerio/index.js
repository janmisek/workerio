import Client from './client';
import Server from './server';
import Platform from './platform/platform';
import Connection from './connection/connection';

//@todo: failed call to interfaced methods respond with error, get rid of timeout
//@todo: add test for failed method to inform about related serviceName

/**
 *
 * Global api entry point for worker io
 *
 * @namespace workerio
 * @class workerio
 */
var Wokrkerio = {
    
    /**
     * Publish interface for client. Each interface with specified name could be published once on specified port
     *
     * @param {Object} port on which publish the implementation
     * @param {String} name name of implementation to be consumed by client
     * @param {Object} implementation object to be interfaced on client
     * @return {self}
     *
     */
    publishInterface: function (port, name, implementation) {
        if (this.isPublished(port, name)) {
            throw new Error(`Interface ${name} is already published on port`);
        }

        var server = Server.create({port: port}).publishInterface(name, implementation);
        this._published.push({
            port: port,
            name: name,
            server: server
        });

        return this;
    },

    /**
     * Subscribe to more interfaces at once
     *
     * @param {Object} port port with published the implementation
     * @param {Array} names of interfaces to resolve
     * @returns {Promise} with hash of resolved promises by name
     */
    getInterfaces: function (port, names) {
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

    /**
     * Subscribe to single interface
     * @param {Object} port port with published the implementation
     * @param {String} name of interface to resolve
     * @returns {Promise} promise with result of Interface Class
     */
    getInterface: function (port, name) {
        this.checkPortInterface(port);

        if (typeof name !== 'string') {
            throw new Error('Interface name must be String. Please use namespaced names such as MyApplication.MyInterface to prevent collisions');
        }

        // get subscribed promise first
        var promise = null;
        for (var i = 0; i < this._subscribed.length; i++) {
            var subscribed = this._subscribed[i];
            if (subscribed.port === port && subscribed.name === name) {
                promise = subscribed;
                break;
            }
        }

        // not subscribed yet, subscribe
        if (!promise) {
            promise = Client.create({port: port, iface: name}).getInterface(name);
            promise.name = name;
            promise.port = port;
            this._subscribed.push(promise);
        }


        return promise;
    },

    /**
     * Returns whether interface with given name has been already published on port
     *
     * @todo: this should be much more clever
     * Consider more threads using same port, this could be situation of SharedWorker or window
     *
     * @param {Object} port with published the implementation
     * @param {String} name name of published interface
     * @returns {boolean}
     */
    isPublished: function (port, name) {
        for (var i = 0; i < this._published.length; i++) {
            var published = this._published[i];
            if (published.port === port && published.name === name) {
                return true;
            }
        }
        return false;
    },

    /**
     * Check whether port has proper interface
     * @param {*} port
     */
    checkPortInterface: function (port) {
        if (!(
            typeof port === 'object' &&
            typeof port.onmessage !== undefined &&
            typeof port.addEventListener === 'function' &&
            typeof port.postMessage === 'function'
            )) {
            if (!this.isPortInterface(port)) {
                throw new Error(
                    [
                        'Port has invalid interface. Port must have addListener, postMessage method and message event.',
                        'Generally port should be window, worker or self inside worker.'
                    ].join()
                );
            }
        }
    },

    _published: [],
    _subscribed: [],

    Client: Client,
    Server: Server,
    Connection: Connection,
    Platform: Platform,
    
    
};


export default Wokrkerio;

