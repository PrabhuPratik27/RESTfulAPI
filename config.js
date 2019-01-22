//Create and export config variables

// Container for all the environments

var environments = {};

//Staging(default) environment
environments.staging = {
    'port' : 3000,
    'envName' : 'staging'
};

//Producction environment
environments.production = {
    'port' : 5000,
    'envName' : 'production'
};

//Determine which should be exported out
var currentEnv =  typeof(process.env.NODE_ENV) == 'string'? process.env.NODE_ENV.toLowerCase() : '';

// Check that env is defined in environments

var currentEnvtoExport = typeof(environments[currentEnv]) == 'object'? environments[currentEnv] : environments.staging;

//Export the module
module.exports = currentEnvtoExport;