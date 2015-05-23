/*
Name:          centroid
Description:   Unofficial node.js module for the Centroid Media API.
Author:        Franklin van de Meent (https://frankl.in)
Source code:   https://github.com/fvdm/nodejs-centroid
Feedback:      https://github.com/fvdm/nodejs-centroid/issues
License:       Unlicense / Public Domain
               see UNLICENSE file

Service name:  Centroid Media (http://www.centroid.nl)
Service docs:  http://api.centroidmedia.com/documentation.html
*/

var http = require ('httpreq');
var crypto = require ('crypto');


// Defaults
var app = {
  set: {
    apihost: 'api.centroidmedia.com',
    apikey: null,
    privatekey: null,
    timeout: 10000
  },
  currentRate: 0
};


// Persons
app.persons = {};

app.getCurrentRate = function (callback) {
  talk ('persons', 'getCurrentRate', function (err, data) {
    fixData (err, data, ['query', 'currentRate'], callback);
  });
};

app.persons.getActiveSources = function (params, callback) {
  talk ('persons', 'getActiveSources', params, function (err, data) {
    fixData (err, data, ['sources'], callback);
  });
};

app.persons.getPopularSources = function (params, callback) {
  talk ('persons', 'getPopularSources', params, function (err, data) {
    fixData (err, data, ['sources'], callback);
  });
};

app.persons.getCategories = function (params, callback) {
  talk ('persons', 'getCategories', params, function (err, data) {
    fixData (err, data, ['categories'], callback);
  });
};

app.persons.search = function (params, callback) {
  talk ('persons', 'search', params, function (err, data) {
    fixData (err, data, ['sources'], callback);
  });
};


// fix data
function fixData (err, data, props, callback) {
  if (err) { return callback (err); }
  var i;
  for (i = 0; i < props.length; i++) {
    if (data && data [props [i]]) {
      data = data [props [i]];
    } else {
      return  callback (new Error ('Invalid Response'));
    }
  }
  callback (null, data);
}


// communicate
function talk (category, path, params, callback) {
  if (typeof params === 'function') {
    var callback = params;
    var params = {};
  }

  // check credentials
  if (!app.set.apikey) {
    return callback (new Error ('No API key'));
  }

  if( !app.set.privatekey) {
    return callback (new Error ('No private key'));
  }

  // sign
  var signature = Date.now ();
  var api_sig = crypto
    .createHash ('md5')
    .update (app.set.privatekey + signature)
    .digest ('hex');

  // build request
  params.api_key = app.set.apikey;
  params.api_sig = api_sig;
  params.signature = signature;
  params.format = 'json';

  http.get (
    'http://'+ category +'.'+ app.set.apihost +'/'+ path,
    {
      parameters: params,
      timeout: app.set.timeout,
      headers: {
        'User-Agent': 'centroid.js (https://github.com/fvdm/nodejs-centroid)'
      }
    },
    function (err, res) {
      if (err) { return callback (err); }
      var data = null;
      var error = null;

      try {
        data = JSON.parse (res.body);
      } catch (e) {
        error = new Error ('Invalid response');
      }

      if (data && !(data instanceof Object)) {
        error = new Error ('Invalid response');
      }

      if (data && data.errorCode) {
        error = new Error ('API error');
        error.errorCode = data.errorCode;
        error.errorString = data.errorString;
      }

      // store rate limit
      if (data && data.query && data.query.currentRate) {
        app.currentRate = data.query.currentRate;
      }

      if (error instanceof Error) {
        error.httpCode = res.statusCode;
        error.httpHeaders = res.headers;
        error.response = data;
        callback (error);
      } else {
        callback (null, data);
      }
    }
  );
}


// setup
module.exports = function (apikey, privatekey, timeout) {
  app.set.apikey = apikey || null;
  app.set.privatekey = privatekey || null;
  app.set.timeout = timeout || app.set.timeout;
  return app;
};
