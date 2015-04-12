var ResolvedPromise = function () {
    var args = arguments;
    return new Promise(function (resolve) {
        resolve.apply(resolve, args);
    });
};

export default {
    Promise: Promise,
    ResolvedPromise: ResolvedPromise
};

