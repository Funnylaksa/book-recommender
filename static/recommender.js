$(function() {
  // Button will be disabled until we type something inside the input field
  const source = document.getElementById('autoComplete');
  const inputHandler = function(e) {
    if(e.target.value==""){
      $('.book-button').attr('disabled', false);
    }
    else{
      $('.book-button').attr('disabled', false);
    }
  }
  source.addEventListener('input', inputHandler);

  $('.fa-arrow-up').click(function(){
    $('html, body').animate({scrollTop:0}, 'slow');
  });

  $('.app-title').click(function(){
    window.location.href = '/';
  })

  $('.book-button').on('click',function(){
    var title = $('.book').val();
    if (title=="") {
      $('.results').css('display','none');
      $('.fail').css('display','block');
    }

    if (($('.fail').text() && ($('.footer').css('position') == 'absolute'))) {
      $('.footer').css('position', 'fixed');
    }
    else{
        $("#loader").fadeIn();
        parse_title(title);
    }
  });
});

// will be invoked when clicking on the recommended book cards
function recommendcard(e){
  $("#loader").fadeIn();
  var title = e.getAttribute('title');
  parse_title(title);
}


// passing title detail to python's flask for displaying
function parse_title(book_title){
  details = {
      'title':book_title,
  }

  $.ajax({
    type:'POST',
    data:details,
    url:"/recommend",
    dataType: 'html',
    complete: function(){
      $("#loader").delay(500).fadeOut();
    },
    success: function(response) {
      $('.results').html(response);
      $('#autoComplete').val('');
      $('.footer').css('position','absolute');
      if ($('.book-content')) {
        $('.book-content').after('<div class="gototop"><i title="Go to Top" class="fa fa-arrow-up"></i></div>');
      }
      $(window).scrollTop(0);
    }
  });
}
