var express = require('express');

var router = express.Router();

var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/test');

var Room = mongoose.model('Room',{
	"title": String,
	"area": String,
	 "light": Boolean,
	 "content": String,
	 "outdoors": Boolean,
	 "waitMod": {
		 type: Number,
		 default: 0
	 },
	 "moveMod": {
		 type: Number,
		 default: 0
	 },
	 "exits": [{
		 "cmd": {type:String}
	 }],
	// "monsters": [String],
	 "items": [String]
	// "hasEvents": Boolean,
	// "preventRecall": Boolean,
	// "preventDecay": Boolean
});


router.get('/rooms', function (req, res, next) {
  Room.find().sort('area').exec(function (err, rooms) {
   res.render('rooms', {
		 rooms:rooms,
		 sortedRooms:sortIntoAreas(rooms),

	 });
  });
});

router.get('/rooms/new', function (req, res, next) {
  Room.find().distinct('area', function (err, areas) {
    res.render('new-room', {areas:areas});
  });
});

router.get('/rooms/:id', function (req, res, next) {
	Room.findOne({'_id': req.params.id}, function (err, room){
		if(room == null) {
			return res.redirect('/rooms');
		}
		res.render('room', {room:room});
	});
});

router.get('/rooms/:id/json', function (req, res, next) {
	Room.findOne({'_id': req.params.id}, function (err, room){
		if(room == null) {
			return res.redirect('/rooms');
		}
		res.send(room);
	});
});

router.delete('/rooms/:id', function (req, res, next) {
	Room.findByIdAndRemove(req.params.id, function (err, room) {
		if(err) {
			res.status(500).end(err.message);
		} else {
			res.send("Removed room " + room._id);
		}
	});
});

router.post('/rooms', function(req, res, next) {
  // mongoose filters input to match schema by default
  // we can just push the json in the body into the model :)
  var newRoom = new Room(req.body);

  newRoom.save(function (err) {
    if (err) {
      console.log(err);
      res.statusCode = 500;
      res.statusMessage = "Problem with room creation??";
      res.end();
    } else {
      res.end("thanks for the room");
    }
  });
});

function sortIntoAreas (rooms) {
	var output = {};
	for(var i = 0; i < rooms.length; i++) {
		if(output[rooms[i].area] == null) {
			output[rooms[i].area] = [];
			output[rooms[i].area].push(rooms[i]);
		} else {
			output[rooms[i].area].push(rooms[i]);
		}
	}
	return output;
}

module.exports = router;
