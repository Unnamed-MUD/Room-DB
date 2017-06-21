var express = require('express');
var router = express.Router();
var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/test');
var Room = mongoose.model('Room',{
    "id": String,
	"title": String,
	"area": String,
	"light": Boolean,
	"content": String,
	"terrain": String,
	"outdoors": String,
	"waitMod": Number,
	"moveMod": Number,
	"exits": Array,
	"playersInRoom": Array,
	"monsters": Array,
	"items": Array,
	"itemType": String,
	"hasEvents": Boolean,
	"preventRecall": Boolean,
	"preventDecay": Boolean,
	"behaviors": Array
});

router.post('/save/room/:id/:title/:area/:light/:content/:terrain/:outdoors/:waitMod/:moveMod/:exits/:playersInRoom/:monsters/:items/:itemType/:hasEvents/:preventRecall/:preventDecay/:behaviors', function(req, res, next) {
    var newRoom = new Room({
        "id": req.params(id),
        "title": req.params(title),
        "area": req.params(area),
        "light": req.params(light),
        "content": req.params(content),
        "terrain": req.params(terrain),
        "outdoors": req.params(outdoors),
        "waitMod": req.params(waitMod),
        "moveMod": req.params(moveMod),
        "exits": req.params(exits),
        "playersInRoom": req.params(playersInroom),
        "monsters": req.params(monters),
        "items": req.params(items),
        "itemType": req.params(itemType),
        "hasEvents": req.params(hasEvents),
        "preventRecall": req.params(preventRecall),
        "preventDecay": req.params(preventDecay),
        "behaviors": req.params(behaviors)

    });
    newRoom.save(function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Saved!');
      }
    });
});

module.exports = router;
