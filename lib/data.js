//Library for storing and editing data

const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');

// Container object

var lib ={};

// Define base directory of the data folder

lib.baseDir = path.join(__dirname,'/../.data/');

lib.create = function(dir,filename,data,callback){
    //Open the file for writing

    fs.open(lib.baseDir+dir+'/'+filename+'.json','wx',function(err,fileDescriptor){
        if(!err && fileDescriptor){
            //Convert data to a string

            var dataString = JSON.stringify(data);

            fs.writeFile(fileDescriptor,dataString,function(err){
                if(!err){
                    fs.close(fileDescriptor,function(err){
                        if(!err){
                            callback(false);
                        }
                        else{
                            callback('Error closing new file');
                        }
                    });
                }
                else{
                    callback('Error writing to the new file')
                }
            });
        }
        else
        {
            callback('Could not create new file, it may already exist');
        }
    });
}

//Read data from a file

lib.read = function(dir,filename,callback){
    fs.readFile(lib.baseDir+dir+'/'+filename+'.json','utf8',function(err,data){
        if(!err && data){
            var parseddata = helpers.parseJSONtoObject(data);
            callback(false,parseddata);
        }
        else{
            callback(err,data);
        }
    });
};

//Update an existing file

lib.update = function(dir,filename,data,callback){
    fs.open(lib.baseDir+dir+'/'+filename+'.json','r+',function(err,fileDescriptor){
        if(!err && fileDescriptor){

            var dataString = JSON.stringify(data);

            fs.truncate(fileDescriptor,function(err){
                if(!err){
                    fs.writeFile(fileDescriptor,dataString,function(err){
                        if(!err){
                            fs.close(fileDescriptor,function(err){
                                if(!err){
                                    callback(false);
                                }
                                else{
                                    callback('There was an error closing the file');
                                }
                            });
                        }
                        else{
                            callback('Error writing to existing file');
                        }
                    });
                }
                else{
                    callback('Error truncatinf file');
                }
            });
        }else{
            callback('Could not open file for update it may not exist yet');
        }
    });
};

//Deleting a file

lib.delete = function(dir,filename,callback){
    //Unlink
    fs.unlink(lib.baseDir+dir+'/'+filename+'.json',function(err){
        if(!err)
        {
            callback(false);
        }
        else{
            callback('There was an error deleting file,it may not exist');
        }
    });
};

//Export the object

module.exports = lib;