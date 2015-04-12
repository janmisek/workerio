import Platform from './../platform/platform';

var BaseInterface = Platform.Object.extend();

var BaseClientInterface = BaseInterface.extend({
    serverDefinition: null
});

var BaseServerInterface = BaseInterface.extend({
    serverEvents: null,
    init: function () {
        for (let key in this.serverEvents) {
            if (this.serverEvents.hasOwnProperty(key)) {
                this.serverEvents[key]();
            }
        }
    }
});

export default {
    BaseInterface: BaseInterface,
    BaseClientInterface: BaseClientInterface,
    BaseServerInterface: BaseServerInterface
}