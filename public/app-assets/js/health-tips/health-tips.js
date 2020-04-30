$(document).ready(function() {
  $('#readMore').modal({
    startingTop: '0%', // Starting top style attribute
    endingTop: '10%', // Ending top style attribute
  });
  // Render the tips
  loadTipsData();

  $('#confirmDelete #btnDelete').on('click', function(event) {
    event.preventDefault();
    const dataId = $(this).attr('href');
    $.ajax({
      type: 'delete',
      url: '/health-tip?id=' + dataId,
      success: function(response) {
        $('li.update-list-item[data-id=" '+ dataId +'"]').remove();
        showAlert(response, 10000);
      },
    });
  });

  // Handle the search
  $('#txtSearch').on('input', function(event) {
    event.preventDefault();
    let results = 0;
    const key = $(this).val().toLowerCase();
    if (key.trim().length) {
      $('#tips .update-list-item').each(function(index, element) {
        const title = $(element).find('.list-body h5').text().toLowerCase();
        const author = $(element).find('.author span').text().toLowerCase();
        const time = $(element).find('.time span').text().toLowerCase();
        if (title.includes(key) || author.includes(key) || time.includes(key)) {
          $(element).show();
          ++results;
        } else {
          $(element).hide();
        }
      });
    } else {
      $('#tips li.update-list-item').show();
      results = 1;
    }
    if (!results) {
      $('#tips #no-results').removeClass('hide');
    } else {
      $('#tips #no-results').addClass('hide');
    }
  });
});

/**
 * Add the listeners after the tips has been rendered int he frontend
 */
function initListeners() {
  $('#readMore #delete,.actions #delete')
      .on('click', function(event) {
        event.preventDefault();
        $('#readMore').modal('close');
        $('#confirmDelete').modal('open');
        $('#confirmDelete #btnDelete').attr('href', $(this).attr('href'));
      });

  // open the remore modal when the user click on the readmore botton
  $('.btnReadmore').on('click', function(event) {
    event.preventDefault();
    const listItem = $(this).parents('li.update-list-item');
    const title = listItem.find('.list-body h5').text();
    const decription = listItem.find('.list-body p').text();
    const author = listItem.find('.author').html();
    const time = listItem.find('.time').html();
    const editlink = listItem.find('.actions #edit').attr('href');
    const deleteLink = listItem.find('.actions #delete').attr('href');

    $('#readMore').find('.modal-content .title').text(title);
    $('#readMore').find('.modal-content .description').text(decription);
    $('#readMore').find('.modal-content .author').html(author);
    $('#readMore').find('.modal-content .time').html(time);
    $('#readMore').find('#edit').attr('href', editlink);
    $('#readMore').find('#delete').attr('href', deleteLink);

    $('#readMore').modal('open');
  });
}
/**
   * Load the tips and render it the frontend
   */
function loadTipsData() {
  $('.error-loading-msgBox').hide();
  $('.reload i').addClass( 'load');
  $.ajax({
    type: 'get',
    url: '/health-tips-data',
    success: function(response) {
      $('.loader-circle').hide();
      $('.reload i').removeClass( 'load');
      if (response.code) {
        showAlert('Error Loading Data. Check internet connection!', 10000);
        $('.error-loading-msgBox').css('display', 'block');
      } else {
        $('#tips-container').html(response);
        initListeners();
      }
    },
  });
}
