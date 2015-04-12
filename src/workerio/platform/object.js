// wrapper function to call be able call 'new' with given arguments
// http://stackoverflow.com/questions/1606797/use-of-apply-with-new-operator-is-this-possible'
function construct(constructor, args) {
    function WorkerIOObject() {
        return constructor.apply(this, args);
    }
    WorkerIOObject.prototype = constructor.prototype;
    return new WorkerIOObject();
}

var create = function () {
    var args = Array.prototype.slice.call(arguments);
    return construct(this, args);
};

var extend = function () {

    // create constructor for class
    var constructor = function () {
        for (var i = 0; i < arguments.length; i++) {
            var extension = arguments[i];

            if (! (extension instanceof Object)) {
                throw new Error('Only Objects could be passed to constryuctor');
            }

            for (var n in extension) {
                if (extension.hasOwnProperty(n)) {
                    this[n] = extension[n];
                }
            }
        }
        if (this.init) {
            if (typeof this.init === 'function') {
                this.init.apply(this, arguments);
            } else {
                throw new Error('init hook must be function');
            }
        }
    };

    // update prototype
    var superprototype = this.prototype;
    var prototype = Object.create(superprototype);
    for (var i = 0; i < arguments.length; i++) {
        var extension = arguments[i];
        for (var n in extension) {
            if (extension.hasOwnProperty(n)) {
                prototype[n] = extension[n];
            }
        }
    }

    constructor.superconstructor = this;
    constructor.superprototype = superprototype;
    constructor.prototype = prototype;
    constructor.prototype.constructor = prototype.constructor || constructor;
    constructor.extend = extend;
    constructor.create = create;

    return constructor;
};


var BaseObject = extend.apply(function(){});

export default BaseObject;