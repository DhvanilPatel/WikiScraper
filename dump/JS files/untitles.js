

  function third (playerBirthLocation, callback){
    for (m=0;m<10;m++) {

    console.log(playerBirthLocation);

    console.log(playerBirthLocation)
    console.log(playerBirthLocation[m])

      request({
        "url": playerBirthLocation[m]
        }, 

      function(err, resp, body){
        var $ = cheerio.load(body);  
        var cord;
        var lat;  
        var longi;

        console.log('csvadasdasdasdasdadass bumped')

        $('.latitude').first().filter(function(){
          var datas = $(this).html();
          console.log(datas)
        })

        $('.firstHeading').find('span').filter(function(){
          var firstHeading = $(this).html();
          console.log(firstHeading)
          coordinates = coordinates+ "," +firstHeading;
        })


      callback(null, 'done');
      })
    }
    //console.log(coordinates);
    //fs.writeFile('coordinates.csv', coordinates)

  }