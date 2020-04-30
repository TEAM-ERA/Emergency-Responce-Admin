$(document).ready(function() {
  // Load the the Data and render in frontend
  if ($('#page-title').length > 0) {
    loadEmergencyData();
  }

  $('#btnDelete').on('click', function(event) {
    event.preventDefault();
    $('#confirmDelete').modal('open');
    $('#confirmDelete #btnDelete').attr('href', $(this).attr('href'));
  });

  // Send delete request when delete button is clicked
  $('#confirmDelete #btnDelete').on('click', function(event) {
    event.preventDefault();
    $('.modal-footer #btnDelete .preloader-wrapper.small')
        .css({'display': 'inline-block'});
    $('.modal-footer #btnDelete span').text('Deleting...');
    $('.modal-footer #btnDelete').prop('disabled', true);
    const dataId = $(this).attr('href');
    $.ajax({
      type: 'delete',
      url: '/emergencies?id=' + dataId,
      success: function(response) {
        if ($('#page-title').length > 0) {
          $('.modal-footer #btnDelete .preloader-wrapper.small').hide();
          $('.modal-footer #btnDelete span').text('Delete');
          $('.modal-footer #btnDelete').prop('disabled', false);
          $('#confirmDelete').modal('close');
          $('.collection li.collection-item[data-id="'+ dataId +'"]').remove();
        } else {
          location.replace('/first-aid');
        }
        showAlert(response, 10000);
      },
    });
  });

  $('#txtSearch').on('input', function(event) {
    event.preventDefault();
    let results = 0;
    const key = $(this).val().toLowerCase();
    if (key.trim().length) {
      $('.collection .collection-item #title').each(function(index, element) {
        const title = $(element).text().toLowerCase();
        if (!title.includes(key)) {
          $(element).parents('li.collection-item.avatar').hide();
        } else {
          $(element).parents('li.collection-item.avatar').show();
          ++results;
        }
      });
    } else {
      $('.collection .collection-item.avatar').show();
      results = 1;
    }
    if (!results) {
      $('.collection #no-results').removeClass('hide');
    } else {
      $('.collection #no-results').addClass('hide');
    }
  });
});

/**
 * Load the emergency data
 */
function loadEmergencyData() {
  $('.error-loading-msgBox').hide();
  $('.loader-circle').show();
  $('.reload i').addClass( 'load');
  $.ajax({
    type: 'get',
    url: '/emergencies-data',
    success: function(response) {
      $('.loader-circle').hide();
      $('.reload i').removeClass( 'load');
      if (response.code) {
        showAlert('Error Loading Data. Check internet connection!', 10000);
        $('.error-loading-msgBox').css('display', 'block');
      } else {
        $('#emergencies-container').html(response);
        initListeners();
      }
    },
    fail: function(err) {
      console.log(err);
    },
  });
}
/**
 * Add the listeners after the tips has been rendered int he frontend
 */
function initListeners() {
  // Code for the confirm delete modal
  $('#readMore #delete,.collection-item .actions #delete')
      .on('click', function(event) {
        event.preventDefault();
        $('#confirmDelete').modal('open');
        $('#confirmDelete #btnDelete').attr('href', $(this).attr('href'));
      });
}
