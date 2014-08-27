nodejs-centroid
===============

Unofficial wrapper for Centroid Media API

[![Build Status](https://travis-ci.org/fvdm/nodejs-centroid.svg?branch=master)](https://travis-ci.org/fvdm/nodejs-centroid)

[Centroid Media](http://www.centroid.nl/)

[API documentation](http://api.centroidmedia.com/documentation.html)


Installation
------------

### With NPM

The version in the [NPM registry](https://npmjs.org/) is always the latest *stable* release. This also allows easy updating.

	npm install centroid
	

### From Github source

The Github repository is the most recent code, but may be *unstable*.

	npm install git+https://github.com/fvdm/nodejs-centroid


Configuration
-------------

You need API credentials to get access to the methods, which can be requested on the [Centroid website](http://api.centroidmedia.com/apply-for-an-api-key.html). When you have those, specify them in your code:

```js
var centroid = require('centroid')('apiKey', 'privateKey')
```

	apiKey      required  Your API key
	privateKey  required  Your private key
	timeout     option    Time limit to wait for response,
	                      default 10000 ms (10 sec)


Methods
-------

### callbackFunction ( err, [data] )

Each method requires the last parameters to be a `callback` *function*. This function receives the results or error when there is trouble.

When there is an error, `err` is `instanceof Error` with related information. When the request went fine, `err` is *null* and `data` is set.

```js
callbackFunction( err, data ) {
	if( ! err ) {
		console.log( data )
	} else {
		console.log( err )
		console.log( err.stack )
	}
}
```

### Errors

The `err` parameter can received these errors:

	Error: No API key         No apikey was provided
	Error: No private key     No privatekey was provided
	Error: Disconnected       The API disconnected too early
	Error: HTTP error         The API returned a HTTP error
	Error: No response        The API returned no data
	Error: Invalid response   The API returned invalid data
	Error: API error          The API returned an error
	Error: Request failed     The request cannot be made
	Error: No results         No results were returned


### Additional information

These properties can be provided in the `Error` instance. Not all of these are present in each type of error.

	.stack          The stack trace
	.message        The error message
	
	.httpCode       ie. 404
	.httpHeaders    Object with http headers
	.request        Object with request spec
	.requestError   The .request error
	.response       API response body
	.errorCode      API error code
	.errorString    API error message


Unlicense
---------

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org>
