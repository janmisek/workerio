import Platform from './platform/platform';
import Builder from './builder/interface-builder';
import Connection from './connection/connection';

var Client = Platform.Object.extend({

    connection: null,
    builder: null,
    iface: null,
    built: null,

    init: function () {
        this.connection = Connection.create({
            iface: this.iface,
            port: this.port
        });
        this.builder = Builder.create();
    },

    getInterface: function (name) {
        if (this.built) {
            return Platform.ResolvedPromise(this.built);
        } else {
            return this.connection.retrieveDefinition().then(function (serverDefinition) {
                this.built = this.builder.buildClientInterface(this.connection, serverDefinition);
                return this.built;
            }.bind(this));
        }
    }
});

export default Client;
