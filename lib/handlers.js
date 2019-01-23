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

};

//Users PUT

handlers._users.put = function(data,callback){

    var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;

    var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;

    var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

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
};

//Users DELETE

handlers._users.delete = function(data,callback){

    var phone = typeof(data.querystring.phone) == 'string' && data.querystring.phone.trim().length == 10 ? data.querystring.phone.trim() : false;

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
};

module.exports = handlers;