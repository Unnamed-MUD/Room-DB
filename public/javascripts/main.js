$(function () {
  $('.action-delete-room').click(function () {
    var roomID = $(this).attr('data-id').toString();
    console.log(roomID);
    if(window.confirm("Delete room id " +roomID + "???" )) {
      $.ajax({
          url: '/rooms/' + roomID,
          type: 'DELETE',
          success: function(result) {
            window.location = '/rooms'
          }
      });
    }
  });
});
