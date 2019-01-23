// Primary File for the API


// Dependencies

const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');

//Instatiating the http server

var httpserver = http.createServer(function(req,res){
    unifiedServer(req,res);
});

//Instantiate the https server

httpsServerOptions={
    'key': fs.readFileSync('./https/key.pem'),
    'cert': fs.readFileSync('./https/cert.pem')
};

var httpsserver = https.createServer(httpsServerOptions,function(req,res){
    undefinedServer(req,res);
});


//Start the server , and have it listen at port config.port
httpserver.listen(config.httpPort,function(){
    console.log("The server is listening on port " + config.httpPort);
});

httpserver.listen(config.httpsPort,function(){
    console.log("The server is listening on port " + config.httpsPort)
});

//All the server logic goes here

var unifiedServer = function (req,res) {
    // Get the url and parse import PropTypes from 'prop-types'
    var parsedUrl = url.parse(req.url,true);
    
    // Get the path from the url
    var path = parsedUrl.pathname;
    var trimmedpath = path.replace(/^\/+|\/+$/g, '');

    //Get the query string as an object

    var querystring = parsedUrl.query;

    // Get the http method
    var method = req.method.toLowerCase();

    //Get the headers as an object

    var headers =req.headers;
    
    // Get the payload if there is any

    var decoder = new StringDecoder('utf-8');
    var buffer = "";

    req.on('data',function(data){
        buffer+= decoder.write(data);
    });

    req.on('end',function(){

        buffer += decoder.end();

        var chosenhandler = typeof(router[trimmedpath]) !== 'undefined' ? router[trimmedpath] : handlers.notFound;

        //Construct the data object

        var data = {
            'trimmedpath' : trimmedpath,
            'querystring' : querystring,
            'method' : method,
            'headers' : headers,
            'payload': buffer
        };

        //Route the request to the specified handler

        chosenhandler(data,function(statusCode,payload){
            statusCode = typeof(statusCode) == 'number' ? statusCode:200;

            payload = typeof(payload) == 'object' ? payload : {};

            payloadString = JSON.stringify(payload);

            //Return the response

            res.setHeader('Content-Type','application/json');

            res.writeHead(statusCode);

            console.log("The data sent is : ",statusCode,payloadString);
            
            // Send the response

            res.end(payloadString);
        });

    });
}

//Create handlers 

handlers ={};

handlers.notFound = function (data,callback) {
    callback(404);
}

handlers.ping = function(data,callback){
    callback(200);
};

//Create a request router

var router = {
    'ping' : handlers.ping
};