/*global importScripts, self  */

importScripts('./../workerio.js');

var shoutService = {

    valueOfObject: 'value-of-object',

    getValueOfObject: function() {
        return this.valueOfObject;
    },

    shout: function (text) {
        return text;
    },

    shoutAsynchronously: function (text) {
        return Promise.resolve(text);
    }

};

self.workerio.Server
    .create({port: self})
    .publishInterface('shoutService', shoutService);

