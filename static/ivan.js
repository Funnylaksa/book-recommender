$(function() {
  // Button will be disabled until we type something inside the input field
  const source = document.getElementById('autoComplete');
  const inputHandler = function(e) {
    if(e.target.value==""){
      $('.book-button').attr('disabled', true);
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
//    var my_api_key = '55a6a5ca3cdfe2fea08ca6f270dde6a2';
    var title = $('.book').val();
    if (title=="") {
      $('.results').css('display','none');
      $('.fail').css('display','block');
    }

    if (($('.fail').text() && ($('.footer').css('position') == 'absolute'))) {
      $('.footer').css('position', 'fixed');
    }

    else{
//      load_details(my_api_key,title);
//        var book_title = title
//        show_details(book_title);

       fetch('/recommend.html', {
        headers : {
            'Content-Type' : 'application/json'
        },
        method : 'POST',
        body : JSON.stringify( {
            'title' : title,
        })
    })
    .then(function (response){

        if(response.ok) {
            response.json()
            .then(function(response) {
                console.log(response);
            });
        }
        else {
            throw Error('Something went wrong');
        }
    })
    .catch(function(error) {
        console.log(error);
    });


    }
  });
});

// will be invoked when clicking on the recommended book cards
function recommendcard(e){
  $("#loader").fadeIn();
//  var my_api_key = '55a6a5ca3cdfe2fea08ca6f270dde6a2';
  var title = e.getAttribute('title');
  load_details(my_api_key,title);
}


//// passing all the details to python's flask for displaying and scraping the book reviews using imdb id
//function show_details(book_title){
//
//  details = {
//      'title':book_title,
//  }
//
//  $.ajax({
//    type:'POST',
//    data:details,
//    url:"/recommend",
//    dataType: 'html',
//    complete: function(){
//      $("#loader").delay(500).fadeOut();
//    },
//    success: function(response) {
//      $('.results').html(response);
//      $('#autoComplete').val('');
//      $('.footer').css('position','absolute');
////      if ($('.book-content')) {
////        $('.book-content').after('<div class="gototop"><i title="Go to Top" class="fa fa-arrow-up"></i></div>');
////      }
//      $(window).scrollTop(0);
//    }
//  });
//}
