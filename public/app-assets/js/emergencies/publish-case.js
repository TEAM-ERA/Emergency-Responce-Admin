$(document).ready(function() {
  // Add new steps
  $('#add-step').on('click', function(event) {
    event.preventDefault();
    const newLi = $('.step-item').eq(0).clone();
    newLi.find('#step_title').val(null);
    newLi.find('#step_desc').val(null);
    newLi.find('.remove-step').show();
    $('#steps').append(newLi);
    updateStepsNumbering();
    updateStepsId();
    mainttainOneStep();
  });
  // remove steps
  $('body').on('click', '.step-item .remove-step', function(event) {
    event.preventDefault();
    $(this).parents('li').remove();
    updateStepsNumbering();
    updateStepsId();
    mainttainOneStep();
  });

  // maintain one step
  mainttainOneStep();

  // Form submit
  $('#frmAddFirstAid').on('submit', function(e) {
    e.preventDefault();
    $('#btnPublish .preloader-wrapper.small')
        .css({'display': 'inline-block'});
    $('#btnPublish span').text('Publishing...');
    $('#btnPublish').prop('disabled', true);

    const formData = new FormData();
    const icon = document.querySelector('#em_icon').files[0];
    const illustration = document.querySelector('#fileIllustration').files[0];
    formData.append('title', $('#em_title').val());
    formData.append('authorId', $('#adminId').text());
    formData.append('id', $('#emId').text());
    formData.append('steps', JSON.stringify(getSteps()));
    formData.append('icon', icon);
    formData.append('illustration', illustration);

    // send the ajax post request
    $.ajax({
      url: '/publish-emergencies-case',
      type: 'post',
      data: formData,
      dataType: 'json',
      contentType: false,
      processData: false,
      success: (response) => {
        $('#btnPublish .preloader-wrapper.small').hide();
        $('#btnPublish span').text('Publish');
        $('#btnPublish').prop('disabled', false);
        console.log(response.successful);
        if (response.successful == 'Successful') {
          $('.prompt').modal('open');
        } else {
          showErrorMsg(response.code, response.details,
              'Check internet connection and try again!!');
        }
      },
    });
    return false;
  });

  // Init dropify
  $('.dropify').dropify();

  // update publish time
  updateClock();
});

/**
   * update publish time
   */
function updateClock() {
  $('.publish-time').text(moment().format('h:mm:ss a'));
  // call this function again in 1000ms
  setTimeout(updateClock, 1000);
}

/**
   * Update the number of the steps in real time
   */
function updateStepsNumbering() {
  let setID = 0;
  $('#steps .step-num').each(function(index, value) {
    setID++;
    $(value).text(setID);
  });
}

/**
   * Update the steps unique ID in real time
   */
function updateStepsId() {
  let setID = 0;
  $('.step-item').each(function(index, element) {
    $(element).attr('id', setID);
    setID++;
  });
}

/**
   * Maintain the one field for the steps
   */
function mainttainOneStep() {
  const steps = $('.step-item');
  if (steps.length < 2) {
    steps.eq(0).find('.remove-step').hide();
  } else {
    steps.eq(0).find('.remove-step').show();
  }
}

/**
 * Get First Aid Steps from the input field.
 * @return {Array} Returns array of the first aid steps.
 */
function getSteps() {
  const steps = [];
  $('#steps > li').each(function(index, element) {
    const stepNum = index + 1;
    const stepDescription = $(element).find('#step_title').val();
    steps.push({
      stepNum: stepNum,
      description: stepDescription,
    });
  });
  return steps;
};
