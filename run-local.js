var secret = require('./secret');
Object.assign(process.env, secret.local);

// kick off server
require('./bin/www');
