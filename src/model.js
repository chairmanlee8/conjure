'use strict';

import Cache from './cache';

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
    constructor () {
        this.$loaded = false;
        Cache.get(this);
    }

    /**
     * This method communicates with the remote server and performs the API calls necessary to get the data.
     */
    static loadFromRemote (...models) {
        return false;
    }

    isLoaded () {
        return this.$loaded;
    }

    /**
     * Method called after data is received from the remote server (or cache).
     */
    onLoad () {
        this.$loaded = true;
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
