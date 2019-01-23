//Helpers for various tasks

//Dependencies

const crypto = require('crypto');
const config = require('./config');

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


module.exports = helpers;