$(Start);

var sun = new Image();
var moon = new Image();
var earth = new Image();

var preRoomsList = [];
var mapRoomsList = [];

var ctx;

var startRoomID; // string of ID of root room

var width = 400;
var height = 600;

var roomSize = 40;

var goalDistance = 100;
var safeDistance = 60;

var hoverRoom = null;

hashCode = function(s){
  s += "d";
  return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
}

function colorFromArea (s) {
  var result = "" + hashCode(s);
  var r = (150 + parseInt(result.substring(0,2)));
  var g = (150 + parseInt(result.substring(2,4)));
  var b = (150 + parseInt(result.substring(4,6)));
  return "rgb(" +  r +"," + g +"," + b +")";
}

function Start () {
  ctx = document.getElementById('canvas').getContext('2d');
  ctx.translate(0.5, 0.5);
  ctx.font="14px sans-serif";
  ctx.textAlign='center';
  ctx.baseline='middle';

  draw();

  startRoomID = $('#start-room').attr('room-id');

  $.ajax({
      url:'/rooms/json',
      type:"GET",
      dataType:"json",
      success: function(data){
          preRoomsList = data;
          LoadInRooms ();
      },
      error: function (e) {
          //console.log(e);
      }
  });

  $('#canvas').click(HandleMapClick);
  $( "#canvas" ).mousemove(HandleMouseMove);
}

function LoadInRooms () {
  // preRoomsList.forEach(function(room) {
  //     SetupRoom(room);
  // });
  var first = FindRoom(startRoomID, preRoomsList);
  SetupRoom(first);
  Teleport(first, width/2, height/2);
  SpawnIn(first);
  LoadExitRooms(first, 3);

 // run 60 physics steps in a row before we start rendering
 // let the thing setttle
  for(var i = 0; i < 0; i++) {
    mapRoomsList.forEach(function(room) {
      UpdateRoom(room);
    });
  }
}

function LoadExitRooms (room, depth) {
  if(depth < 0) return;
  for(var i = 0; i < room.exits.length; i++) {
    var exit = room.exits[i];
    var nextRoom = FindRoom(exit.room, preRoomsList);
    if(nextRoom != null) {
      SetupRoom(nextRoom);
      PlaceByCommand(room, nextRoom, exit.cmd);
      SpawnIn(nextRoom);
      LoadExitRooms(nextRoom, depth-1);
    }
  }

  // find all the rooms that target this one that we didnt target
  // for one way rooms
  var oneWayExits = FindRoomTargets(room._id, preRoomsList);
  for(i = 0; i < oneWayExits.length; i++) {
    var nextRoom = oneWayExits[i];
    SetupRoom(nextRoom);
    PlaceByCommandReverse(room, nextRoom); // this is reversed
    SpawnIn(nextRoom);
    LoadExitRooms(nextRoom, depth-1);
  }
}

function PlaceByCommand (room, nextRoom, command) {

  if(command == 'west') {
    Teleport(nextRoom, room.x - goalDistance, room.y);
  } else if(command == 'east') {
    Teleport(nextRoom, room.x + goalDistance, room.y);
  } else if(command == 'south') {
    Teleport(nextRoom, room.x, room.y + goalDistance);
  } else if(command == 'north') {
    Teleport(nextRoom, room.x, room.y - goalDistance);
  } else if(command == 'up') {
    Teleport(nextRoom, room.x - goalDistance* 0.6, room.y - goalDistance* 0.6);
  } else if(command == 'down') {
    Teleport(nextRoom, room.x + goalDistance* 0.6, room.y + goalDistance* 0.6);
  } else {
    Teleport(nextRoom, room.x + goalDistance* 0.6, room.y + goalDistance* 0.6);
  }
}

function PlaceByCommandReverse (room, nextRoom) {
  var command = '';
  for(var i =0; i < nextRoom.exits.length; i++) {
    var exit = nextRoom.exits[i];
    if(exit.room == room._id) {
      command = exit.cmd;
    }
  }

  if(command == 'west') {
    Teleport(nextRoom, room.x + goalDistance, room.y);
  } else if(command == 'east') {
    Teleport(nextRoom, room.x - goalDistance, room.y);
  } else if(command == 'south') {
    Teleport(nextRoom, room.x, room.y - goalDistance);
  } else if(command == 'north') {
    Teleport(nextRoom, room.x, room.y + goalDistance);
  } else if(command == 'up') {
    Teleport(nextRoom, room.x + goalDistance* 0.6, room.y + goalDistance * 0.6);
  } else if(command == 'down') {
    Teleport(nextRoom, room.x - goalDistance* 0.6, room.y - goalDistance * 0.6);
  }else {
    Teleport(nextRoom, room.x - goalDistance* 0.6, room.y - goalDistance* 0.6);
  }
}

function draw() {

  ctx.fillStyle = 'rgb(245, 245, 245)';
  ctx.strokeStyle = 'rgba(0, 153, 255, 0.4)';
  ctx.fillRect(-width ,-height, width*2, height*2);

  RepulseRooms();


  mapRoomsList.forEach(function(room) {
    UpdateRoom(room);
  });
  mapRoomsList.forEach(function(room) {
    DrawRoomBox(room);
  });
  mapRoomsList.forEach(function(room) {
    DrawRoom(room);
  });
  mapRoomsList.forEach(function(room) {
    DrawRoomTitle(room);
  });


  //  ctx.fillRect(100,199 ,30, 30);
  window.requestAnimationFrame(draw);
}

function SetupRoom (room) {
  room.x = Math.random() * 200 + width / 2 - 100;
  room.y = Math.random() * 200 + width / 2 - 100;
  room.dx = room.x;
  room.dy = room.y;

}

function DrawRoomBox (room) {
  ctx.strokeStyle = 'rgb(100,100,100)';
   if(room._id == startRoomID) {
     ctx.lineWidth = 2;
       ctx.strokeStyle = 'rgb(0,0,0)';
  } else {
    ctx.lineWidth = 1;
  }
  ctx.fillStyle = colorFromArea(room.area);
  if(hoverRoom != null && room._id == hoverRoom._id) {
    ctx.lineWidth = 6;
  }
  ctx.fillRect(room.x- roomSize/2,  room.y -roomSize/2, roomSize, roomSize);
  ctx.strokeRect(room.x- roomSize/2,  room.y -roomSize/2, roomSize, roomSize);

  if(room.items && room.items.length > 0) {
    ctx.fillStyle = ('rgb(50, 50, 255)');
    ctx.beginPath();
    ctx.arc(room.x+10, room.y+10, 6, 0, Math.PI * 2, true);
    ctx.fill();
  }
  if(room.monsters && room.monsters.length > 0) {
    ctx.fillStyle = ('rgb(255, 50, 50)');
    ctx.beginPath();
    ctx.arc(room.x-10, room.y-10, 6, 0, Math.PI * 2, true);
    ctx.fill();
  }
}

function DrawRoomTitle (room) {
    ctx.fillStyle='rgb(255,255,255)';
    ctx.fillText(room.title,room.x +2,room.y -25+1, 100);
    ctx.fillText(room.title,room.x -2,room.y -25, 100);
    ctx.fillStyle='rgb(0,0,0)';
    ctx.fillText(room.title,room.x,room.y -25, 100);
}

function DrawRoom (room) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgb(0, 0, 0)';
  room.x += (Math.random() - 0.5) * 0.01;
  room.y += (Math.random() - 0.5) * 0.01;

  room.exits.forEach(function(exit) {
    target = FindRoom(exit.room, mapRoomsList);
    if(target){
      if(ExitInRoom(room._id, target)) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgb(0,0,0)';
        DrawLine(room.x, room.y, target.x, target.y);
      } else {
        ctx.strokeStyle = 'rgb(100,0,0)';
        ctx.lineWidth= 2;
        DrawArrow(room.x, room.y, target.x, target.y);
      }
    }
  });
}

function UpdateRoom (room) {
  room.x += (Math.random() - 0.5) * 0.01;
  room.y += (Math.random() - 0.5) * 0.01;

  room.exits.forEach(function(exit) {
    target = FindRoom(exit.room, mapRoomsList);
    if(target){
      var dis = Distance(room, target);
      var change = (goalDistance -dis) * 0.01;
      var angle = AngleTo(target, room);
      Move (room, angle, change * 0.5);
      Move (target, angle, change * -0.5);
    }
  });

  var tempX = room.x;
  var tempY = room.y;
  room.x += (room.x - room.dx)*0.97;
  room.y += (room.y - room.dy)*0.97;
  room.dx = tempX;
  room.dy = tempY;

  // room.x = Math.max(25, Math.min(width - 25, room.x));
  // room.y = Math.max(25, Math.min(height -25, room.y));
}

function HandleMapClick(e){
  var x = e.clientX, y = e.clientY;
  ctx.fillStyle = 'rgb(0, 255, 0)';
  ctx.fillRect(x,y,100,100);
  x -= $(this)[0].getBoundingClientRect().left;
  y -= $(this)[0].getBoundingClientRect().top;

  var roomSide = roomSize / 2.0;
  for(var i =0 ; i < mapRoomsList.length; i++){
    var room = mapRoomsList[i];
    if(x < room.x + roomSide && x > room.x -roomSide) {
      if(y < room.y + roomSide && y > room.y -roomSide) {
        window.location = '/map/' + room._id;
        return;
      }
    }
  }
}

function HandleMouseMove(e){
  var x = e.clientX, y = e.clientY;
  x -= $(this)[0].getBoundingClientRect().left;
  y -= $(this)[0].getBoundingClientRect().top;

  var roomSide = roomSize / 2.0;
  for(var i =0 ; i < mapRoomsList.length; i++){
    var room = mapRoomsList[i];
    if(x < room.x + roomSide && x > room.x -roomSide) {
      if(y < room.y + roomSide && y > room.y -roomSide) {

        hoverRoom = room;
        $('body').css('cursor', 'pointer');
        return;
      }
    }
  }
  $('body').css('cursor', 'default');
  hoverRoom = null;
}

function RepulseRooms () {
  for(var i = 0; i < mapRoomsList.length; i++ ){
    var room1 = mapRoomsList[i];
    for(var k = 0; k < mapRoomsList.length; k++ ){
      var room2 = mapRoomsList[k];
      if(room1 != room2) {
        var dis = Distance(room1, room2);
        if(dis < safeDistance) {
          var change = (safeDistance -dis) * 0.002;
          var angle = AngleTo(room2, room1);
          Move (room1, angle, change * 0.5);
          Move (room2, angle, change * -0.5);
        }
      }
    }
  }
}


function FindRoom(id, list) {
  for(var i =0 ; i < list.length; i++){
    if(list[i]._id == id) {
      return list[i];
    }
  }
  return null;
}

function FindRoomTargets(id, list) {
  var results = [];
  for(var i =0 ; i < list.length; i++){
    var room = list[i];
      for(var k =0 ; k < room.exits.length; k++){
        var exit = room.exits[k];
        if(exit.room == id) {
          results.push( list[i]);
        }
      }
  }
  return results;
}

function DrawLine (x,y, gx,gy){
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(gx, gy);
  ctx.stroke();
}

function DrawArrow (x,y, gx, gy) {
  var angle = Math.atan2(gy -y, gx -x);
  DrawLine(x,y,gx,gy);

  angle += 0.3;
  DrawLine(Math.cos(angle) * -30 + gx, Math.sin(angle) * -30 + gy, gx, gy);
  angle -= 0.6;
  DrawLine(Math.cos(angle) * -30 + gx, Math.sin(angle) * -30 + gy, gx, gy);
}

function Distance(room, room2) {
  var a = room.x - room2.x;
  var b = room.y - room2.y;
  return Pyth(a,b);
}

function Pyth(a, b) {
  return Math.sqrt(Math.pow(a,2) + Math.pow(b,2));
}

function AngleTo(room1, room2) {
  return Math.atan2(room2.y - room1.y, room2.x-room1.x);
}

function Move(room, angle, distance) {
  room.x += Math.cos(angle) * distance;
  room.y += Math.sin(angle) * distance;
}

function Teleport (room, x,y) {
  room.x = room.dx = x;
  room.y = room.dy = y;
}

function SpawnIn (room) {
  mapRoomsList.push(room);
  preRoomsList.splice(preRoomsList.indexOf(room), 1);
}

function ExitInRoom (id, room) {
  for(var i = 0; i < room.exits.length; i++) {
    var exit = room.exits[i];
    if(exit.room == id) {
      return true;
    }
  }
  return false;
}
