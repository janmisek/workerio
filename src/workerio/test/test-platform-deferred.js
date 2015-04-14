/* global require, module, test, ok, equal, deepEqual, throws */
import Platform from './../platform/platform';

export default function () {

    module('platform deferred / extended promise A+ tests', {});

    test('promise all has should work', function () {
        var Extended = Platform.Object.extend();

        return Platform.AllPromises([Platform.ResolvedPromise(0), Platform.ResolvedPromise(1)]).then(function (results) {
            equal(results[0], 0);
            equal(results[1], 1);
        });

    });

    test('promise hash has should work', function () {
        var Extended = Platform.Object.extend();

        return Platform.HashedPromises({zero: Platform.ResolvedPromise(0), one: Platform.ResolvedPromise(1), 2: Platform.ResolvedPromise(2) }).then(function (results) {
            equal(results.zero, 0);
            equal(results.one, 1);
            equal(results[2], 2);
        });

    });



}


