//Create and export config variables

// Container for all the environments

var environments = {};

//Staging(default) environment
environments.staging = {
    'httpPort' : 3000,
    'httpsPort': 3001,
    'envName' : 'staging',
    'hashingSecret' : 'this is a secret',
    'maxchecks' : 5,
    'twilio' : {
        'accountSid' : 'ACb32d411ad7fe886aac54c665d25e5c5d',
        'authToken' : '9455e3eb3109edc12e3d8c92768f7a67',
        'fromPhone' : '+15005550006'
    }
};

//Producction environment
environments.production = {
    'httpPort' : 5000,
    'httpsPort' : 5001,
    'envName' : 'production',
    'hashingSecret' : 'this is also a secret',
    'maxchecks' : 5,
    'twilio' : {
        'accountsid' : '',
        'authToken' : '',
        'fromPhone' : '',
    }
};

//Determine which should be exported out
var currentEnv =  typeof(process.env.NODE_ENV) == 'string'? process.env.NODE_ENV.toLowerCase() : '';

// Check that env is defined in environments

var currentEnvtoExport = typeof(environments[currentEnv]) == 'object'? environments[currentEnv] : environments.staging;

//Export the module
module.exports = currentEnvtoExport;