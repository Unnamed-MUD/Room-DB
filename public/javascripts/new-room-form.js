// GLOBALS
var roomsList = [];

var $autocompleteTarget = null; // which field we put the room id once user picks a suggestion

$(function () {
  $.ajax({
      url:'/rooms/json',
      type:"GET",
      dataType:"json",
      success: function(data){
          roomsList = data;
      },
      error: function (e) {
          console.log(e);
      }
  });

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

  $('[name=room-filter]').on('keyup', UpdateSuggestions);
  $(document).on('click', '.room-suggestion', PickSuggestion);

  $(document).on('click', '[name=exit-display]', ShowModal);
  $('.modal').on('click', function (e){
    if(e.target == this) {
      HideModal();
    }
  });

  $(document).keyup(function(e) {
    if (e.keyCode === 27) {
      HideModal();
    } // esc
  });
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
          if(window.location.toString().indexOf('map') != -1) {
            window.location.reload(true);
          } else {
            window.location = '/rooms';
          }
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
          if(window.location.toString().indexOf('map') != -1) {
            window.location.reload(true);
          } else {
            window.location = '/rooms';
          }
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
        exits: [],
        light: $('[name=light]').is(':checked'),
        outdoors: $('[name=outdoors]').is(':checked')
    };
    body.exits = GetExits();
    body.items = GetItems();
    console.log(body);
    return body;
}

function UpdateSuggestions () {
  $('#suggestions').empty();
  var $template = $('#room-suggestion-template').find('.room-suggestion');

  var titleMatches = [];
  var searchString = $(this).val().toLowerCase();

  for(var i = 0; i < roomsList.length; i++) {
    if(roomsList[i].title.toLowerCase().indexOf(searchString) > -1) {
      titleMatches.push(roomsList[i]);
    }
  }

  // reduce to 5 suggestions
  titleMatches = titleMatches.slice(0, 4);

  for(i = 0; i < titleMatches.length; i++) {
    var $el = $($template).clone().appendTo('#suggestions');
    $el.find('.room-suggestion-title').html(titleMatches[i].title);
    $el.find('.room-suggestion-id').html(titleMatches[i]._id);
    $el.find('.room-suggestion-content').html(titleMatches[i].content.substring(0,80) + ' ...');
  }
}

function PickSuggestion() {
  var title = $(this).find('.room-suggestion-title').html();
  var id = $(this).find('.room-suggestion-id').html();
  $($autocompleteTarget).find('[name=exit-display]').val(title);
  $($autocompleteTarget).find('[name=exit-room]').val(id);
  HideModal();
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

function ShowModal (e){
  $autocompleteTarget = $(this).first().parent();

  $('.modal').show();
  $('.modal-cover').show();
  $('[name=room-filter]').val('').focus();
  $('#suggestions').empty();
}

function HideModal () {
  $autocompleteTarget = null;
  $('.modal').hide();
  $('.modal-cover').hide();
}
