var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var url = ["http://en.wikipedia.org/wiki/Category:Argentine_footballers"];
var link = [];
var counter;
var alphabetsContd = "";
var playerName = "";
var pageLink =["http://en.wikipedia.org/wiki/Category:Argentine_footballers"];

for (counter=0; counter < 10; counter++) {

  
  request({
            "url": pageLink[counter]
      },  

      function(err, resp, body){
      var $ = cheerio.load(body);  
      var data ="";
      var href ="";

        $("#mw-pages").find("a").filter(function(){return $(this).text() == "next 200";}).first().each(function(){
          href = $(this).attr('href');
          href = 'http://en.wikipedia.org' +href;
          console.log(href);
          pageLink.push(href);
        })
      });
}

      





var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var url = ["http://en.wikipedia.org/wiki/Category:Spain_international_footballers",
           "http://en.wikipedia.org/w/index.php?title=Category:Spain_international_footballers&pagefrom=Giner%2C+Fernando%0AFernando+Giner#mw-pages",
           "http://en.wikipedia.org/w/index.php?title=Category:Spain_international_footballers&pagefrom=Peiro%2C+Joaquin%0AJoaqu%C3%ADn+Peir%C3%B3#mw-pages"];
var link = [];
var playerNames = [];
var playerHeights = [];
var playerAges = [];
var csv = "Playername,Age\n";
var jsondetails = { Name : "", Hyperlink : "", Age : "", Height : ""};
var counter;
var alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
var alphabetsContd = "";
var playerName = "";



for (counter=0; counter < 3; counter++) {

  request({
          "url": url[counter]
      },  

      function(err, resp, body){
  	  var $ = cheerio.load(body);  
  	  var data ="";

      for (i = 0; i < 26; i++) {

        var href = "";  // href is just used for storing the links. Used at multiple locations. 


        $("h3").filter(function(){return $(this).text() === alphabets.charAt(i);}).next('ul').find('li').find('a').each(function(index,item){
          href = $(this).attr('href');
          href = 'http://en.wikipedia.org' +href;
          jsondetails.Hyperlink = link;
          link.push(href);
          console.log(href);
        });
      }

      for (i=0; i<26; i++) {

        alphabetsContd = alphabets.charAt(i)+ " cont.";

        $("h3").filter(function(){return $(this).text() === alphabetsContd;}).next('ul').find('li').find('a').each(function(index,item){
          href = $(this).attr('href');
          href = 'http://en.wikipedia.org' +href;
          console.log(href);
          link.push(href);
          jsondetails.Hyperlink = link;
        });
      }


      for (i = 0; i < link.length; i++) { 

        var playerURL = link[i];

        request({
                "url": playerURL
            }, 

            function(err, resp, body){
            var $ = cheerio.load(body);  
            var data ="";
            var playerHeight = "";
            var playingYear = "";
            var temporary = 0;  // This is used as a not-find switch. Need a better idea. 

              $('h1').find('span').filter(function(){
                playerName = $(this);
                playerName = playerName.html();
                console.log(playerName);
                csv = csv+playerName+ ","
                playerNames.push(playerName);
                jsondetails.Name = playerNames;
              })

              $('.ForceAgeToShow').filter(function(){     
                var data = $(this);
                var playerAge = data.html().slice(10,12);
                //csv = csv+playerAge+ ","
                playerAges.push(playerAge);
                jsondetails.Age = playerAges;
                temporary = 1;
               });

              // Putting "," if it doesnt find age of the player
              if (temporary == 0) {
                //csv = csv+ ",";
              }
              else {}
              temporary = 0; 
              

              /*Finding Player's height*/ 

              var playerHeight = 0;             

              $('th:contains(Height)').parents('tr').find('td').filter(function(){
                var data = $(this);
                playerHeight = data.html().slice(0,4);
                csv = csv+playerHeight;
                temporary = 1;
                playerHeights.push(playerHeight);
                jsondetails.Height = playerHeights;
              });

              // Putting "," if it doesnt find age of the player
              if (playerHeight == 0) {
                console.log('ulalalalalajskdhaskjdhakjsdhkajshdaskjdhkajsdhkash');
                csv = csv.replace("\n"+playerName+",","");
                console.log(csv);
              }
              else {}
              temporary = 0; 

              
              /*Finding the numbers of years the player played for Spainish National team*/

              $('td').find('a').filter(function(){return $(this).html() == "Spain";}).first().parent().filter(function(){
                $(this).prev().find('span').filter(function(){
                  playingYear = $(this);
                  playingYear = playingYear.html().replace("&#x2013;", "-").slice(0,9);
                  temporary = 1;
                  
                  //csv = csv+playingYear+",";  // Has to be before Average year is calculated 
                  
                  var averageYear = playingYear.replace( /^\D+/g, '');  // averageYear is just a 8 digit number which is used to compute meanYear.
                  averageYear = playingYear.replace( "-", '');

                  /*Mean Year of playing for National Team Calculator*/

                  if ( averageYear > 100000 ) {
                    var initialYear = parseInt(averageYear.slice(0,4));
                    var endYear = parseInt(averageYear.slice(4,8));
                    var meanYear = (initialYear+endYear)/2;
                    console.log(meanYear);  // Possiblity of 0.5 values. Look into it. 
                  }
                  else if ( averageYear < 2100 ) {
                    var meanYear = parseInt(averageYear.slice(0,4));
                  }
                  else {
                    meanYear = "";
                  }

                  //csv = csv+meanYear+","; // Bumping into csv

                })


                // Putting "," if it doesnt find age of the player
                if (temporary == 0) {
                  //csv = csv+ ",,";
                }
                else {}
                temporary = 0; 



                $(this).next().filter(function(){
                  var appearances = $(this).html();
                  console.log(appearances);
                  temporary = 1;
                  //csv = csv+appearances+",";    
                })

                if (temporary == 0) {
                  //csv = csv+ ",";
                }
                else {}
                temporary = 0; 

                $(this).next().next().filter(function(){
                  var goals = $(this).html();
                  goals = goals.replace("(","");
                  goals = goals.replace(")","");
                  temporary = 1;
                  console.log(goals);
                  //csv = csv+goals+"";    
                })

                if (temporary == 0) {
                  //csv = csv+ "";
                }
                else {}
                temporary = 0; 

              });

              

              csv = csv+ "\n"; // CSV is the file where all the data is added. 

            fs.writeFile('argentina.csv', csv);               
          }); 
      }

    link = []; // Important! To erase the link array of the hyperlinks from one List-Page. 

  })

}

