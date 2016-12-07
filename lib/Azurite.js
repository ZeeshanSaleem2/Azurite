'use strict';

const BbPromise = require('bluebird'),
    express = require('express'),
    bodyParser = require('body-parser'),
    path = require('path'),
    env = require('./env'),
    storageManager = require('./StorageManager'),
    fs = BbPromise.promisifyAll(require("fs"));

// Global Bluebird Config
BbPromise.onPossiblyUnhandledRejection((err) => {
    console.log('PANIC: Emulator may be in an inconsistent state!');
    process.stderr.write(err.stack);
    process.abort();
});
BbPromise.longStackTraces();

class Azurite {
    constructor() {
        this._version = require('./../package.json').version;
    }

    init(options) {
        env.localStoragePath = options.l || options.location || './';
        env.port = options.p || options.port || 10000;
        return storageManager.init(env.localStoragePath)
            .then(() => {
                let app = express();
                app.use((req, res, next) => {
                    // TODO: Log sensible information about the request
                    next();
                });
                app.use(bodyParser.raw());
                require('./routes/AccountRoute')(app);
                require('./routes/ContainerRoute')(app);
                require('./routes/BlobRoute')(app);
                app.listen(env.port, () => {
                    console.log('Azurite is listening on port 10000!');
                    console.log(`Version ${this._version}`);
                });
            });
    }
}

module.exports = Azurite;