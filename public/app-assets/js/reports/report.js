/* eslint-disable no-invalid-this */
$(document).ready(function() {
  'use strict';
  // Handle the search
  $('#txtSearch').on('input', function(event) {
    event.preventDefault();
    let results = 0;
    const key = $(this)
        .val()
        .toLowerCase();
    if (key.trim().length) {
      $('.chat-list .chat-user').each(function(index, element) {
        const reporterName = $(element)
            .find('#displayName')
            .text()
            .toLowerCase();
        const status = $(element)
            .find('#displayStat')
            .text()
            .toLowerCase();
        const time = $(element)
            .find('#displaytime span')
            .text()
            .toLowerCase();
        if (reporterName.includes(key) || time.includes(key) || status == key) {
          $(element).show();
          ++results;
        } else {
          $(element).hide();
        }
      });
    } else {
      $('.chat-list .chat-user').show();
      results = 1;
    }
    if (!results) {
      $('.no-data-found').removeClass('hide');
    } else {
      $('.no-data-found').addClass('hide');
    }
  });

  $('.reload').on('click', function(event) {
    event.preventDefault();
    $('.reload i').addClass('load');
    /*
     **Emit an event through socket.io
     ** This request is to get realtime report
     */
    socket.emit('queryReports', {data: 'zxz'});
  });

  /*
   **Emit an event through socket.io
   ** This request is to get realtime report
   */
  socket.emit('queryReports', {data: ''});
  // hide some elements
  $('#reportDetailsSection .chat-header .default-hide').css('display', 'none');
  $('#reportDetailsSection .chat-header .tabs').css('display', 'none');

  // get all the neccessary elements from frontend
  const chatHeaderName = $('.chat-header #userName');
  const chatHeaderReporterImage = $('.chat-header #reporterImage');
  const chatHeaderCaseSummary = $('.chat-header #caseSummary');
  const reporter = $('.tab-content #e-case table #reporter');
  const curReportID = $('.tab-content #e-case #curReportID');
  const reporterID = $('.tab-content #e-case #reporterID');
  const adminID = $('#adminId').text();
  const emCase = $('.tab-content #e-case table #emCase');
  const reportTime = $('.tab-content #e-case table #reportTime');
  const emLoc = $('.tab-content #e-case table #emLoc');
  const locContainer = $('.loc-footer table #curLoc');
  const vitLocContainer = $('.tab-content table #VitLoc');
  const matrixContainer = $('.tab-content table #matrix');
  const locationTrigger = $('ul li a.location-triger');
  const reporterList = $('.sidebar-content.sidebar-chat#report-list');
  const reportStatus = $('.tab-content #e-case table #reportStatus');

  /**
   * Respond to the getUserReport that is emitted
   * from the node server through socket.io
   */
  socket.on('getUserReport', function(data) {
    // hide the load overlay
    $('#reportDetailsSection #load-data').hide();
    const doc = data.doc;
    const time = data.time;
    const position = {
      lat: doc.latitude,
      lng: doc.longitude,
    };
    // Update the Frontend of the report page
    reporterID.text(doc.uid);
    curReportID.text(data.reportID);
    chatHeaderReporterImage.attr('src', doc.reporterImage);
    chatHeaderName.text(doc.reporterName);
    reporter.text(doc.reporterName);
    chatHeaderCaseSummary.text(doc.emergency);
    emCase.text(doc.emergency);
    reportTime.text(time);
    setGeocodeLatLng(geocoder, position, emLoc);

    // Initial load of the map the admin current location
    calculateAndDisplayRoute(
        directionsService,
        directionsRenderer,
        curLoc,
        position,
    );
    // Calcutlate the distanse matrix and update the frontend
    setDistannceMatrix(
        [locContainer, vitLocContainer, matrixContainer],
        curLoc,
        position,
    );

    // Calculate the distance route and update the map when map tab is clicked
    locationTrigger.on('click', function() {
      calculateAndDisplayRoute(
          directionsService,
          directionsRenderer,
          curLoc,
          position,
      );
      // Calcutlate the distanse matrix and update the frontend of he mab tab
      setDistannceMatrix(
          [locContainer, vitLocContainer, reportTimeContainer],
          curLoc,
          position,
      );
    });
  });

  /*
   **Respond to the changes in the report collection
   ** from the node server through socket.io
   */
  socket.on('reportSnapshot', function(data) {
    console.log(data, 'lsocket');
    reporterList.html(data.reportList);
    $('.reload i').removeClass('load');
    initListeners();
  });

  /**
   * Add the listeners after the tips has been rendered int he frontend
   */
  function initListeners() {
    // Highlight the selected user
    $('.chat-list .chat-user').on('click', function() {
      // remove the default display of and display the tabs
      $('#reportDetailsSection .chat-header .default-hide').css(
          'display',
          'block',
      );
      $('#reportDetailsSection .chat-header .tabs').css('display', 'flex');
      $('#reportDetailsSection #default').hide();
      $('#reportDetailsSection .tabs .tab #e-case-tab').trigger('click');
      $('#reportDetailsSection .tabs .tab #e-case-tab').addClass('active');
      // hide the load overlay
      $('#reportDetailsSection #load-data').show();

      // get the report id
      const dataID = $(this).attr('data-id');
      const reporterID = $(this).attr('data-reporter');
      console.log(dataID);
      // highlight the selected or clicked report
      $('.chat-list .chat-user').removeClass('active');
      $(this).toggleClass('active');
      /*
       **Emit an event through socket.io
       ** This request is to get report details
       */
      socket.emit('queryUserReport', {
        reportID: dataID,
        adminID: adminID,
        reporterID: reporterID,
      });
    });
  }

  /*
   **Respond to the changes in the report collection
   ** from the node server through socket.io
   */
  socket.on('reportStatUpdated', function(data) {
    // update the ui
    updateReportUI(data.isResponded);
  });

  /**
   * update the ui.
   * @param {String} isResponded Unique report ID.
   */
  function updateReportUI(isResponded) {
    const reportID = curReportID.text();
    console.log(reportID);
    if (isResponded) {
      $('#' + reportID + ' #displayStat').text('Responded');
      $('#' + reportID + ' #displayStat').removeClass('red');
      $('#' + reportID + ' #displayStat').addClass('green');
      reportStatus.html('<span style="color:#318435">Responded</span>');
    } else {
      $('#' + reportID + ' #displayStat').text('Not Responded');
      $('#' + reportID + ' #displayStat').removeClass('green');
      $('#' + reportID + ' #displayStat').addClass('red');
      reportStatus.html('<span style="color:#cc1e1e">Not Responded</span>');
    }
  }
});
