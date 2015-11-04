// shoutService is object we want to have proxied on client
var shoutService = {

    shout: function (name) {
        return 'Hello ' + name;
    },

    pssst: function() {
        return Promise.resolve('now it is silence here :)');
    },

};

// import workerio
importScripts('workerio/build/workerio.js');

// lets publish shoutService to client
self.workerio
    .publishInterface(self, 'shoutService', shoutService);
