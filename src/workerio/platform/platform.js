import BaseObject from './object';
import Evented from './evented';
import Promise from './deferred';

export default {
    Promise: Promise.Promise,
    ResolvedPromise: Promise.ResolvedPromise,
    Evented: Evented,
    Object: BaseObject
};

