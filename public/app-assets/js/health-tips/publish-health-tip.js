$(document).ready(function() {
  // eslint-disable-next-line require-jsdoc
  function updateClock() {
    $('.publish-time').text(moment().format('h:mm:ss a'));
    // call this function again in 1000ms
    setTimeout(updateClock, 1000);
  }
  // update publish time
  updateClock();

  // send ajax post rewuest to server
  $('#frmAddHealthTips').on('submit', function(e) {
    e.preventDefault();
    // hide error message
    hideErrorMsg();
    // diactivate the submit btn
    $('#btnPublish .preloader-wrapper.small')
        .css({'display': 'inline-block'});
    $('#btnPublish span').text('Publishing...');
    $('#btnPublish').prop('disabled', true);
    // send ajax request to server
    $.ajax({
      type: 'post',
      url: '/publish-health-tip',
      data: {
        tips_topic: $('#tips_topic').val(),
        tips_desc: $('#tips_desc').val(),
        tipId: $('#tipId').text(),
        authorId: $('#adminId').text(),
        author_name: $('#adminName').text(),
      },
      success: function(response) {
        console.log(response);
        // activate the submit btn
        $('#btnPublish .preloader-wrapper.small').hide();
        $('#btnPublish span').text('Publish');
        $('#btnPublish').prop('disabled', false);
        // check if server responded with error
        if (response == 'Successful') {
          // display success message
          $('.prompt').modal('open');
        } else {
          // show error message if server responded with error
          showErrorMsg(response.code, response.details,
              'Check internet connection and try again!!');
        }
      },
      fail: (err)=> {
        // show error message if request failed
        showErrorMsg(response.code, response.details,
            'Check internet connection and try again!!');
      },
    });
    return false;
  });
  // handle reset events
  $('.modal #btnResetForm').click(function(e) {
    e.preventDefault();
    // reset the form
    $('#frmAddHealthTips').trigger('reset');
  });
});
