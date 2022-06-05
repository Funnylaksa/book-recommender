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
    var my_api_key = '55a6a5ca3cdfe2fea08ca6f270dde6a2';
    var title = $('.book').val();
    if (title=="") {
      $('.results').css('display','none');
      $('.fail').css('display','block');
    }

    if (($('.fail').text() && ($('.footer').css('position') == 'absolute'))) {
      $('.footer').css('position', 'fixed');
    }

    else{
      load_details(my_api_key,title);
    }
  });
});

// will be invoked when clicking on the recommended book cards
function recommendcard(e){
  $("#loader").fadeIn();
  var my_api_key = '55a6a5ca3cdfe2fea08ca6f270dde6a2';
  var title = e.getAttribute('title'); 
  load_details(my_api_key,title);
}


// get the details of the book from the API (based on the name of the book)
function load_details(my_api_key,title){
  $.ajax({
    type: 'GET',
    url:'https://api.themoviedb.org/3/search/movie?api_key='+my_api_key+'&query='+title,
    async: false,
    success: function(book){
      if(book.results.length<1){
        $('.fail').css('display','block');
        $('.results').css('display','none');
        $("#loader").delay(500).fadeOut();
      }
      else if(book.results.length==1) {
        $("#loader").fadeIn();
        $('.fail').css('display','none');
        $('.results').delay(1000).css('display','block');
        var book_id = book.results[0].id;
        var book_title = book.results[0].title;
        var book_title_org = book.results[0].original_title;
        get_book_details(book_id,my_api_key,book_title,book_title_org);
      }
      else{
        var close_match = {};
        var flag=0;
        var book_id="";
        var book_title="";
        var book_title_org="";
        $("#loader").fadeIn();
        $('.fail').css('display','none');
        $('.results').delay(1000).css('display','block');
        for(var count in book.results){
          if(title==book.results[count].original_title){
            flag = 1;
            book_id = book.results[count].id;
            book_title = book.results[count].title;
            book_title_org = book.results[count].original_title;
            break;
          }
          else{
            close_match[book.results[count].title] = similarity(title,  book.results[count].title);
          }
        }
        if(flag==0){
          book_title = Object.keys(close_match).reduce(function(a, b){ return close_match[a] > close_match[b] ? a : b });
          var index = Object.keys(close_match).indexOf(book_title)
          book_id = book.results[index].id;
          book_title_org = book.results[index].original_title;
        }
        get_book_details(book_id,my_api_key,book_title,book_title_org);
      }
    },
    error: function(error){
      alert('Invalid Request - '+error);
      $("#loader").delay(500).fadeOut();
    },
  });
}

// getting closest match to the requested book name using Levenshtein distance
function similarity(s1, s2) {
  var longer = s1;
  var shorter = s2;
  if (s1.length < s2.length) {
    longer = s2;
    shorter = s1;
  }
  var longerLength = longer.length;
  if (longerLength == 0) {
    return 1.0;
  }
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  var costs = new Array();
  for (var i = 0; i <= s1.length; i++) {
    var lastValue = i;
    for (var j = 0; j <= s2.length; j++) {
      if (i == 0)
        costs[j] = j;
      else {
        if (j > 0) {
          var newValue = costs[j - 1];
          if (s1.charAt(i - 1) != s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

// get all the details of the book using the book id.
function get_book_details(book_id,my_api_key,book_title,book_title_org) {
  $.ajax({
    type:'GET',
    url:'https://api.themoviedb.org/3/movie/'+book_id+'?api_key='+my_api_key,
    success: function(book_details){
      show_details(book_details,book_title,my_api_key,book_id,book_title_org);
    },
    error: function(error){
      alert("API Error! - "+error);
      $("#loader").delay(500).fadeOut();
    },
  });
}

// passing all the details to python's flask for displaying and scraping the book reviews using imdb id
function show_details(book_details,book_title,my_api_key,book_id,book_title_org){
  var imdb_id = book_details.imdb_id;
  var poster;
  if(book_details.poster_path){
    poster = 'https://image.tmdb.org/t/p/original'+book_details.poster_path;
  }
  else {
    poster = 'static/default.jpg';
  }
  var overview = book_details.overview;
  var genres = book_details.genres;
  var rating = book_details.vote_average;
  var vote_count = book_details.vote_count;
  var release_date = book_details.release_date;
  var runtime = parseInt(book_details.runtime);
  var status = book_details.status;
  var genre_list = []
  for (var genre in genres){
    genre_list.push(genres[genre].name);
  }
  var my_genre = genre_list.join(", ");
  if(runtime%60==0){
    runtime = Math.floor(runtime/60)+" hour(s)"
  }
  else {
    runtime = Math.floor(runtime/60)+" hour(s) "+(runtime%60)+" min(s)"
  }

  // calling `get_book_cast` to get the top cast for the queried book
  book_cast = get_book_cast(book_id,my_api_key);
  
  // calling `get_individual_cast` to get the individual cast details
  ind_cast = get_individual_cast(book_cast,my_api_key);

  // calling `get_recommendations` to get the recommended books for the given book id from the TMDB API
  recommendations = get_recommendations(book_id, my_api_key);
  
  details = {
      'title':book_title,
      'cast_ids':JSON.stringify(book_cast.cast_ids),
      'cast_names':JSON.stringify(book_cast.cast_names),
      'cast_chars':JSON.stringify(book_cast.cast_chars),
      'cast_profiles':JSON.stringify(book_cast.cast_profiles),
      'cast_bdays':JSON.stringify(ind_cast.cast_bdays),
      'cast_bios':JSON.stringify(ind_cast.cast_bios),
      'cast_places':JSON.stringify(ind_cast.cast_places),
      'imdb_id':imdb_id,
      'poster':poster,
      'genres':my_genre,
      'overview':overview,
      'rating':rating,
      'vote_count':vote_count.toLocaleString(),
      'rel_date':release_date,  
      'release_date':new Date(release_date).toDateString().split(' ').slice(1).join(' '),
      'runtime':runtime,
      'status':status,
      'rec_books':JSON.stringify(recommendations.rec_books),
      'rec_posters':JSON.stringify(recommendations.rec_posters),
      'rec_books_org':JSON.stringify(recommendations.rec_books_org),
      'rec_year':JSON.stringify(recommendations.rec_year),
      'rec_vote':JSON.stringify(recommendations.rec_vote)
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

// getting the details of individual cast
function get_individual_cast(book_cast,my_api_key) {
    cast_bdays = [];
    cast_bios = [];
    cast_places = [];
    for(var cast_id in book_cast.cast_ids){
      $.ajax({
        type:'GET',
        url:'https://api.themoviedb.org/3/person/'+book_cast.cast_ids[cast_id]+'?api_key='+my_api_key,
        async:false,
        success: function(cast_details){
          cast_bdays.push((new Date(cast_details.birthday)).toDateString().split(' ').slice(1).join(' '));
          if(cast_details.biography){
            cast_bios.push(cast_details.biography);
          }
          else {
            cast_bios.push("Not Available");
          }
          if(cast_details.place_of_birth){
            cast_places.push(cast_details.place_of_birth);
          }
          else {
            cast_places.push("Not Available");
          }
        }
      });
    }
    return {cast_bdays:cast_bdays,cast_bios:cast_bios,cast_places:cast_places};
  }

// getting the details of the cast for the requested book
function get_book_cast(book_id,my_api_key){
    cast_ids= [];
    cast_names = [];
    cast_chars = [];
    cast_profiles = [];
    top_10 = [0,1,2,3,4,5,6,7,8,9];
    $.ajax({
      type:'GET',
      url:"https://api.themoviedb.org/3/movie/"+book_id+"/credits?api_key="+my_api_key,
      async:false,
      success: function(my_book){
        if(my_book.cast.length>0){
          if(my_book.cast.length>=10){
            top_cast = [0,1,2,3,4,5,6,7,8,9];
          }
          else {
            top_cast = [0,1,2,3,4];
          }
          for(var my_cast in top_cast){
            cast_ids.push(my_book.cast[my_cast].id)
            cast_names.push(my_book.cast[my_cast].name);
            cast_chars.push(my_book.cast[my_cast].character);
            if(my_book.cast[my_cast].profile_path){
              cast_profiles.push("https://image.tmdb.org/t/p/original"+my_book.cast[my_cast].profile_path);
            }
            else {
              cast_profiles.push("static/default.jpg");
            }
          }
        }
      },
      error: function(error){
        alert("Invalid Request! - "+error);
        $("#loader").delay(500).fadeOut();
      }
    });

    return {cast_ids:cast_ids,cast_names:cast_names,cast_chars:cast_chars,cast_profiles:cast_profiles};
  }

  // getting recommendations
  function get_recommendations(book_id, my_api_key) {
    rec_books = [];
    rec_posters = [];
    rec_books_org = [];
    rec_year = [];
    rec_vote = [];
    
    $.ajax({
      type: 'GET',
      url: "https://api.themoviedb.org/3/movie/"+book_id+"/recommendations?api_key="+my_api_key,
      async: false,
      success: function(recommend) {
        for(var recs in recommend.results) {
          rec_books.push(recommend.results[recs].title);
          rec_books_org.push(recommend.results[recs].original_title);
          rec_year.push(new Date(recommend.results[recs].release_date).getFullYear());
          rec_vote.push(recommend.results[recs].vote_average);
          if(recommend.results[recs].poster_path){
            rec_posters.push("https://image.tmdb.org/t/p/original"+recommend.results[recs].poster_path);
          }
          else {
            rec_posters.push("static/default.jpg");
          }
        }
      },
      error: function(error) {
        alert("Invalid Request! - "+error);
        $("#loader").delay(500).fadeOut();
      }
    });
    return {rec_books:rec_books,rec_books_org:rec_books_org,rec_posters:rec_posters,rec_year:rec_year,rec_vote:rec_vote};
  }
