var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var async = require('async'); 
var url =["http://en.wikipedia.org/wiki/Category:Argentina_international_footballers","http://en.wikipedia.org/w/index.php?title=Category:Argentina_international_footballers&pagefrom=Dezotti%2C+Gustavo%0AGustavo+Dezotti#mw-pages","http://en.wikipedia.org/w/index.php?title=Category:Argentina_international_footballers&pagefrom=Mata%2C+Vicente+de+la%0AVicente+de+la+Mata#mw-pages","http://en.wikipedia.org/w/index.php?title=Category:Argentina_international_footballers&pagefrom=Siviski%2C+Dario%0ADar%C3%ADo+Siviski#mw-pages"];
var playerNames = [];
var csv = "Playername,Age,Height,Position,Years Played,Mean Year,Appearances,Goals\n";
var alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var alphabetsContd = "";
var playerBirthLocation = [];
var count = 0;
var href = "";  // href is just used for storing the links. Used at multiple locations. 
var coordinates ="";
var link = [];
var country = "Argentina";

async.series([

  function one (callback){

    for (counter=0; counter < url.length; counter++) {
      console.log(url[counter])

      request({
            "url": url[counter]
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
         
        console.log(counter);
        fs.writeFile('links.txt', link); 
        
        setInterval(callback, 4000);

      })
    
    }

  },



  function hey(callback){

    for (k = 0; k < link.length; k++) { 

      var playerURL = link[k];

      request({
              "url": "http://en.wikipedia.org/wiki/Alfredo_Brown"
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
          var playingYear = "";
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

            $('th:contains('+famousLevel+')').parent().prev().filter(function(){

              $(this).find('th').find('span').first().filter(function(){

                playingYear = $(this).html();

                if (playingYear.length == 4) {
                  meanYear = playingYear;
                  info = info+playingYear+",";
                  info = info+meanYear+",";
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

              info = info+playingYear+","
              info = info+meanYear+","; // Bumping into csv

              $(this).find('td').next().first().filter(function(){
                appearances = $(this).html();

                

                if (appearances.indexOf("(") > 0) {

                } else {}

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

            $('.infobox').find('td').find('a').filter(function(){return $(this).attr('href') == "/wiki/"+country+"_national_football_team";}).last().parent().filter(function(){

              console.log('inside');
              $(this).prev('th').find('span').first().filter(function(){
                playingYear = $(this).html();

                if (playingYear.length == 4) {
                  meanYear = playingYear;
                  info = info+playingYear+",";
                  info = info+meanYear+",";
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
              
              info = info+playingYear+","
              info = info+meanYear+","; // Bumping into csv

              $(this).next().filter(function(){
                console.log('here');
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


          /* if (playerAge == ""){
            info = "";             
          }
          else { }*/
            
          $('.birthplace').find('a').first().filter(function(){     
            var data = $(this).attr('href');
            playerBirthLocationTemp = data;
            playerBirthLocationTemp = 'http://en.wikipedia.org' +playerBirthLocationTemp;
            console.log(playerBirthLocationTemp);


            if (playerBirthLocationTemp.indexOf("php") > -1 || playerBirthLocationTemp.indexOf("wiki/"+country) > -1) {
              playerBirthLocationTemp = "";
            }

            else {
              playerBirthLocation = playerBirthLocation+playerBirthLocationTemp;
            }

            //playerBirthLocation.push(playerBirthLocationTemp)
            
          });

        // Hard deleters
        //    |
        // To be added

        info = info.split("?").join("");

        csv = csv+info+"\n";
        info = "";

        fs.writeFile('argentinaaa.csv', csv);
        
        console.log('csvs bumped')

      })
    
    }
    console.log('congrats');
  },

])


