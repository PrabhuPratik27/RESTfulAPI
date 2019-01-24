//Helpers for various tasks

//Dependencies

const crypto = require('crypto');
const config = require('./config');
const https = require('https');
const querystring = require('querystring');

var helpers = {};

helpers.hash = function(password){
    if(typeof(password) == 'string' && password.length > 0){
        var hash = crypto.createHmac('sha256',config.hashingSecret).update(password).digest('hex');
        return hash;
    }
    else{
        return false;
    }
};

helpers.parseJSONtoObject = function (data){
    try{
        var obj = JSON.parse(data);
        return obj;
    }
    catch(e){
        return {};
    }
};

//Create a string of random alphanum characters 
helpers.createRandomString= function(strlen){
    strlen = typeof(strlen)  =='number' ? strlen : false;

    if(strlen){
        //Define all possible characters

        var possiblechar = 'abcdefghijklmnopqrstuvwxyz0123456789';

        var str = '';

        for(i=1;i<=strlen;i++){
            var randomChar = possiblechar.charAt(Math.floor(Math.random()*possiblechar.length));

            str += randomChar
        }

        return str;
    }
    else{
        return false;
    }
}

helpers.sendTwiliosms = function(phone,message,callback){

    //validate the parameters

    phone = typeof(phone) == 'string' && phone.trim().length == 10 ? phone.trim() : false;

    message = typeof(message) == 'string' && message.trim().length > 0 && message.trim().length < 1600 ? message.trim():false;

    if(phone && message){
        //Configure the request payload to send to Twilio

        var payload = {
            "From" : config.twilio.fromPhone,
            "To" : "+1"+phone,
            "Body" : 'message'
        }

        var payloadString = querystring.stringify(payload);

        var requestDetails = {
            'protocol' :'https',
            'hostname' : 'api.twilio.com',
            'method' : 'POST',
            'path' : '/2010-04-01/Accounts/'+config.twilio.accountsid+'/Messages.json',
            'auth' : config.twilio.accountsid+':'+config.twilio.authToken,
            'headers' : {
                'Content-Type' : 'application/x-www-form-urlencoded',
                'Content-Length' : Buffer.byteLength(payloadString)
            }
        };

        var req = https.request(requestDetails,function(res){
            var status = res.statusCode;

            if(status == 200 || status == 201){
                callback(false);
            }
            else{
                callback('Status code returned was '+status);
            }
        });

        req.on('error',function(e){
            callback(e);
        });

        req.write(payloadString);

        req.end();
    }
    else{
        callback('Given parameters were missing or invalid');
    }
}


module.exports = helpers;