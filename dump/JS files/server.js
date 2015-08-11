var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var pageLink=[];
var url = ["http://en.wikipedia.org/wiki/Category:Spain_international_footballers"];




function repeato(far, asdas) {


  for (i = 0; i < 3; i++) { 



    console.log('wasda');

    request({

            "url": url[i]
        }, 

        function(err, resp, body){
    	  var $ = cheerio.load(body);  
    	  var title, release, rating;
    	  var json = { title : "", release : "", rating : ""};
    	  var strContent = "";
    	  var data ="";
    	  var number = 100;
        var manager = 0;
        console.log('wasda');

          $("#mw-pages").find("a").filter(function(){return $(this).text() == "next 200";}).first().each(function(){
            href = $(this).attr('href');
            href = 'http://en.wikipedia.org' +href;
            console.log(href);
            url.push(href);
          })
    	}); 
  }
};

rollercoaster.repeato();

