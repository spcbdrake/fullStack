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
          $('.video').toggleClass('hidden');
          $('#userName').html(currentUser.userName);
          $('#userMoney').html(currentUser.money);
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
      },
        failure: function(resp){
          console.log(resp);
          console.log("what happened?");
        }
      });


    });
    // if you are creating a new user this sends upon submitting the info
    $('#newLogin').on('submit', function(event){
      event.preventDefault();
      var userName = $('input[name="newUserName"]').val();
      var password = $('input[name="newPassword"]').val();
      // Performs a GET to make sure the userName is not taken
      $.ajax({
        method: 'GET',
        url: page.url,
        success: function(data){
          var userInfo = data;
          page.checkForUser(userName, password, userInfo);
        },
        failure: function(data){
          console.log("something went wrong");
        }
      });
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

  //function that checks if user exists and verifies passwords of existing users
  checkPassword: function(username, userPassword, userInfo){
    // if the user does not exist then it opens up the new login
    if(_.findWhere(userInfo, {userName: username})=== undefined){
      alert("no user exists");
      $('#newLogin').toggleClass('hidden');
    }
    //if the user exists then it checks the password
    else{
    _.each(userInfo, function(currVal, idx, arr){
      if(currVal.userName === username){
        //if the password corresponds to the username then it logs you in
        if(currVal.password === userPassword){

        $('section').toggleClass('hidden');
        $('#currentUser').html(username);
        $('#userMoney').html(currVal.money);
        }

        //if it doesn't then you get an alert that the wrong password was entered and you have to try again
        else{
          alert("Wrong Password");
        }
      }

    });
    }
  },

  //searching for whether or not the user already exists
  checkForUser: function(username, passWord, info){
    //if the user does not exist in the database then it makes a new user
    if(_.findWhere(info, {userName: username}) === undefined){
      var newUser = {userName: username, password: passWord, money: 20};

      // POST call to add the user and his info to the database
      $.ajax({
        method: 'POST',
        url: page.url,
        data: newUser,
        success: function(resp){
          console.log("That worked");
          // user is now logged in and main page will display
          $('section').toggleClass('hidden');
          $('#currentUser').html(newUser.userName);
          $('#userMoney').html(newUser.money);
        },
        failure: function(resp){
          console.log("Something went wrong");
        }

      });
    }

    //if the userName is taken then you have to try again
    else{
      alert("That username already exists. Please pick a new one or log in with your password.");
    }
  },
  grabMatches: function(){
    $.ajax({
      method: 'GET',
      url: "/matches",
      success: function(data){
      console.log(JSON.parse(data));
      page.currentMatches = JSON.parse(data);
      }
    });
  },
  makePicks: function(pick1, pick2, pick3){
    page.currentPicks = [pick1.name, pick2.name, pick3.name];
  },
  runMatches: function(){
    var match1 = page.currentMatches.slice(0,2);
      console.log("Match 1", match1);
      var chance1 = match1[0].level/(match1[0].level+match1[1].level);
      var chance2 = 1-chance1;
      var payOut1 = match1[1].level/match1[0].level;
      var payOut2 = 1/payOut1;
      match1[0].odds = chance1;
      match1[0].payOut = payOut1;
      match1[1].odds = chance2;
      match1[1].payOut = payOut2;
      console.log("Odds 1: " + chance1 + " Odds 2: " + (1-chance1) );
      page.currentWinners[0]=page.whoWins(match1[0], match1[1]);
    var match2 = page.currentMatches.slice(2, 4);
      console.log("Match 2", match2);
      page.currentWinners[1]=page.whoWins(match2[0], match2[1]);
    var match3 = page.currentMatches.slice(4,6);
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
  currentPicks: [],
  currentWinners: [],
  currentUser: {},

};
