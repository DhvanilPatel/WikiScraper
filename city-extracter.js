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

var soccerAholes = 0;

findingLinks(pageUrl);

function findingLinks (url){

  request({
        "url": url
    },  

    function(err, resp, body){

      var $ = cheerio.load(body); 
      var data ="";

      for (i = 0; i < 64; i++) {
     
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

      }
      
      fs.writeFile('links.txt', link);

      findingInfo();

      link = [];
      
  })
}



function findingInfo(){

  for (k = 0; k < link.length; k++) { 

    var playerURL = link[k];

    request({
            "url": playerURL
        }, 

      function(err, resp, body){


function locationCoordinates(playerBirthLocation, infoception) {    // infoception is the incepted form of info. Its actually info, but then its not quite info. :P
  
  request({
    "url": playerBirthLocation
  }, 

  function(err, resp, body){
    var $ = cheerio.load(body);  

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

    $('th:contains(Population)').parent().next().
      $(this).find('th')
    })

    console.log(infoception);

    csv2 = csv2+infoception+"\n";

    fs.writeFile('temporary dump/test-recursion2'+country+'.csv', csv2);
  
  })
  
}

