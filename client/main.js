$(document).ready(function(){
  page.init();
});

var page = {
  init: function(){
    page.initStyling();
    page.initEvents();
  },
  initStyling: function(){



  },

  initEvents: function(){

    //When you submit to log in as an existing user
    $('#returning').on('submit', function(event){
      event.preventDefault();
      var username= $('input[name="userName"]').val();
      var pass = $('input[name="password"]').val();
      $('input[name="userName"]').val("");
      $('input[name="password"]').val("");
      var user = {userName: username, password: pass};
      //Does a GET call to get user data
      $.ajax({
        method: 'POST',
        url: "/login",
        data: user,
        success: function(resp){
          if(resp === "403"){
            console.log("you fucked up");
            alert("Wrong Password");
          }
          else{
          console.log(resp);
          var currentUser = JSON.parse(resp);
          page.currentUser = {userName: currentUser.userName, money: currentUser.money};
          console.log("Current User", currentUser);
          $('section').toggleClass('hidden');
          $('iframe').remove();
          $('.video').toggleClass('hidden');
          $('#userName').html(currentUser.userName);
          $('#userMoney').html(currentUser.money);
          page.grabMatches();
          page.pullTopTen();
        }
        },
        failure: function(){
          console.log("you fucked up");
          alert("Wrong Password");
        }

      });

    });
    $('.logoutBtn').on('click', function(event){
      event.preventDefault();
      $.ajax({
        method: 'Post',
        url: '/logout',
        data: page.currentUser,
        success: function(resp){
          console.log(resp);
          $('section').toggleClass('hidden');
          $('.video').toggleClass('hidden');

      },
        failure: function(resp){
          console.log(resp);
          console.log("what happened?");
        }
      });
    });
    $('.colRight').on('click', 'article', function(event){
      event.preventDefault();
      var whichClicked = $(this).data('index');
      if(whichClicked < 2){
        page.currentPicks[0]= page.currentMatches[whichClicked];
      }
      else if(whichClicked <4){
        page.currentPicks[1] = page.currentMatches[whichClicked];
      }
      else{
        page.currentPicks[2] = page.currentMatches[whichClicked];
      }
    });
  },
   //this is just a quick workaround I was using to instantly create users in the console. Not used in the end product
  addNewUser: function(userInfo){
    $.ajax({
      method: 'POST',
      url: page.url,
      data: userInfo,
      success: function(){
        console.log("Well that worked");
      },
      failure: function(){
        console.log("What's going on?");
      }
    });

  },
  grabMatches: function(){
    $.ajax({
      method: 'GET',
      url: "/matches",
      success: function(data){
      console.log(JSON.parse(data));
      page.currentMatches = JSON.parse(data);
      page.fillMatches();
      }
    });
  },
  fillMatches: function(){
    //set up first match
      page.match1 = page.currentMatches.slice(0,2);
      console.log("Match 1", page.match1);
      var chance1 = page.match1[0].level/(page.match1[0].level+page.match1[1].level);
      var chance2 = 1-chance1;
      var payOut1 = page.match1[1].level/page.match1[0].level;
      var payOut2 = 1/payOut1;
      page.match1[0].odds = chance1;
      page.currentMatches[0].odds = chance1;
      page.match1[0].payOut = payOut1;
      page.match1[1].odds = chance2;
      page.currentMatches[1].odds = chance2;
      page.match1[1].payOut = payOut2;
    // set up second match
      page.match2 = page.currentMatches.slice(2, 4);
      var chance3 = page.match2[0].level/(page.match2[0].level+page.match2[1].level);
      var chance4 = 1-chance3;
      var payOut3 = page.match2[1].level/page.match2[0].level;
      var payOut4 = 1/payOut3;
      page.match2[0].odds = chance3;
      page.currentMatches[2].odds = chance3;
      page.match2[0].payOut = payOut3;
      page.match2[1].odds = chance4;
      page.currentMatches[3].odds = chance4;
      page.match2[1].payOut = payOut4;
    // set up third match
      page.match3 = page.currentMatches.slice(4,6);
      var chance5 = page.match3[0].level/(page.match3[0].level+page.match3[1].level);
      var chance6 = 1-chance5;
      var payOut5 = page.match3[1].level/page.match3[0].level;
      var payOut6 = 1/payOut5;
      page.match3[0].odds = chance5;
      page.currentMatches[4].odds = chance5;
      page.match3[0].payOut = payOut5;
      page.match3[1].odds = chance6;
      page.currentMatches[5].odds = chance6;
      page.match3[1].payOut = payOut6;

    _.each(page.currentMatches, function(currVal, idx, arr){
      $('article[data-index="'+idx+'"]').html("<img src='" + "images/"+currVal.id+".jpg' class='playerImg'><span class='playerName'>"+currVal.name+"</span><br><h4 class='odds'>"+(currVal.odds*100).toFixed(0)+"%</h4>");
    });
  },
  makePicks: function(pick1, pick2, pick3){
    page.currentPicks = [pick1.name, pick2.name, pick3.name];
  },
  runMatches: function(){
    /*var match1 = page.currentMatches.slice(0,2);
      console.log("Match 1", match1);
      var chance1 = match1[0].level/(match1[0].level+match1[1].level);
      var chance2 = 1-chance1;
      var payOut1 = match1[1].level/match1[0].level;
      var payOut2 = 1/payOut1;
      match1[0].odds = chance1;
      match1[0].payOut = payOut1;
      match1[1].odds = chance2;
      match1[1].payOut = payOut2;
      console.log("Odds 1: " + chance1 + " Odds 2: " + (1-chance1) );*/
      page.currentWinners[0]=page.whoWins(match1[0], match1[1]);
    //var match2 = page.currentMatches.slice(2, 4);
      console.log("Match 2", match2);
      page.currentWinners[1]=page.whoWins(match2[0], match2[1]);
  //  var match3 = page.currentMatches.slice(4,6);
      console.log("Match 3", match3);
      page.currentWinners[2]=page.whoWins(match3[0], match3[1]);
  },
  whoWins: function(player1, player2){
    var chance1 = player1.level/(player1.level + player2.level);
    var randomRunner = Math.random();
    console.log(randomRunner);
    if(randomRunner <= chance1){
      console.log(player1.name + "Wins");
      return player1.name;
    }
    else{
      console.log(player2.name + "Wins");
      return player2.name;
    }
  },
  howMuchWon: function(){
    var wins=0;
    for(var i=0; i<page.currentWinners.length; i++){
      if(page.currentWinners[i] === page.currentPicks[i]){
        console.log("you picked correctly and won! good job, champ");
        wins++;
        page.currentUser.money += 20;

      }
      else{
        console.log("you picked incorrectly and lost");
        page.currentUser.money -= 20;
      }
    }
    $('#userMoney').html(page.currentUser.money);
    var money = {money: page.currentUser.money};
    console.log(money);
    $.ajax({
      method: 'POST',
      url: '/update-money',
      data: money,
      success: function(resp){
        console.log("Received that shit");
        console.log(resp);
        console.log(money);
      },
      failure: function(){
        console.log("What the fuck");
      }

    });
    return wins;
  },
  pullTopTen: function(){
    $.ajax({
      method: 'GET',
      url: '/topTen',
      success: function(data){
      console.log(data);
      page.displayTopUsers(JSON.parse(data));
      }
    });
  },
  displayTopUsers: function(data){
    var topHtml = "";
    _.each(data, function(currVal, idx, arr){
      topHtml += "<li>" + currVal.userName + ": $" + currVal.money + "</li>";
    });
    $('#theBest').html(topHtml);
  },
  currentMatches : [],
  currentPicks: [{},{},{}],
  currentWinners: [],
  currentUser: {},
  match1: [],
  match2: [],
  match3: []

};
