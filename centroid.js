var crypto = require('crypto')
var http = require('http')
var querystring = require('querystring')

// Defaults
var app = {
  set: {
    apihost: 'api.centroidmedia.com',
    apikey: null,
    privatekey: null
  },
  currentRate: 0
}


// Persons
app.persons = {}

app.persons.getCurrentRate = function( callback ) {
  talk( 'persons', 'getCurrentRate', function( err, data ) {
    if( ! err ) {
      if( data.query === undefined || data.query.currentRate === undefined ) {
        callback( new Error('Invalid response') )
      } else {
        callback( null, data.query.currentRate )
      }
    } else {
      callback( err )
    }
  })
}

app.persons.getActiveSources = function( params, callback ) {
  talk( 'persons', 'getActiveSources', params, function( err, data ) {
    if( ! err ) {
      if( ! data.sources instanceof Array ) {
        callback( new Error('Invalid response') )
      } else if( data.sources.length === 0 ) {
        callback( new Error('No results') )
      } else {
        callback( null, data.sources )
      }
    } else {
      callback( err )
    }
  })
}

app.persons.getPopularSources = function( params, callback ) {
  talk( 'persons', 'getPopularSources', params, function( err, data ) {
    if( ! err ) {
      if( ! data.sources instanceof Array ) {
        callback( new Error('Invalid response') )
      } else if( data.sources.length === 0 ) {
        callback( new Error('No results') )
      } else {
        callback( null, data.sources )
      }
    } else {
      callback( err )
    }
  })
}

app.persons.getCategories = function( params, callback ) {
  talk( 'persons', 'getCategories', params, function( err, data ) {
    if( ! err ) {
      if( ! data.categories instanceof Array ) {
        callback( new Error('Invalid response') )
      } else if( data.categories.length === 0 ) {
        callback( new Error('No results') )
      } else {
        callback( null, data.categories )
      }
    } else {
      callback( err )
    }
  })
}

app.persons.search = function( params, callback ) {
  talk( 'persons', 'search', params, function( err, data ) {
    if( ! err ) {
      if( ! data.sources instanceof Array ) {
        callback( new Error('Invalid response') )
      } else if( data.sources.length === 0 ) {
        callback( new Error('No results') )
      } else {
        callback( null, data.sources )
      }
    } else {
      callback( err )
    }
  })
}


// communicate
function talk( category, path, params, callback ) {
  if( typeof params === 'function' ) {
    var callback = params
    var params = {}
  }
  
  // check credentials
  if( typeof app.set.apikey !== 'string' || app.set.apikey === '' ) {
    callback('No API key')
    return
  }
  
  if( typeof app.set.privatekey !== 'string' || app.set.privatekey === '' ) {
    callback('No private key')
    return
  }
  
  // sign
  var signature = Date.now()
  var md5 = crypto.createHash('md5')
  md5.update( app.set.privatekey + signature )
  var api_sig = md5.digest('hex')
  
  // build request
  params.api_key = app.set.apikey
  params.api_sig = api_sig
  params.signature = signature
  params.format = 'json'
  
  var options = {
    host: category +'.'+ app.set.apihost,
    path: '/'+ path +'?'+ querystring.stringify( params ),
    method: 'GET'
  }
  
  var request = http.request( options )
  
  // process response
  request.on( 'response', function( response ) {
    var data = ''
    var complete = false
    
    response.on( 'data', function( ch ) { data += ch })
    
    response.on( 'close', function() {
      if( ! complete ) {
        complete = true
        callback( new Error('Disconnected') )
      }
    })
    
    response.on( 'end', function() {
      if( ! complete ) {
        complete = true
        data = data.toString('utf8').trim()
        var err = null
        
        // API error
        if( response.statusCode >= 300 ) {
          var err = new Error('API error')
        } else if( data == '' ) {
          var err = new Error('No response')
        } else if( ! data.match( /^\{.*\}$/ ) ) {
          var err = new Error('Invalid response')
        } else {
          data = JSON.parse( data )

          if( data.errorCode !== undefined ) {
            var err = new Error('API error')
            err.errorCode = data.errorCode
            err.errorString = data.errorString
          }

          // store rate limit
          if( data.query !== undefined && data.query.currentRate !== undefined ) {
            app.currentRate = data.query.currentRate
          }
        }

        if( err instanceof Error ) {
          err.httpCode = response.statusCode
          err.httpHeaders = response.headers
          err.request = options
          err.response = data
          callback( err )
        } else {
          callback( null, data )
        }
      }
    })
  })
  
  // request failed
  request.on( 'error', function( error ) {
    var err = new Error('Request failed')
    err.request = options
    err.requestError = error
    callback( err )
  })
  
  // finish
  request.end()
}


// setup
module.exports = function( apikey, privatekey ) {
  app.set.apikey = apikey || null
  app.set.privatekey = privatekey || null
  return app
}