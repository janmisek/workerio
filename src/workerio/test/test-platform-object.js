/* global require, module, test, ok, equal, deepEqual, throws */
import Platform from './../platform/platform';

export default function () {

    module('platform object tests', {});

    test('constructor has extend method', function () {
        equal(typeof Platform.Object.extend, 'function');
    });

    test('constructor has create method', function () {
        equal(typeof Platform.Object.create, 'function');
    });

    test('constructor returns proper prototype', function () {
        var Extended = Platform.Object.extend();

        equal(typeof Extended.extend, 'function');
        equal(Extended.superconstructor, Platform.Object);
        equal(Extended.superprototype, Platform.Object.prototype);

        var ExtraExtended = Extended.extend();
        equal(typeof ExtraExtended.extend, 'function');
        equal(ExtraExtended.superconstructor, Extended);
        equal(ExtraExtended.superprototype, Extended.prototype);
    });

    test('arguments are passed to child objects', function () {
        var Extended = Platform.Object.extend();

        throws(function () {
            // only objects to be passed
            Platform.Object.extend().create('Hello');
        });

        ok(Platform.Object.extend().create(), 'without parameters');

        ok(Platform.Object.extend().create({value: 1}), 'with parameters');

        var o = Platform.Object.extend().create({value: 1});
        equal(o.value, 1);

    });

    test('object extend should work', function () {
        var GrandFather = Platform.Object.extend({
            surname: 'Zdedeny',
            firstname: function () {
                return 'Jindra';
            },
            fullname: function () {
                return this.firstname() + ' ' + this.surname;
            }
        });

        var Mother = Platform.Object.extend();

        var Father = GrandFather.extend({
            firstname: function () {
                return 'Michal';
            }
        });

        var Son = Father.extend({
            firstname: function () {
                return 'Peter';
            }
        });

        var jindra = GrandFather.create();
        var michal = Father.create();
        var peter = Son.create();

        // check for instance of
        ok(jindra instanceof GrandFather);
        ok(michal instanceof Father);

        ok(peter instanceof GrandFather);
        ok(peter instanceof Father);
        ok(peter instanceof Son);

        ok(!(peter instanceof Mother));

        // check for methods inheritance
        equal(jindra.firstname(), 'Jindra');
        equal(michal.firstname(), 'Michal');
        equal(peter.firstname(), 'Peter');

        equal(jindra.fullname(), 'Jindra Zdedeny');
        equal(michal.fullname(), 'Michal Zdedeny');
        equal(peter.fullname(), 'Peter Zdedeny');

    });

    test('init hook does work', function () {
        var Extended;

        Extended = Platform.Object.extend({
            init: function () {
                this.value = 1;
            }
        });

        equal(Extended.create().value, 1);

        Extended = Platform.Object.extend({
            init: 'something'
        });

        throws(function () {
            Extended.create();
        });

    });


}


