import Platform from './platform/platform';
import Builder from './builder/interface-builder';
import Connection from './connection/connection';

var Server = Platform.Object.extend({

    connection: null,
    builder: null,
    iface: null,
    built: null,


    publishInterface: function (iface, implementation) {
        if (this.built) {
            throw new Error('Already published');
        }
        if (!implementation) {
            throw new Error('Implementation not provided');
        }

        this.iface = iface;

        this.connection = Connection.create({
            iface: this.iface,
            port: this.port
        });

        this.builder = Builder.create();

        this.built = this.builder.buildServerInterface(this.connection, implementation).create();

        this.connection.sendDefition(this.built.serverDefinition);

        return this.built;
    }


});

export default Server;
