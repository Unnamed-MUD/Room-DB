var secret = require('./secret');
Object.assign(process.env, secret.remote);
console.log("RUNNING WITH REMOTE DATABASE")
// kick off server
require('./bin/www');
