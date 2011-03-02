function cardBrowser() {
  //var game = modules.gameaction.game;
  
  $($('#redCards li')[5]).addClass('active');
  
  $('#redCards li').css({matrix: '(1, -0.2, 0, 1, 0pt, 0pt)', scale: 1 });
  $('#redCards li').click(function() {
    $('#redCards li').animate({matrix: '(1, -0.2, 0, 1, 0pt, 0pt)', scale: 1 });
    $('#redCards li').removeClass('active', 1000);
    $(this).addClass('active', 1000);
    $(this).animate({'-moz-transform': 'matrix(1, -0.2, 0, 1, 0pt, 0pt)', scale: 3 });
  });
}

modules.cardBrowser = new cardBrowser;