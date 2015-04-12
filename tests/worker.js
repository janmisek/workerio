/*global postMessage, importScripts, self, require */

importScripts('./../vendors/require.js');
importScripts('./../dist/workerio.js');

require(['workerio/server'], function (Server) {

    var shoutService = {

        shout: function (text) {
            return text;
        },

        shoutAsynchronously: function(text) {
            return Promise.resolve(text);
        }

    };

    Server
        .create({port: self})
        .publishInterface('shoutService', shoutService);


});