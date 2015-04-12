import Platform from './../platform/platform';

/**
 * Provide helper methods for builder
 *
 * @module workerio
 * @namespace workerio.builder
 * @class Helpers
 */

var Helpers = Platform.Object.extend({

    /**
     * Executes method on proxied object on server. Make
     * synchronous and asynchronous methods compatibile
     * returning Promise/A+ always
     *
     * @param {Object} ctx
     * @param {Function} impl
     * @param {Array}
     * @param {Function} callback
     * @return {workerio.platform.Promise}
     */
    executeImplementation: function(ctx, impl, args) {

        return new Platform.Promise(function(resolve) {
            var r = impl.apply(ctx, args);

            if (r && typeof r.then === 'function') {
                r.then(function(r) {
                    resolve(r);
                });
            } else {
                resolve(r);
            }
        });
    }


});

export default Helpers;