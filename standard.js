var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var async = require('async'); 
var playerName = "";
var playerNames = [];
var csv = "Playername,Country,Age,Height,Position,Years Played,Mean Year,Appearances,Goals\n";
var alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var alphabetsContd = "";
var playerBirthLocation = [];
var count = 0;
var href = "";  // href is just used for storing the links. Used at multiple locations. 
var coordinates ="";
var link = [];
var csv2 = "Playername,Country,Age,Height,Position,Years Played,Mean Year,Appearances,Goals,Birthplace,Longitude,Latitude\n";

// 0 if the country does not call Football 'Soccer', 1 if it does
var SoccerCountries = 0;

//Initialize the script by changing the country name here
var country = "France";

if ( SoccerCountries == "1" ) {
  var pageUrl = "http://en.wikipedia.org/wiki/Category:"+country+"_international_soccer_players";
}
else {
  var pageUrl = "http://en.wikipedia.org/wiki/Category:"+country+"_international_footballers";
}

findingLinks(pageUrl);

function findingLinks (url){

  request({
        "url": url
    },  

    function(err, resp, body){

      var $ = cheerio.load(body); 
      var data ="";

      for (i = 0; i < 26; i++) {
     
        $("h3").filter(function(){return $(this).text() === alphabets.charAt(i);}).next('ul').find('li').find('a').each(function(index,item){
          href = $(this).attr('href');
          href = 'http://en.wikipedia.org' +href;

          if ( href.indexOf("Category") > -1 || href.indexOf(country) > -1 || href.indexOf("youth") > -1) {
            href = "";
          }
          else {
            link.push(href);
            console.log(href);
          }
        });

        alphabetsContd = alphabets.charAt(i)+ " cont.";

        $("h3").filter(function(){return $(this).text() === alphabetsContd;}).next('ul').find('li').find('a').each(function(index,item){
          href = $(this).attr('href');
          href = 'http://en.wikipedia.org' +href;
          if ( href.indexOf("Category") > -1 || href.indexOf(country) > -1 || href.indexOf("youth") > -1) {
            href = "";
          }
          else {
            link.push(href);
            console.log(href);
          }
        }); 
      }
      
      fs.writeFile('links.txt', link);

      findingInfo();

      link = [];
      
      $("a:contains(next 200)").first().filter(function(){
        var nextPageLink = $(this).attr('href');
        nextPageLink = 'http://en.wikipedia.org' +nextPageLink;
        console.log(nextPageLink);
        findingLinks(nextPageLink);  
      })

  })
}



function findingInfo(){

  for (k = 0; k < link.length; k++) { 

    var playerURL = link[k];

    request({
            "url": playerURL
        }, 

      function(err, resp, body){

        var $ = cheerio.load(body);  
        var data ="";
        var meanYear = 0;
        var info = ""; // This will temporarily hold all the info of the player. Until the request runs again.
        var playerHeight = "";
        var playerName = "";
        var playerPosition = "";

        $('h1').find('span').filter(function(){
          playerName = $(this);
          playerName = playerName.html();
          console.log(playerName);
          playerName = playerName.replace(/,/g, "");
          info = info+playerName+ ",";
        })

        var playerAge = "";

        info = info+country+",";

        $('.ForceAgeToShow').filter(function(){     
          var data = $(this);
          playerAge = data.html().slice(10,12);
          info = info+playerAge+ ",";
         });

        if (playerAge == "") {
          info = info+ ",";
        } else {}


        /*Finding Player's height*/ 

        $('th:contains(Height)').parents('tr').find('td').filter(function(){
          var data = $(this);
          playerHeight = data.html().slice(0,4);
          playerHeight = playerHeight.replace(/[^0-9^.]/g, 'p')     // Replaces all the not 0-9 and . letters into p which is later done away with. 
          if (playerHeight.indexOf("#") > -1 || playerHeight.indexOf("p") > -1) {
            playerHeight = "";
          }
          else {
            info = info+playerHeight+",";
          }
        });

        if (playerHeight == "") {
          info = info+ ",";
        } else {}

        $('th:contains(Playing position)').parents('tr').find('td').first().filter(function(){
          var data = $(this);
          playerPosition = data.text();
          
          playerPosition = playerPosition.split(",").join(""); // Clean up for multiple entries.
          playerPosition = playerPosition.trim();
          playerPosition = playerPosition.toLowerCase();

          if ( playerPosition.indexOf("back") > 0 || playerPosition.indexOf("defender") > -1) {
            playerPosition = "Defender";
          }
          else if ( playerPosition.indexOf("striker") > -1 || playerPosition.indexOf("forward") > -1 || playerPosition.indexOf("inside") > -1 || playerPosition.indexOf("attacker") > -1 || playerPosition.indexOf("outside") > -1) {
            playerPosition = "Forward";
          }
          else if ( playerPosition.indexOf("midfield") > -1 || playerPosition.indexOf("half") > -1 || playerPosition.indexOf("winger") > -1 || playerPosition.indexOf("sweeper") > -1 || playerPosition.indexOf("libero") > -1 || playerPosition.indexOf("right wing") > -1) {
            playerPosition = "Midfielder";
          }
          else if ( playerPosition.indexOf("goalkeeper") > -1) {
            playerPosition = "Goalkeeper";
          }
          else {}

          info = info+playerPosition+ ",";
          console.log(playerPosition)
        });

        if (playerPosition == "") {
          info = info+ ",";
        } else {}
        
        //They need to be outside. Otherwise they are undefined outside filter.function()
        var averageYear = 0;
        var meanYear = 0;
        var goals = 0;
        var appearances = 0;
        
        var meanYear = "";
        var appearances = "";
        var goals = "";

        var famousLevel = ""; //This is a three-way switch which indicates whether the player has 'Honours' and 'Teams Managed' sections in .infobox

        $('th:contains(Honours)').filter(function(){
          famousLevel = "Honours";
        })

        $('th:contains(Teams managed)').filter(function(){
          famousLevel = "Teams managed";
        })

        if (famousLevel != "") {

          var playingYear = "";

          $('th:contains('+famousLevel+')').parent().prev().filter(function(){

            $(this).find('th').find('span').first().filter(function(){

              playingYear = $(this).html();

              if (playingYear.length == 4) {
                meanYear = playingYear;                
              }
              else {
                playingYear = playingYear.replace("&#x2013;", "-").replace(",  ", "-").replace(", ", "-");  // A fix for idiots who shouldn't be allowed to contribute to Wikipedia
                playingYear = playingYear.slice(0,9); 

                if (playingYear.search(/[^0-9^-]/g) > -1) {
                  playingYear = "";
                  meanYear = "";
                }
                else {
                  averageYear = playingYear.replace( /^\D+/g, '');  // averageYear is just a 8 digit number which is used to compute meanYear.
                  averageYear = playingYear.replace( "-", '');

                  //Mean Year of playing for National Team Calculator
                  if ( averageYear > 100000 ) {
                    var initialYear = parseInt(averageYear.slice(0,4));
                    var endYear = parseInt(averageYear.slice(4,8));
                    meanYear = (initialYear+endYear)/2;
                  }
                  else if ( averageYear < 2100 ) {
                    meanYear = parseInt(averageYear.slice(0,4));
                    meanYear = (meanYear+2014)/2;
                  }
                  else {
                    meanYear = "";
                  }

                }
              }
            })

            info = info+playingYear+",";
            info = info+meanYear+",";


            $(this).find('td').next().first().filter(function(){
              appearances = $(this).html();

              if (appearances == "" || appearances.search(/[^0-9]/g) > -1) {
                appearances = "";
              } else {
                info = info+appearances+",";    
              }  
            })

            $(this).find('td').next().next().first().filter(function(){
              goals = $(this).html();
              goals = goals.replace("(","");
              goals = goals.replace(")","");

              if (goals == "" || goals.search(/[^0-9]/g) > -1) {
                goals = "";
              } else {
                info = info+goals+",";    
              }  
            })

          })

          if (appearances == "" || appearances.search(/[^0-9]/g) > -1) {
            info = info+",";
          } else {}

          if (goals == "" || goals.search(/[^0-9]/g) > -1) {
            info = info+",";
          } else {}

        }


        //For players without both Honours and Team managed sections
        else {

          var playingYear = "";

          $('.infobox').find('td').find('a').filter(function(){return $(this).attr('href') == "/wiki/"+country+"_national_association_football_team";}).last().parent().filter(function(){


            $(this).prev('th').find('span').first().filter(function(){
              playingYear = $(this).html();

              if (playingYear.length == 4 || playingYear == "") {
                meanYear = playingYear;
              }
              else {
                playingYear = playingYear.replace("&#x2013;", "-").replace(",  ", "-").replace(", ", "-");  // A fix for idiots who shouldn't be allowed to contribute to Wikipedia
                playingYear = playingYear.slice(0,9); 

                if (playingYear.search(/[^0-9^-]/g) > -1) {
                  playingYear = "";
                  meanYear = "";
                }
                else {
                  averageYear = playingYear.replace( /^\D+/g, '');  // averageYear is just a 8 digit number which is used to compute meanYear.
                  averageYear = playingYear.replace( "-", '');

                  //Mean Year of playing for National Team Calculator
                  if ( averageYear > 100000 ) {
                    var initialYear = parseInt(averageYear.slice(0,4));
                    var endYear = parseInt(averageYear.slice(4,8));
                    meanYear = (initialYear+endYear)/2;
                  }
                  else if ( averageYear < 2100 ) {
                    meanYear = parseInt(averageYear.slice(0,4));
                    meanYear = (meanYear+2014)/2;
                  }
                  else {
                    meanYear = "";
                  }

                }
              }
            })

            info = info+playingYear+",";
            info = info+meanYear+","; 

            $(this).next().filter(function(){
              appearances = $(this).html();

              if (appearances == "" || appearances.search(/[^0-9]/g) > -1) {
                appearances = "";
              } else {
                info = info+appearances+",";    
              }  
            })


            $(this).next().next().filter(function(){
              goals = $(this).html();
              goals = goals.replace("(","");
              goals = goals.replace(")","");

              if (goals == "" || goals.search(/[^0-9]/g) > -1) {
                goals = "";
              } else {
                info = info+goals+",";    
              }
              
            })

          });

          if (appearances == "" || appearances.search(/[^0-9]/g) > -1) {
            info = info+",";
          } else {}

          if (goals == "" || goals.search(/[^0-9]/g) > -1) {
            info = info+",";
          } else {}

        }

        // For players who don't have country name in the 'teams played with' th. Weird. 

        var numberOfCommas = info.match(/,/g);  

        if (numberOfCommas.length == 7) {
          info = info + ",,";
        } else {}


        info = info.split("?").join("");    // Not sure if removing it makes any difference, since RegEx is already used
          
        $('.birthplace').find('a').first().filter(function(){     
          var data = $(this).attr('href');
          playerBirthLocation = data;
          playerBirthLocation = 'http://en.wikipedia.org' +playerBirthLocation;
          
          locationCoordinates(playerBirthLocation, info);
          
        });

      // Hard deleters
      //    |
      // To be added

      csv = csv+info+"\n";
      info = "";

      fs.writeFile('test-recursion'+country+'.csv', csv);
      

    })
  
  }
  console.log('congrats');

}


function locationCoordinates(playerBirthLocation, infoception) {    // infoception is the incepted form of info. Its actually info, but then its not quite info. :P
  
  request({
    "url": playerBirthLocation
  }, 

  function(err, resp, body){
    var $ = cheerio.load(body);  

    $('.firstHeading').find('span').filter(function(){
      var firstHeading = $(this).html();
      firstHeading = firstHeading.replace(/,/g, "");
      infoception = infoception+firstHeading+",";
      console.log(firstHeading);
    })

    $('.longitude').first().filter(function(){
      var longitude = $(this).html();
      longitude = longitude.replace("&#xB0;", "d").replace("&#x2032;", "m").replace("&#x2033;", "s");

      if (longitude.indexOf("e") > 0 || longitude.indexOf("E") > 0) {
        var direction = "east";
      } else if (longitude.indexOf("w") > 0 || longitude.indexOf("W") > 0) {
        var direction = "west";
      } else {}

      longitude = longitude.substring(0, longitude.length - 1);

      degrees = longitude.replace(/d(.*)/g, "");
      if (degrees == "") {
        degrees = 0;
      } else {
        degrees = parseInt(degrees)
      }

      minutes = longitude.replace(/(.*)d/g, "").replace(/m(.*)/g, "");
      if (minutes == "") {
        minutes = 0;
      } else {
        minutes = parseInt(minutes)
      }

      seconds = longitude.replace(/(.*)m/g, "").replace(/s(.*)/g, "");
      if (seconds == "") {
        seconds = 0;
      } else {
        seconds = parseInt(seconds);
      }

      var decimalLongitude = degrees + (minutes/60) + (seconds/3600);
      decimalLongitude = decimalLongitude.toFixed(4);

      if (direction == "west") {
        decimalLongitude = decimalLongitude * (-1);
      } else {}

      infoception = infoception + decimalLongitude + ",";

    })


    $('.latitude').first().filter(function(){
      var latitude = $(this).html();
      latitude = latitude.replace("&#xB0;", "d").replace("&#x2032;", "m").replace("&#x2033;", "sec");

      if (latitude.indexOf("n") > 0 || latitude.indexOf("N") > 0) {
        var direction = "north";
      } else {
        var direction = "south";
      } 

      latitude = latitude.substring(0, latitude.length - 1);

      degrees = latitude.replace(/d(.*)/g, "");
      if (degrees == "") {
        degrees = 0;
      } else {
        degrees = parseInt(degrees)
      }

      minutes = latitude.replace(/(.*)d/g, "").replace(/m(.*)/g, "");
      if (minutes == "") {
        minutes = 0;
      } else {
        minutes = parseInt(minutes)
      }

      seconds = latitude.replace(/(.*)m/g, "").replace(/s(.*)/g, "");
      if (seconds == "") {
        seconds = 0;
      } else {
        seconds = parseInt(seconds);
      }

      var decimalLatitude = degrees+(minutes/60)+(seconds/3600);
      decimalLatitude = decimalLatitude.toFixed(4);

      if (direction == "south") {
        decimalLatitude = decimalLatitude * (-1);
      } else {}

      infoception = infoception+decimalLatitude;

    })

    console.log(infoception);

    csv2 = csv2+infoception+"\n";

    fs.writeFile('test-recursion2'+country+'.csv', csv2);
  
  })
  
}

