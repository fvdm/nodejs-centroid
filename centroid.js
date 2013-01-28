// ! init
var crypto = require('crypto'),
    http = require('http'),
    util = require('util'),
    querystring = require('querystring'),
    app = {
	set: {
		apihost:	'api.centroidmedia.com',
		apikey:		'',
		privatekey:	''
	},
	currentRate: 0
}


// ! Persons
app.persons = {}


// ! communicate
app.talk = function( category, path, params, callback ) {
	if( typeof params === 'function' ) {
		var callback = params
		var params = {}
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
		
		response.on( 'data', function( ch ) { data += ch })
		
		response.on( 'close', function() {
			callback( new Error('Disconnected') )
		})
		
		response.on( 'end', function() {
			data = data.toString('utf8').trim()
			var err = null
			
			if( response.statusCode >= 300 ) {
				var err = new Error('HTTP error')
			} else if( data == '' ) {
				var err = new Error('No response')
			} else if( ! data.match( /^\{.*\}$/ ) ) {
				var err = new Error('Invalid response')
			} else {
				// parse JSON
				data = JSON.parse( data )
				
				// API error
				if( data.errorCode !== undefined ) {
					var err = new Error('API error')
					err.errorCode = data.errorCode
					err.errorString = data.errorString
				}
				
				// store rate limit
				app.currentRate = data.query.currentRate || app.currentRate
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
		})
	})
	
	// request failed
	request.on( 'error', function( error ) {
		var err = new Error('Request failed')
		err.request = options
		err.details = error
		callback( err )
	})
	
	// finish
	request.end()
}


// ! export
module.exports = app
