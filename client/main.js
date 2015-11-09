(function() {
  'use strict';



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
            alert("Wrong Password");
          }
          else{
          var currentUser = JSON.parse(resp);
          page.currentUser = {userName: currentUser.userName, money: currentUser.money};
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
          alert("Wrong Password");
        }

      });

    });
    $('.submitPicks').on('click', function(event){
      event.preventDefault();
      if(page.timesSubmitted < 1){
        page.runMatches();
        page.howMuchWon();
        page.timesSubmitted++;
      }
      else{
      alert("You have already played today");
      }
    });
    $('.nextDay').on('click', function(event){
      event.preventDefault();
      page.currentMatches = [];
      page.currentPicks = [{name: "none"},{name: "none"},{name: "none"}];
      page.currentWinners = [];
      page.match1 = [];
      page.match2 = [];
      page.match3 = [];
      page.timesSubmitted = 0;
      $('#dailyWinners').html("");
      $('#dailyWinnings').html("");
      $('#yourPicks').html("");
      page.grabMatches();
    });
    $('.logoutBtn').on('click', function(event){
      event.preventDefault();
      page.currentMatches = [];
      page.currentPicks = [{name: "none"},{name: "none"},{name: "none"}];
      page.currentWinners = [];
      page.match1 = [];
      page.match2 = [];
      page.match3 = [];
      page.timesSubmitted = 0;
      $('#dailyWinners').html("");
      $('#dailyWinnings').html("");
      $('#yourPicks').html("");
      $.ajax({
        method: 'Post',
        url: '/logout',
        data: page.currentUser,
        success: function(resp){
          $('section').toggleClass('hidden');
          $('.video').toggleClass('hidden');

      },
        failure: function(resp){
          console.log("what happened?");
        }
      });
    });
    $('.colRight').on('click', 'article', function(event){
      event.preventDefault();
      var whichClicked = $(this).data('index');
      var $imgChild = $(this).children('img');
      if(whichClicked < 2){
        $('article[data-index="0"] img').removeClass('selected');
        $('article[data-index="1"] img').removeClass('selected');
        if(page.currentPicks[0] === page.currentMatches[whichClicked]){
          page.currentPicks[0] = {name: "none"};
        }
        else{
        $imgChild.addClass('selected');
        page.currentPicks[0]= page.currentMatches[whichClicked];
        }
      }
      else if(whichClicked <4){
        $('article[data-index="2"] img').removeClass('selected');
        $('article[data-index="3"] img').removeClass('selected');
        if(page.currentPicks[1] === page.currentMatches[whichClicked]){
          page.currentPicks[1] = {name: "none"};
        }
        else{
        $imgChild.addClass('selected');
        page.currentPicks[1] = page.currentMatches[whichClicked];
        }
      }
      else{
        $('article[data-index="4"] img').removeClass('selected');
        $('article[data-index="5"] img').removeClass('selected');
        if(page.currentPicks[2] === page.currentMatches[whichClicked]){
          page.currentPicks[2] = {name: "none"};
        }
        else{
        $imgChild.addClass('selected');
        page.currentPicks[2] = page.currentMatches[whichClicked];
        }
      }
      $('#yourPicks').html("Your Picks: "+ page.currentPicks[0].name + ", "+ page.currentPicks[1].name + ", "+ page.currentPicks[2].name);
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
      page.currentWinners[0]=page.whoWins(page.match1);
      page.currentWinners[1]=page.whoWins(page.match2);
      page.currentWinners[2]=page.whoWins(page.match3);
  },
  whoWins: function(match){
    var randomRunner = Math.random();
    console.log(randomRunner);
    if(randomRunner <= match[0].odds){
      console.log(match[0].name + "Wins");
      return match[0].name;
    }
    else{
      console.log(match[1].name + "Wins");
      return match[1].name;
    }
    /*var chance1 = player1.level/(player1.level + player2.level);
    var randomRunner = Math.random();
    console.log(randomRunner);
    if(randomRunner <= chance1){
      console.log(player1.name + "Wins");
      return player1.name;
    }
    else{
      console.log(player2.name + "Wins");
      return player2.name;
    }*/
  },
  howMuchWon: function(){
    var wins=0;
    var dailyPayout = 0;
    for(var i=0; i<page.currentWinners.length; i++){
      if(page.currentWinners[i] === page.currentPicks[i].name){
        console.log("you picked correctly and won! good job, champ");
        wins++;
        page.currentUser.money += Math.round(20*page.currentPicks[i].payOut);
        dailyPayout += Math.round(20*page.currentPicks[i].payOut);
        console.log("won" + dailyPayout);

      }
      else{
        if(page.currentPicks[i].name ==="none"){
          console.log("you refrained from picking");
        }
        else{
        console.log("you picked incorrectly and lost");
        page.currentUser.money -= 20;
        dailyPayout -=20;
        console.log("lost" + dailyPayout);
      }
      }
    }
    $('#dailyWinners').html("Daily Winners: " + page.currentWinners[0] + ", "+page.currentWinners[1] + ", " + page.currentWinners[2]);
    $('#dailyWinnings').html("Your Daily Winnings: $"+ dailyPayout);
    $('#userMoney').html(page.currentUser.money);
    var money = {money: page.currentUser.money};
    console.log(money);
    $.ajax({
      method: 'POST',
      url: '/update-money',
      data: money,
      success: function(resp){
        console.log("Received updated funds");
        console.log(money);
        page.pullTopTen();
      },
      failure: function(){
        console.log("What the heck");
      }

    });
    return wins;
  },
  pullTopTen: function(){
    $.ajax({
      method: 'GET',
      url: '/topTen',
      success: function(data){
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
  currentPicks: [{name: "none"},{name: "none"},{name: "none"}],
  currentWinners: [],
  currentUser: {},
  match1: [],
  match2: [],
  match3: [],
  timesSubmitted: 0,

};

}());
