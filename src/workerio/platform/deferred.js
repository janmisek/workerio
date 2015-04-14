var ResolvedPromise = function () {
    var args = arguments;
    return new Promise(function (resolve) {
        resolve.apply(resolve, args);
    });
};

var HashedPromises = function (object) {
    var promises = [];
    var keys = [];
    for (var key in object) {
        if (object.hasOwnProperty(key)) {
            promises.push(object[key]);
            keys.push(key);
        }
    }
    return Promise
        .all(promises)
        .then(function (results) {
            for (var i = 0; i < results.length; i++) {
                var result = results[i];
                object[keys[i]] = results[i];
            }
            return object;
        });
};

export default {
    Promise: Promise,
    HashedPromises: HashedPromises,
    ResolvedPromise: ResolvedPromise
};

