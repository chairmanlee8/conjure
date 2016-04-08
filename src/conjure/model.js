'use strict';

import Cache from './cache';
import { copyAll } from './utils';

/**
 * There are two ways to use Models. One is to use them as stateless references, that is to say, whenever you need
 * a model just instantiate a new one.
 *
 * The other method is to pretend as though they are stateful, and create them once and reuse them as objects. You can
 * use the `invalidate` method if you want your state to resync with the remote. This is useful if you have some sort
 * of operation where the user can edit model fields, and you want to submit the changes later.
 *
 * Is there any use case for automatic invalidation?
 */

export default class Model {
    /**
     * For subclasses, call super() with a function argument, which will provide the this argument.
     * This is due primarily to the no-this-before-super rule for derived classes in ES6.
     */
    constructor (fn) {
        this.$local = false;
        if (fn) { fn(this) }
        this.$loaded = false;
        Cache.get(this);
    }

    setLocal (v) {
        this.$local = v;
    }

    /**
     * This method communicates with the remote server and performs the API calls necessary to get the data.
     * It should call onLoad on each model. The mapFromArray function from utils will be very useful.
     */
    static loadFromRemote (...models) {
        return false;
    }

    isLoaded () {
        return this.$loaded;
    }

    // TODO: perpetual is actually useless since it includes every cache hit...better to do remotes only?
    afterLoad (perpetual=false) {
        return new Promise((resolve, reject) => {
            if (this.$loaded || this.$local) {
                resolve(this);
            }

            if (!(this.$loaded || this.$local) || perpetual) {
                Cache.waitFor(this, () => {
                    resolve(this);
                    return perpetual;
                });
                Cache.get(this);
            }
            // TODO: what is timeout?
        });
    }

    /**
     * Method called after data is received from the remote server.
     * Subclasses should, like the constructor, call super() last.
     */
    fromRemote (data) {
        this.$loaded = true;
        Cache.set(this, data);
    }

    fromCache (data) {
        copyAll(this, data);
    }

    invalidate () {
        this.$loaded = false;
        Cache.invalidate(this);
        Cache.get(this);
    }

    /**
     * Get the UUID for this model. For most applications this should equal/correspond to the schema + primary key of
     * the database object. Returning `false` implies that this model instance is not uniquely identifiable and
     * therefore uncacheable!
     */
    get uuid () {
        return false;
    }
}
