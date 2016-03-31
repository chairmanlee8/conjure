'use strict';

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
    constructor (id) {
        this.$loaded = false;
        this.$schema = null;
        this.id = id;
    }

    static getRemoteUrl (...models) {

    }

    isLoaded () {
        return this.$loaded;
    }

    onLoad (json) {

    }

    get id () { return this.id; }
    set id (value) { this.id = value; }
}
