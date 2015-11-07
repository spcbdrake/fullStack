$('document').ready(function(){


$('form').on('click','.submit', function(e){
  e.preventDefault();
  $('.section2').removeClass('hidden');
  $('.section1').addClass('hidden');
  $('.pongArt').addClass('hidden');
});

});
