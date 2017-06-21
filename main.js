var mongoose = require("mongoose");
mongoose.connect('mongodb://localhost/test');
var Room = mongoose.model({
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
})
