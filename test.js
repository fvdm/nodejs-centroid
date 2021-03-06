var util = require ('util');

// Setup
// set env CENTROID_APIKEY and CENTROID_PRIVATEKEY (Travis CI)
var centroid = require ('./') (
  process.env.CENTROID_APIKEY || null,
  process.env.CENTROID_PRIVATEKEY || null,
  process.env.CENTROID_TIMEOUT || 10000
);

// handle exits
var errors = 0;
process.on ('exit', function () {
  if (errors === 0) {
    console.log ('\n\033 [1mDONE, no errors.\033 [0m\n');
    process.exit (0);
  } else {
    console.log ('\n\033 [1mFAIL, '+ errors +' error'+ (errors > 1 ? 's' : '') +' occurred!\033 [0m\n');
    process.exit (1);
  }
});

// prevent errors from killing the process
process.on ('uncaughtException', function (err) {
  console.log ();
  console.error (err.stack);
  console.trace ();
  console.log ();
  errors++;
});

// Queue to prevent flooding
var queue = [];
var next = 0;

function doNext () {
  next++;
  if (queue [next]) {
    queue [next] ();
  }
}

// doTest (passErr, 'methods', [
//   ['feeds', typeof feeds === 'object']
//])
function doTest (err, label, tests) {
  if (err instanceof Error) {
    console.error (label +': \033 [1m\033 [31mERROR\033 [0m\n');
    console.error (util.inspect (err, false, 10, true));
    console.log ();
    console.error (err.stack);
    console.log ();
    errors++;
  } else {
    var testErrors = [];
    tests.forEach (function (test) {
      if (test [1] !== true) {
        testErrors.push (test [0]);
        errors++;
      }
    });

    if (testErrors.length === 0) {
      console.log (label +': \033 [1m\033 [32mok\033 [0m');
    } else {
      console.error (label +': \033 [1m\033 [31mfailed\033 [0m ('+ testErrors.join (', ') +')');
    }
  }

  doNext ();
}


// API ACCESS
queue.push (function () {
  centroid.getCurrentRate (function (err, data) {
    if (err) {
      console.log ('API access: failed ('+ err.message +')');
      console.log ();
      console.log (err.stack);
      errors++;
      process.exit (1);
    } else {
      console.log ('API access: \033 [1mok\033 [0m');
      doNext ();
    }
  });
});

queue.push (function () {
  centroid.set.timeout = 1;
  centroid.getCurrentRate (function (err, data) {
    if (!err || err.message !== 'Request timeout') {
      console.log ('Timeout: failed ('+ centroid.set.timeout +' sec)');
      console.log ();
      console.log (err.stack);
      errors++;
      process.exit (1);
    } else {
      console.log ('Timeout: \033 [1mok\033 [0m');
      centroid.set.timeout = 10000;
      doNext ();
    }
  });
});

queue.push (function () {
  centroid.persons.getActiveSources ({country:'nl', lang:'nl'}, function (err, data) {
    doTest (err, 'persons.getActiveSources', [
      ['type', data instanceof Array],
      ['length', data.length >= 1],
      ['item type', data [0] instanceof Object],
      ['item prop', typeof data [0] .name === 'string']
    ]);
  });
});

queue.push (function () {
  centroid.persons.getPopularSources ({country:'nl', lang:'nl'}, function (err, data) {
    doTest (err, 'persons.getPopularSources', [
      ['type', data instanceof Array],
      ['length', data.length >= 1],
      ['item type', data [0] instanceof Object],
      ['item prop', typeof data [0] .name === 'string']
    ]);
  });
});

queue.push (function () {
  centroid.persons.getCategories ({country:'nl', lang:'nl'}, function (err, data) {
    doTest (err, 'persons.getCategories', [
      ['type', data instanceof Array],
      ['length', data.length >= 1],
      ['item type', data [0] instanceof Object],
      ['item prop', typeof data [0] .name === 'string']
    ]);
  });
});

queue.push (function () {
  centroid.persons.search(
    {
      country: 'us',
      lang: 'en',
      fullname: 'Barack Obama',
      sources: 'linkedin'
    },
    function (err, data) {
      doTest (err, 'persons.search', [
        ['type', data instanceof Array],
        ['length', data.length >= 1],
        ['item type', data [0] instanceof Object],
        ['item prop', typeof data [0] .name === 'string'],
        ['item results', data [0] .results instanceof Array],
        ['item result', data [0] .results [0] instanceof Object],
        ['item result url', typeof data [0] .results [0] .url === 'string']
      ]);
    }
  );
});


// Start the tests
queue [0] ();

function output (err, data) {
  console.log (require ('util') .inspect (err || data, {depth: 10, colors: true}));
}
