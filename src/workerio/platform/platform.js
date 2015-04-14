import BaseObject from './object';
import Evented from './evented';
import Deffered from './deferred';

export default {
    Promise: Promise,
    ResolvedPromise: Deffered.ResolvedPromise,
    AllPromises: Deffered.AllPromises,
    HashedPromises: Deffered.HashedPromises,
    Evented: Evented,
    Object: BaseObject
};

