
function findingInfo(callback){

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

    
      //For players without both Honours and Team managed sections
      $('.infobox').find('td').find('a').filter(function(){return $(this).attr('href') == "/wiki/"+country+"_national_football_team";}).last().parent().filter(function(){

        console.log('inside');

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
          console.log('here');
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


      /* if (playerAge == ""){
        info = "";             
      }
      else { }*/

    // Hard deleters
    //    |
    // To be added

    info = info.split("?").join("");

    csv = csv+info+"\n";
    info = "";

    fs.writeFile('test.csv', csv);
    
    console.log('csvs bumped')

  })

}
console.log('congrats');
}


