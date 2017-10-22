var express = require('express');

var router = express.Router();

var mongoose = require("mongoose");
var schema = mongoose.Schema;

// construct URL,
var baseURL = 'mongodb://';
if(process.env.DB_USER){
	// local DB doesn't need use pass so we skip if undefined
	baseURL += process.env.DB_USER + ':' + process.env.DB_PASS + '@';
}
baseURL += process.env.DB_HOST;

mongoose.connect(baseURL);

function cleanFields(room) {
	if (room.waitMod < 1) {
		delete room.waitMod;
	}
	if (room.moveMod < 1){
		delete room.moveMod;
	}
}



var Room = mongoose.model('Room',{
	"title": String,
	"area": String,
	"content": String,
	"light": {type:Boolean, default:true},
	"outdoors": {type:Boolean, default:false},
	"preventDecay": {type:Boolean,default:false},
	"preventRecall": {type:Boolean,default:false},
	"waitMod":{type:Number},
	"moveMod":{type:Number},
	//  "waitMod": {
	// 	 type: Number,
	// 	 default: 0
	//  },
	//  "moveMod": {
	// 	 type: Number,
	// 	 default: 0
	//  },
	"exits": [{
		"cmd": {type:String, trim:true},
		"room": {type: schema.Types.ObjectId, ref: 'Room'}
	}],
	// "monsters": [String],
	"items": [{type:String, trim: true}],
	"monsters": [{type:String, trim: true}]
});


router.get('/map', function (req, res, next) {
	// redirect to town square map
	res.redirect('/map/59550bdb460b5eb24709fee6');
});

router.get('/map/:id', function (req, res, next) {
  Room.find().distinct('area', function (err, areas) {
		Room.findOne({'_id': req.params.id}).populate('exits.room').exec(function (err, room){
			res.render('map', {room:room, areas: areas});
		});
	});
});

router.get('/rooms', function (req, res, next) {
  Room.find().sort('area').exec(function (err, rooms) {
   res.render('rooms', {
		 rooms:rooms,
		 sortedRooms:sortIntoAreas(rooms),
	 });
  });
});

router.get('/rooms/json', function (req, res, next) {
  Room.find().sort('area').exec(function (err, rooms) {
   res.send(rooms);
  });
});

// NEW ROOM
router.get('/rooms/new', function (req, res, next) {
  Room.find().distinct('area', function (err, areas) {
		// use the editor template, but dont have a room subobject passed in
    res.render('room-editor-wrapper', {areas:areas});
  });
});

// EDIT ROOM
router.get('/rooms/:id', function (req, res, next) {
  Room.find().distinct('area', function (err, areas) {
		Room.findOne({'_id': req.params.id}).populate('exits.room').exec(function (err, room){
			console.log(err);
			console.log(room);
			if(room == null) {
				return res.redirect('/rooms');
			}
	    res.render('room-editor-wrapper', {areas:areas, room:	room});
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
			RemoveLinks(room._id, function () {
				res.send("Removed room " + room._id);
			})
		}
	});
});
//Create new room.
router.post('/rooms', function(req, res, next) {
  // mongoose filters input to match schema by default
  // we can just push the json in the body into the model :)
  cleanFields(req.body);
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
//Update room.
router.post('/rooms/:id',function(req,res,next){
	cleanFields(req.body);
	Room.update({ _id: req.params.id }, { $set: req.body }, function(err, room) {
		if (err) {
			res.statusCode = 500;
			res.send(err.message);
		}else {
			res.send({mesage:"Inserted room!", room:room});
		}

	});
});

// remove all exits to an room id, cleanup needed after removing a room
function RemoveLinks (id, callback) {
	Room.find({exits:{$elemMatch: {room: id}}}, function (err, rooms) {
		for(var i=0; i < rooms.length; i++) {
			var room = rooms[i];
			for (var k = room.exits.length-1; k >=0; k--) {
				if(room.exits[k].room.toString() == id.toString()) {
					room.exits.splice(k, 1);
				}
			}
			room.save();
		}
		callback();
	});
}

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
