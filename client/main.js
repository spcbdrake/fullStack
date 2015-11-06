$('document').ready(function(){


$('form').on('click','.submit', function(e){
  e.preventDefault();
  $('.section2').removeClass('hidden');
  $('.loginDiv').addClass('hidden');
  $('.pongArt').addClass('hidden');
});

});
