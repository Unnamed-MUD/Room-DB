$(function () {
    $('#area-selector').change(function () {
        var pickedArea = $(this).find('option:selected').text();
        $('input[name=area]').val(pickedArea);
    });

    $('input[name=items]').bind('change', function () {
        var newString = forceSlug($(this).val());
        $(this).val(newString);
    });

    $('#post-room').click (postForm);
    $('#update-room').click (putForm);
    // takes a string and makes-it-into-a-slug
    $('.remove-exit').click(removeExit);
    $('.add-exit').click(AddExitElement);
});

function removeExit(e) {
  console.log('remove?');
  e.preventDefault();
  $(this).closest('.exit-object').remove();
}

function postForm (e) {
    e.preventDefault();
    // figure out if new or updating
    var body = getData();

    $.ajax({
        url:'/rooms',
        type:"POST",
        data:JSON.stringify(body),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(){
            console.log('success');
            window.location = '/rooms';
        },
        error: function (e) {
            console.log(e);
            console.log('error');
        }
    });

}
function putForm (e) {
    e.preventDefault();
    // figure out if new or updating
    var body = getData();

    $.ajax({
        url:'/rooms/'+$("[name=id]").attr("room-id"),
        type:"POST",
        data:JSON.stringify(body),
        contentType:"application/json; charset=utf-8",
        dataType:"json",
        success: function(){
            console.log('success');
            window.location = '/rooms';
        },
        error: function (e) {
            $('.error').html(e.responseText).show();
            console.log(e.responseText);
        }
    });

}
// make an array out of the string list
function GetItems () {
    var items = $('[name=items]').val();
    // take out all spaces
    items = items.replace(/ /g, '');
    // cut into array
    var itemsArray = items.split(',');
    // remove empties
    for(var i = itemsArray.length; i--; i >= 0) {
        if(itemsArray[i] == '') {
            itemsArray.splice(i, 1);
        }
    }
    return itemsArray;
}

function GetExits() {
  var $exits = $('#exits-list .exit-object');
  var exits = [];
  $($exits).each(function (index) {
    var nextExit = {
      cmd: $(this).find('[name=exit-cmd]').val(),
      room: $(this).find('[name=exit-room]').val()
    };
    if(nextExit.cmd.length < 1 || nextExit.room.length < 1) {
      //dont push
    } else {
      exits.push(nextExit);
    }
  });
  return exits;
}

function getData() {
    var body = {
        title: $('[name=title]').val(),
        area: $('[name=area]').val(),
        content: $('[name=content]').val(),
        exits: []
    };
    body.exits = GetExits();
    body.items = GetItems();
    return body;
}

function forceSlug (input) {
    if(input == '') return '';

    input = input.toLowerCase();
    input = input.replace(/[^0-9a-z\-\,\ ]/gi, '');
    return input;
}

function AddExitElement (e) {
  e.preventDefault();
  $('#exit-object-template').find('.exit-object').clone().appendTo('#exits-list');
}
