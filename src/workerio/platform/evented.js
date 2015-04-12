var Evented = {

    on: function (name, callback = false) {
        if (!this.listeners) {
            this.listeners = {};
        }

        if (!this.listeners[name]) {
            this.listeners[name] = [];
        }

        var listener = {
            callback: callback,
            one: false
        };

        this.listeners[name].unshift(listener);
        return listener;
    },

    one: function (name, callback, timeout = false) {
        if (!this.listeners) {
            this.listeners = {};
        }

        if (!this.listeners[name]) {
            this.listeners[name] = [];
        }
        var listener = {
            callback: callback,
            one: true
        };

        this.listeners[name].unshift(listener);
        return listener;
    },

    un: function (listener) {
        if (!this.listeners) {
            this.listeners = {};
        }

        for (var key in this.listeners) {
            if (this.listeners.hasOwnProperty(key)) {
                var listeners = this.listeners[key];
                if (Array.isArray(listeners)) {
                    for (var i = 0; i < listeners.length; i++) {
                        if (listeners[i] === listener) {
                            listeners.splice(i, 1);
                        }
                    }
                }
            }
        }
    },

    trigger: function (name, ...params) {
        if (!this.listeners) {
            this.listeners = {};
        }

        if (Array.isArray(this.listeners[name])) {
            var listeners = this.listeners[name];
            for (var i = 0; i < listeners.length; i++) {
                var listener = listeners[i];
                if (listener.one) {
                    this.un(listener);
                }
                listener.callback.apply(listener.callback, params);
            }
        }
    }

};

export default Evented