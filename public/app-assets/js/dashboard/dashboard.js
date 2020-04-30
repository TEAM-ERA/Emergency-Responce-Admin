$(document).ready( function() {
  console.log('ready');
  loadRecentReport();
  loadRecentTips();
  loadRecentEmergencyCases();
});


/**
 * Load the Load the recent Emergency cases
 */
function loadRecentEmergencyCases() {
  $('.error-loading-msgBox').hide();
  $('.loader-circle').show();
  $.ajax({
    type: 'get',
    url: '/recent-emergencies',
    success: function(response) {
      $('.loader-circle').hide();
      if (response.code) {
        showAlert('Error Loading Data. Check internet connection!', 10000);
        $('.error-loading-msgBox').css('display', 'block');
      } else {
        $('#recent-emergencies').html(response);
      }
    },
    fail: function(err) {
      console.log(err);
    },
  });
}

/**
 * Load the recent report
 */
function loadRecentReport() {
  $('.error-loading-msgBox').hide();
  $('.loader-circle').show();
  $.ajax({
    type: 'get',
    url: '/recent-report',
    success: function(response) {
      $('.loader-circle').hide();
      if (response.code) {
        showAlert('Error Loading Data. Check internet connection!', 10000);
        $('.error-loading-msgBox').css('display', 'block');
      } else {
        $('#recent-reports').html(response);
      }
    },
    fail: function(err) {
      console.log(err);
    },
  });
}
/**
 * Load the Load the recent tips
 */
function loadRecentTips() {
  $('.error-loading-msgBox').hide();
  $('.loader-circle').show();
  $.ajax({
    type: 'get',
    url: '/recent-tips',
    success: function(response) {
      $('.loader-circle').hide();
      if (response.code) {
        showAlert('Error Loading Data. Check internet connection!', 10000);
        $('.error-loading-msgBox').css('display', 'block');
      } else {
        $('#recent-tips').html(response);
      }
    },
    fail: function(err) {
      console.log(err);
    },
  });
}
