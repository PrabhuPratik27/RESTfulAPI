//Dependencies

const _data = require('./data');
const helpers = require('./helpers');

//Create handlers 

handlers ={};

handlers.notFound = function (data,callback) {
    callback(404);
};

handlers.ping = function(data,callback){
    callback(200);
};

handlers.users = function(data,callback) {
    var acceptable = ['post','get','put','delete'];

    if(acceptable.indexOf(data.method) > -1){
        handlers._users[data.method](data,callback);
    }
    else{
        callback(405);
    }
};

//Container for user submethods

handlers._users ={};

//Users POST

handlers._users.post = function(data,callback){
    //Check that all required fields are filled out

    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? data.payload.tosAgreement : false;

    if(firstName && lastName && password && phone && tosAgreement){
    
        //make sure that user doesn't already exist

        _data.read('users',phone,function(err,data){
            if(err){
                //Hash the password

                var hashedPassword = helpers.hash(password);

                //Create the user object

                if(hashedPassword){
                    var userObj = {
                        'firstName': firstName,
                        'lastName' : lastName,
                        'phone':phone,
                        'hashedPassword':hashedPassword,
                        'tosAgreement' : tosAgreement
                    }

                    // Store the user 

                    _data.create('users',phone,userObj,function(err){
                        if(!err){
                            callback(200);
                        }
                        else{
                            console.log(err);
                            callback(400,{'Error': 'A user with that phone number already exists'});
                        }
                    });
                }
                else{
                    callback(500,{'Error': 'Could not properly hash the password'});
                }
            }
            else{
                callback(400,{'Error':"A User with that phonenumber already exists"});
            }
        });
    }
    else{
        callback(400,{'Error': 'Missing Required fields'});
    }

};

//Users GET

handlers._users.get = function(data,callback){
    
    var phone = typeof(data.querystring.phone) == 'string' && data.querystring.phone.trim().length == 10 ? data.querystring.phone.trim() : false;
    
    //Get token from the headers
    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    console.log(token,phone);
    

    //Verify that token is for given phone no
    handlers._tokens.verifytoken(token,phone,function(tokenisValid){
        if(tokenisValid){

            if(phone){
                _data.read('users',phone,function(err,data){
                    if(!err && data){
                        delete data.hashedPassword;
                        callback(200,data);
                    }
                    else{
                        callback(404);
                    }
                });
            }
            else{
                callback(400,{'Error':'Missing required fields'});
            }        

        }
        else{
            callback(403,{'Error':'Missing token in header or token is invalid'});
        }
    });

};

//Users PUT

handlers._users.put = function(data,callback){

    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    handlers._tokens.verifytoken(token,phone,function(tokenisValid){

        if(tokenisValid){

            if(phone ){
                if(firstName || lastName || password){
                    _data.read('users',phone,function(err,data){
                        if(!err && data){
                            if(firstName){
                                data.firstName = firstName;
                            }
                            if(lastName){
                                data.lastName = lastName;
                            }
                            if(password){
                                data.hashedPassword = helpers.hash(password);
                            }
        
                            //Store the new updates
        
                            _data.update('users',phone,data,function(err){
                                if(!err){
                                    callback(200);
                                }
                                else{
                                    console.log(err);
                                    callback(500,{'Error':'Could not update user at the moment'});
                                }
                            });
                        }
                        else{
                            callback(400,{'Error':'The Specified user does not exist'});
                        }
                    });
                }
                else{
                    callback(400,{'Error':'Missing Fields to update'});
                }
            }
            else{
                callback(400,{'Error':"Missing required fields"});
            }

        }
        else{
            callback(403,{'Error':'Missing token in header or token is invalid'});
        }

    });

};

//Users DELETE

handlers._users.delete = function(data,callback){

    var phone = typeof(data.querystring.phone) == 'string' && data.querystring.phone.trim().length == 10 ? data.querystring.phone.trim() : false;

    var token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    handlers._tokens.verifytoken(token,phone,function(tokenisValid){
        if(tokenisValid){

            if(phone){
                _data.read('users',phone,function(err,data){
                    if(!err && data){
                        _data.delete('users',phone,function(err){
                            if(!err)
                            {
                                callback(200);
                            }
                            else{
                                callback(500,{'Error':'Could not delete the specified user'});
                            }
                        });
                    }
                    else{
                        callback(400,{'Error':'Could not find the specified user'});
                    }
                });
            }
            else{
                callback(400,{'Error':'Missing required fields'})
            }

        }
        else{
            callback(403,{'Error':'Missing token in header or token is invalid'});

        }
    });

};

//Tokens handlers

handlers.tokens = function(data,callback) {
    var acceptable = ['post','get','put','delete'];

    if(acceptable.indexOf(data.method) > -1){
        handlers._tokens[data.method](data,callback);
    }
    else{
        callback(405);
    }
};

//Container for tokens

handlers._tokens={};

//Tokens POST

handlers._tokens.post = function(data,callback){

    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    console.log(phone , password);

    if(phone && password){
        //Lookup for user with phone

        _data.read('users',phone,function(err,data){
            if(!err && data){
                var hashedPassword = helpers.hash(password);
                if(hashedPassword==data.hashedPassword){

                    var tokenid = helpers.createRandomString(20);

                    var expires = Date.now() + 1000*60*60;

                    var tokenObject = {
                        'phone' : phone,
                        'id' : tokenid,
                        'expires' : expires
                    }

                    _data.create('tokens',tokenid,tokenObject,function(err){
                        if(!err){
                            callback(200,tokenObject);
                        }
                        else{
                            callback(500,{'Error': 'Cannot generate token'});
                        }
                    });
                }
                else{
                    callback('400',{'Error':'Password did not match'});
                }
            }
            else{
                callback(400,{'Error':'Could not find the specifies user'});
            }
        });
    }
    else{
        callback(400,{'Error': 'Missing required fields'});
    }
};

//Tokens GET

handlers._tokens.get = function(data,callback){

    var id = typeof(data.querystring.id) == 'string' && data.querystring.id.trim().length == 20 ? data.querystring.id.trim() : false;

    if(id){
        _data.read('tokens',id,function(err,data){
            if(!err && data){
                callback(200,data);
            }
            else{
                callback(404);
            }
        });
    }
    else{
        callback(400,{'Error':'Missing required fields'});
    }

};

//Tokens PUT

handlers._tokens.put = function(data,callback){

    var id = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;
    
    var extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

    if(id && extend){
        _data.read('tokens',id,function(err,data){
            if(!err && data){
                if(data.expires > Date.now()){

                    data.expires = Date.now() + 1000*60*60;

                    _data.update('tokens',id,data,function(err){
                        if(!err){
                            callback(200);
                        }
                        else{
                            callback(500,{'Error':'Could not update the token expiration'});
                        }
                    });
                }
                else{
                    callback(400,{'Error': 'The token has expired'});
                }
            }
            else{
                callback(400,{'Error':'Token doesnt exist'});
            }
        });
    }
    else{
        callback(400,{'Error':'Missing or incorrect fields'});
    }

};

//Tokens DELETE

handlers._tokens.delete = function(data,callback){

    var id = typeof(data.querystring.id) == 'string' && data.querystring.id.trim().length == 20 ? data.querystring.id.trim() : false;

    if(id){
        _data.read('tokens',id,function(err,data){
            if(!err && data){
                _data.delete('tokens',id,function(err){
                    if(!err)
                    {
                        callback(200);
                    }
                    else{
                        callback(500,{'Error':'Could not delete the specified token'});
                    }
                });
            }
            else{
                callback(400,{'Error':'Could not find the specified token'});
            }
        });
    }
    else{
        callback(400,{'Error':'Missing required fields'})
    }

};

handlers._tokens.verifytoken = function(id,phone,callback){

    _data.read('tokens',id,function(err,data){
        if(!err && data){
            if(data.phone == phone && data.expires > Date.now()){
                callback(true);
            }
            else{
                callback(false);
            }
        }
        else{
            callback(false);
        }
    });
}

module.exports = handlers;