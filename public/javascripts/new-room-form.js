$(function () {
  $('#area-selector').change(function () {
    var pickedArea = $(this).find('option:selected').text();
    $('input[name=area]').val(pickedArea);
  });

  $('input[name=items]').bind('change', function () {
    var newString = forceSlug($(this).val());
    $(this).val(newString);
  });

  $('#room-editor').submit (submitForm);

  // takes a string and makes-it-into-a-slug
  function forceSlug (input) {
    if(input == '') return '';

    input = input.toLowerCase();
    input = input.replace(/[^0-9a-z\-\,\ ]/gi, '');
    return input;
  }

  function submitForm (e) {
    e.preventDefault();
    // figure out if new or updating
    var body = {
      title: $('[name=title]').val(),
      area: $('[name=area]').val(),
      content: $('[name=content]').val()
    };

    body.items = GetItems();

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
});
