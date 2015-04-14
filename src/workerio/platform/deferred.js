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
    AllPromises: Promise.all.bind(Promise),
    ResolvedPromise: Promise.resolve.bind(Promise),
    HashedPromises: HashedPromises
};

