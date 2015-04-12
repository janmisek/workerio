/*global importScripts, self  */

importScripts('./../dist/workerio.js');

var shoutService = {

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

