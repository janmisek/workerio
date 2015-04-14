import BaseObject from './object';
import Evented from './evented';
import Promise from './deferred';

export default {
    Promise: Promise.Promise,
    ResolvedPromise: Promise.ResolvedPromise,
    AllPromises: Promise.all,
    HashedPromises: Promise.HashedPromises,
    Evented: Evented,
    Object: BaseObject
};

