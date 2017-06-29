var express = require('express');

var router = express.Router();

var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/test');



var Room = mongoose.model('Room',{
	"title": String,
	"area": String,
	"content": String,
	"light": {type:Boolean, default:true},
	"outdoors": {type:Boolean, default:false},
	//  "waitMod": {
	// 	 type: Number,
	// 	 default: 0
	//  },
	//  "moveMod": {
	// 	 type: Number,
	// 	 default: 0
	//  },
	"exits": [{
		"cmd": {type:String, trim:true}
	}],
	// "monsters": [String],
	"items": [{type:String, trim: true}]
});


router.get('/rooms', function (req, res, next) {
  Room.find().sort('area').exec(function (err, rooms) {
   res.render('rooms', {
		 rooms:rooms,
		 sortedRooms:sortIntoAreas(rooms),
	 });
  });
});

// NEW ROOM
router.get('/rooms/new', function (req, res, next) {
  Room.find().distinct('area', function (err, areas) {
		// use the editor template, but dont have a room subobject passed in
    res.render('room-editor', {areas:areas});
  });
});

// LIST ROOMs
router.get('/rooms/:id', function (req, res, next) {
	Room.findOne({'_id': req.params.id}, function (err, room){
		if(room == null) {
			return res.redirect('/rooms');
		}
		res.render('room', {room:room});
	});
});

// EDIT ROOM
router.get('/rooms/:id/edit', function (req, res, next) {
  Room.find().distinct('area', function (err, areas) {
		Room.findOne({'_id': req.params.id}, function (err, room){
			if(room == null) {
				return res.redirect('/rooms');
			}
	    res.render('room-editor', {areas:areas, room:room});
		});
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

  newRoom.save(function (err, room) {
    if (err) {
      console.log(err);
      res.statusCode = 500;
      res.statusMessage = "Problem with room creation??";
			res.send({message:"Something went wrong guys: " + err.message});
    } else {
      res.send({room:room, _id: room._id});
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
