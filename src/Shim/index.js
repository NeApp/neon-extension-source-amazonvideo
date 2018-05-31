/* eslint-disable no-console, no-new */
import EventEmitter from 'eventemitter3';
import IsNil from 'lodash-es/isNil';

import {ConfigurationResource} from './Resources';


export class ShimRequests extends EventEmitter {
    constructor() {
        super();

        // Ensure body exists
        if(IsNil(document.body)) {
            throw new Error('Body is not available');
        }

        // Bind to events
        this._bind('neon.request', (e) => this._onRequest(e));
    }

    _bind(event, callback) {
        try {
            document.body.addEventListener(event, callback);
        } catch(e) {
            console.error('Unable to bind to "%s"', event, e);
            return false;
        }

        console.debug('Bound to "%s"', event);
        return true;
    }

    _onRequest(e) {
        if(!e || !e.detail) {
            console.error('Invalid request received:', e);
            return;
        }

        // Decode request
        let request;

        try {
            request = JSON.parse(e.detail);
        } catch(err) {
            console.error('Unable to decode request: %s', err && err.message, err);
            return;
        }

        // Emit request
        this.emit(request.type, ...request.args);
    }
}

export class Shim {
    constructor() {
        this.requests = new ShimRequests();

        // Construct resources
        this.resources = {
            configuration: new ConfigurationResource(this)
        };
    }
}

// Construct shim
(new Shim());
