/*global importScripts, self  */

importScripts('./../workerio.js');

var shoutService = {

    valueOfObject: 'value-of-object',

    getValueOfObject: function () {
        return this.valueOfObject;
    },

    failedWithError: function() {
        throw new Error('Error happens');
    },

    failedWithString: function() {
        throw 'Error happens';
    },

    moreParametersReturnsObject: function(param1, param2) {
        return {param1: param1, param2: param2};
    },

    shout: function (text) {
        return text;
    },

    shoutAsynchronously: function (text) {
        return Promise.resolve(text);
    }

};

self.workerio
    .publishInterface(self, 'shoutService', shoutService)
    .publishInterface(self, 'shoutService2', shoutService);

