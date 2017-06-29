# Room DB
Editor for the rooms database.

Run ```npm start``` to start server. Currently uses local connection to 'test' database.

### Tools
#### npm run dump
Dumps a copy of the database to ```tools/db/test```. Useful to share the testing database as the resulting files can be committed along with code.

#### npm run restore
Restores the copy of the database to the local mongo server. Do this after someone else updates the database files.
