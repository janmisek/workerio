import Platform from './../platform/platform';
import FunctionPropertyBuilder from './function-property-builder';
import BaseInterfaces from './base-interfaces';


// @todo: setters and getters for 'number','boolean' 'string',
// @todo: setters and getters for object, must have method normalize
// @todo: support for calls with dotted notation


var InterfaceBuilder = Platform.Object.extend({

    propertyBuilders: null,

    init: function () {
        this.propertyBuilders = {};
        this.propertyBuilders['function'] = FunctionPropertyBuilder;
    },


    parsePropertyType: function (property) {
        return typeof property;
    },

    getPropertyBuilder: function (type) {
        return this.propertyBuilders[type];
    },

    factoryClientInterface: function (mixin) {
        var iface = BaseInterfaces.BaseClientInterface.extend(mixin);
        return iface;
    },

    factoryServerInterface: function (mixin) {
        var iface = BaseInterfaces.BaseServerInterface.extend(mixin);
        return iface;
    },

    factoryMixin: function () {
        return {
            serverDefinition: {},
            serverEvents: {}
        };
    },


    buildServerInterface: function (connection, implementation) {

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

    buildClientInterface: function (connection, serverDefinition) {

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

export default InterfaceBuilder;