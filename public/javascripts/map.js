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

var roomSize = 30;

var goalDistance = 80;
var safeDistance = 80;

function Start () {
  ctx = document.getElementById('canvas').getContext('2d');
  ctx.translate(0.5, 0.5);
  ctx.font="15px Georgia";
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
          console.log(e);
      }
  });

  $('#canvas').click(HandleMapClick);
}

function LoadInRooms () {
  // preRoomsList.forEach(function(room) {
  //     SetupRoom(room);
  // });
  var first = FindRoom(startRoomID, preRoomsList);
  SetupRoom(first);
  Teleport(first, width/2, height/2);
  SpawnIn(first);
  LoadExitRooms(first, 1);
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

  var oneWayExits = FindRoomTargets(room._id, preRoomsList);
  for(i = 0; i < oneWayExits.length; i++) {
  //  var exit = oneWayExits[i];
    var nextRoom = oneWayExits[i];
    console.log('checking up on ' + nextRoom.title);
    if(nextRoom != null) {
      SetupRoom(nextRoom);
      PlaceByCommandReverse(room, nextRoom, exit.cmd); // this is reversed
      SpawnIn(nextRoom);
      LoadExitRooms(nextRoom, depth-1);
    }
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
  }
}

function PlaceByCommandReverse (room, nextRoom, command) {
  if(command == 'west') {
    Teleport(nextRoom, room.x + goalDistance, room.y);
  } else if(command == 'east') {
    Teleport(nextRoom, room.x - goalDistance, room.y);
  } else if(command == 'south') {
    Teleport(nextRoom, room.x, room.y - goalDistance);
  } else if(command == 'north') {
    Teleport(nextRoom, room.x, room.y + goalDistance);
  }
}

function draw() {
  ctx.fillStyle = 'rgb(240, 240, 255)';
  ctx.strokeStyle = 'rgba(0, 153, 255, 0.4)';
  ctx.fillRect(0,0, width, height);

  RepulseRooms();

  mapRoomsList.forEach(function(room) {
    DrawRoomBox(room);
  });
  mapRoomsList.forEach(function(room) {
    UpdateRoom(room);
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
  ctx.strokeStyle = 'rgb(0,0,0)';
  if(room._id == startRoomID) {
    ctx.lineWidth = 2;
    ctx.fillStyle='rgb(245,220,255)';
  } else {
    ctx.lineWidth = 1;
    ctx.fillStyle='rgb(255,255,255)';
  }
  ctx.fillRect(room.x- roomSize/2,  room.y -roomSize/2, roomSize, roomSize);
  ctx.strokeRect(room.x- roomSize/2,  room.y -roomSize/2, roomSize, roomSize);
}

function UpdateRoom (room) {
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgb(0, 0, 0)';
  room.x += (Math.random() - 0.5) * 0.05;
  room.y += (Math.random() - 0.5) * 0.05;

  room.exits.forEach(function(exit) {
    target = FindRoom(exit.room, mapRoomsList);
    if(target){
      var dis = Distance(room, target);
      var change = (goalDistance -dis) * 0.01;
      var angle = AngleTo(target, room);
      Move (room, angle, change * 0.5);
      Move (target, angle, change * -0.5);

      if(ExitInRoom(room._id, target)) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgb(0,0,0)';
      } else {
        ctx.strokeStyle = 'rgb(100,0,0)';
        ctx.lineWidth= 1;
      }
      DrawLine(room.x, room.y, target.x, target.y);

    }
  });

  var tempX = room.x;
  var tempY = room.y;
  room.x += (room.x - room.dx)*0.95;
  room.y += (room.y - room.dy)*0.95;
  room.dx = tempX;
  room.dy = tempY;

  ctx.fillStyle='rgb(255,255,255)';
  ctx.fillText(room.title,room.x +2,room.y -25+1);
  ctx.fillStyle='rgb(0,0,0)';
  ctx.fillText(room.title,room.x,room.y -25);

  room.x = Math.max(25, Math.min(width - 25, room.x));
  room.y = Math.max(25, Math.min(height -25, room.y));
}

function HandleMapClick(e){
  var x = e.clientX, y = e.clientY;
  ctx.fillStyle = 'rgb(0, 255, 0)';
  ctx.fillRect(x,y,100,100);
  x -= $(this)[0].getBoundingClientRect().left;
  y -= $(this)[0].getBoundingClientRect().top;
  console.log(x + ' ' + y);
  var roomSide = roomSize / 2.0;
  for(var i =0 ; i < mapRoomsList.length; i++){
    var room = mapRoomsList[i];
    console.log(x + ' ' + room.x);
    if(x < room.x + roomSide && x > room.x -roomSide) {
      if(y < room.y + roomSide && y > room.y -roomSide) {
        console.log('hit! ' + room.title);
        window.location = '/map/' + room._id;
        return;
      }
    }
  }
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
  //  console.log(exit.room + " " + id + ((exit.room == id) ? ' TRUEEEEEE' : ''));
    if(exit.room == id) {
      return true;
    }
  }
  return false;
}
