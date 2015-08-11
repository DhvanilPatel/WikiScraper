var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var async = require('async'); 
var urlx =["http://en.wikipedia.org/wiki/Category:Argentina_international_footballers","http://en.wikipedia.org/w/index.php?title=Category:Argentina_international_footballers&pagefrom=Dezotti%2C+Gustavo%0AGustavo+Dezotti#mw-pages","http://en.wikipedia.org/w/index.php?title=Category:Argentina_international_footballers&pagefrom=Mata%2C+Vicente+de+la%0AVicente+de+la+Mata#mw-pages","http://en.wikipedia.org/w/index.php?title=Category:Argentina_international_footballers&pagefrom=Siviski%2C+Dario%0ADar%C3%ADo+Siviski#mw-pages"];
var playerNames = [];
var csv2 = "Playername,Age,Height,Position,Years Played,Mean Year,Appearances,Goals\n";
var csv = "Playername,Age,Height,Position,Years Played,Mean Year,Appearances,Goals\n";
var alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var alphabetsContd = "";
var playerBirthLocation = [];
var count = 0;
var href = "";  // href is just used for storing the links. Used at multiple locations. 
var coordinates ="";
var link = [];
var country = "Argentina";
var pageUrl = "http://en.wikipedia.org/wiki/Category:Argentina_international_footballers";
var playerName = "";

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
       
        fs.writeFile('linksa.txt', link);

        findingInfo();

        link = [];
        
        $("a:contains(next 200)").first().filter(function(){
          var hur = $(this).attr('href');
          hur = 'http://en.wikipedia.org' +hur;
          console.log(hur);
          findingLinks(hur);  
        })

    })

}


function findingInfo(){

  for (k = 0; k < 15; k++) { 

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
          info = info+playerName+ ",";
        })

        var playerAge = "";

        $('.ForceAgeToShow').filter(function(){     
          var data = $(this);
          playerAge = data.html().slice(10,12);
          info = info+playerAge+ ",";
         });

        /*Finding Player's height*/ 

        $('th:contains(Height)').parents('tr').find('td').filter(function(){
          var data = $(this);
          playerHeight = data.html().slice(0,4);
          playerHeight = playerHeight.replace(/[^0-9^.]/g, 'p')     // Replaces all the not 0-9 and . letters into p which is later done away with. 
        });

        $('th:contains(Playing position)').parents('tr').find('td').first().filter(function(){
          var data = $(this);
          playerPosition = data.text();
          
          playerPosition = playerPosition.split(",").join(""); // Clean up for multiple entries.
          playerPosition = playerPosition.trim();
          playerPosition = playerPosition.toLowerCase();

          info = info+playerPosition+ ",";
        });

        if (playerPosition == "") {
          info = info+ ",";
        } else {}
        
        //They need to be outside. Otherwise they are undefined outside filter.function()
        var averageYear = 0;
        var meanYear = 0;
        var goals = 0;
        var appearances = 0;
        var playingYear = "";
        var meanYear = "";
        var appearances = "";
        var goals = "";

        var famousLevel = ""; //This is a three-way switch which indicates whether the player has 'Honours' and 'Teams Managed' sections in .infobox

      
        //For players without both Honours and Team managed sections
        $('.infobox').find('td').find('a').filter(function(){return $(this).attr('href') == "/wiki/"+country+"_national_football_team";}).last().parent().filter(function(){

          $(this).prev('th').find('span').first().filter(function(){
            playingYear = $(this).html();

            if (playingYear.length == 4 || playingYear == "") {
              meanYear = playingYear;
              info = info+playingYear+",";
              info = info+meanYear+",";
            }
            else {
              playingYear = playingYear.replace("&#x2013;", "-").replace(",  ", "-").replace(", ", "-");  // A fix for idiots who shouldn't be allowed to contribute to Wikipedia
              playingYear = playingYear.slice(0,9); 

              if (playingYear.search(/[^0-9^-]/g) > -1 || playingYear == "") {
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

                info = info+playingYear+",";
                info = info+meanYear+",";

              }
            }
          })


          $(this).next().filter(function(){
            appearances = $(this).html();

            if (appearances == "" || appearances.search(/[^0-9]/g) > -1) {
              appearances = "";
            } else {
              info = info+appearances+",";    
            }  
          })

        });

        if (appearances == "" || appearances.search(/[^0-9]/g) > -1) {
          info = info+",";
        } else {}

        info = info.split("?").join("");

        $('.birthplace').find('a').first().filter(function(){     
          var data = $(this).attr('href');
          playerBirthLocation = data;
          playerBirthLocation = 'http://en.wikipedia.org' +playerBirthLocation;
          
          console.log(playerBirthLocation);
          
          locationCoordinates(playerBirthLocation, info);

        });


        /* if (playerAge == ""){
          info = "";             
        }
        else { }*/

      // Hard deleters
      //    |
      // To be added


      csv = csv+info+"\n";
      info = "";

      fs.writeFile('test.csv', csv);
      
    })
  
  }
  console.log('congrats');
}


function locationCoordinates(playerBirthLocation, info) {
  
  request({
    "url": playerBirthLocation
    }, 

  function(err, resp, body){
    var $ = cheerio.load(body);  

    $('.firstHeading').find('span').filter(function(){
      var firstHeading = $(this).html();
      console.log(firstHeading)
      info = info+firstHeading+","
    })

    $('.longitude').first().filter(function(){
      var longitude = $(this).html();
      longitude = longitude.replace("&#xB0;", "d").replace("&#x2032;", "m").replace("&#x2033;", "s");

      info = info+longitude+",asdasd"

      if (longitude.indexOf("e") > 0 || longitude.indexOf("E") > 0) {
        var direction = "east";
      } else if (longitude.indexOf("w") > 0 || longitude.indexOf("W") > 0) {
        var direction = "west";
      } else {}

      longitude = longitude.substring(0, longitude.length - 1);
      console.log(longitude)

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
        console.log(seconds)
      }

      info = info+degrees+seconds+minutes;
      info = info+ "-" +direction+ "-"

    })


    $('.latitude').first().filter(function(){
      var latitude = $(this).html();
      latitude = latitude.replace("&#xB0;", "d").replace("&#x2032;", "m").replace("&#x2033;", "sec");

      info = info+latitude+","

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

      info = info+decimalLatitude;

    })

    csv2 = csv2+info+"\n";

    fs.writeFile('testis.csv', csv2);
  
  })
  
}

