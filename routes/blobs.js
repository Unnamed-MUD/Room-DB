var express = require('express');
var router = express.Router();

var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/test');

/**
*** TEST TYPE "blobs" to prove out saving loading from DB
**/

var Blob = mongoose.model('blob',{
  "name": String
});

router.get('/blobs', function (req, res, next) {
  Blob.find(function (err, blobs) {
    res.send(blobs);
  })
});

router.post('/blobs/:name', function(req, res, next) {
  res.send('Making a new blob called ' + req.params.name);

  var newBlob = new Blob({
    'name': req.params.name
  });

  newBlob.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Saved!');
    }
  });
});

module.exports = router;
