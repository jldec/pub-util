/**
 * pub-util.js
 * Utility toolbelt based on underscore for pub-server and other pub-* packages
 *
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
**/

var util = require('util');
var path = require('path');
var querystring = require('querystring');
var _ = require('underscore');
var ms = require('ms');

_.mixin({
  date:            require('date-plus'),
  inspect:         util.inspect,       // simple multi-level object inspector from node
  format:          util.format,        // simple sprintf from node
  inherits:        util.inherits,      // prototypal inheritance from node
  isError:         util.isError,       // Error typecheck from node
  str:             str,                // fast coerce to string (non-truthy objects including 0 return '')
  formatCurrency:  formatCurrency,     // $x,xxx.xx
  slugify:         slugify,            // convert name to slugified url
  unslugify:       unslugify,          // split('-') cap1 join(' ')
  isRootLevel:     isRootLevel,        // tests whether path string is root level e.g. /foo
  parentHref:      parentHref,         // return parent href given href
  escapeRegExp:    escapeRegExp,       // make a string safe to regexp match
  grep:            grep,               // sugar for new RegExp(_.map(s.split(/\s/), escapeRegExp).join('.*'), "i")
  parseHref:       parseHref,          // decompose href into {path: fragment:} by looking for #
  merge:           merge,              // return a after mixing in all the properties of b
  diff:            diff,               // returns props from b different (or missing) in a
  mergeDiff:       mergeDiff,          // like merge with support for tombstones (deletes)
  parsePrice:      parsePrice,         // return number given a formatted price (ignores '$') - fails with NaN
  isNumber:        isNumber,           // returns false for NaN
  parseUrlParams:  parseUrlParams,     // parse the query string part of a url and return object
  urlParams:       urlParams,          // return the query string part of the url between ? and #
  urlPath:         urlPath,            // return url minus everything starting from the first ? or #
  uqt:             encodeURIComponent, // simple shorthand
  csv:             csv,                // return string of comma separated values
  csvqt:           csvqt,              // escape csv string value
  htmlify:         htmlify,            // minimal html object inspector
  hbreak:          hbreak,             // replaces /n with <br> and escapes the rest
  stringifiable:   stringifiable,      // safe JSON object inspector
  cap1:            cap1,               // capitalize first letter of a string
  topLevel:        topLevel,           // return top level of a path string
  origin:          origin,             // return origin part of a url
  trim:            trim,               // remove whitespace from start or end
  join:            join,               // join url or fs path segments without replacing // in http://
  pathOpt:         pathOpt,            // resolve paths and return opt in the form [{path:x},...]
  timer:           timer,              // simple ms timer
  setaVal:         setaVal,            // set property value using array if it already exists
  getaVals:        getaVals,           // return array of values for a property or [] if none exists
  ms:              ms,                 // convert string to ms
  throttleMs:      throttleMs,         // _.throttle with ms string
  setIntervalMs:   setIntervalMs,      // setInterval with ms string
  setTimeoutMs:    setTimeoutMs,       // setTimeout with ms string
  maybe:           maybe,              // return f || noop
  onceMaybe:       onceMaybe           // return once(maybe(f))
});

_.templateSettings = { interpolate: /\{\-\{(.+?)\}\-\}/g, escape: /\{\{(.+?)\}\}/g, evaluate: /\|(.+?)\|/g };

module.exports = _;

// fast coerce to string - careful with 0
function str(s) { return s ? ''+s : ''; }

function formatCurrency(x) {
  var a = Number(x).toFixed(2).split('.');
  a[0] = a[0].split('').reverse().join('').replace(/(\d{3})(?=\d)/g, '$1,').split('').reverse().join('');
  return '$' + a.join('.');
}

// decompose href into {path: fragment:} by looking for #
function parseHref(href) {
  var match = str(href).match(/([^#]*)(#.*)/)
  if (!match) return { path:href };
  return { path:match[1], fragment:match[2] };
}

// escape regexp special characters
function escapeRegExp(s) {
  return str(s).replace(/[\\^$.*+?|{[()]/g, "\\$&");
};

// search for 1 or more words (must match all words in order)
function grep(s) {
  return new RegExp(_.map(str(s).split(/\s/), escapeRegExp).join('.*'), "i")
}

// convert names to slugified url strings
// opts.noprefix => remove leading numbers
// opts.mixedCase => don't lowercase
// opts.allow => string of additional characters to allow
function slugify(s, opts) {
  opts = opts || {};
  s = str(s);
  if (!opts.mixedCase) { s = s.toLowerCase(); }
  return s
    .replace(/&/g, '-and-')
    .replace(/\+/g, '-plus-')
    // .replace(/'s /g, 's ') don-t like theres, there-s is better
    .replace((opts.allow ?
      new RegExp('[^-a-zA-Z0-9' + escapeRegExp(opts.allow) + ']+', 'g') :
      /[^-a-zA-Z0-9]+/g), '-')
    .replace(/--+/g, '-')
    .replace(/^-([^\.])/, '$1')
    .replace(/([^\.])-$/, '$1');
}

// convert names to slugified url strings (NOTE . and _ are preserved)
function unslugify(s) {
  return _.map(str(s).split('-'), cap1).join(' ');
}

// tests whether path is root level e.g. /foo -- returns false for /
function isRootLevel(path){
  return /^\/[^\/]+$/.test(str(path));
}

// return parent href given href - returns null for / or href without /
function parentHref(href) {
  var pmatch = str(href).match(/(.*)\/.+/);
  return pmatch && (pmatch[1] || '/');
}

// return top level of a path string
function topLevel(href) {
  var pmatch = str(href).match(/^\/?([^\/]*)/);
  return pmatch[1];
}

// return string with first letter capitalized
function cap1(s) {
  s = str(s);
  return s.slice(0,1).toUpperCase() + s.slice(1);
}

// return object a after merging into it all the properties of object b
// uses side-effect to overwrite a
function merge(a, b) {
  var key;
  if (a && b) {
    for (key in b) {
      if (b.hasOwnProperty(key)) { a[key] = b[key]; }
    }
  }
  return a;
};

// return 'diff' object with the props from object b which are different (or missing) in object a
// includes tombstone value === undefined for props which exist in object a but not in object b,
function diff(a, b) {
  var diff = {};
  var key;
  for (key in b) { if (b.hasOwnProperty(key) && b[key] !== a[key]) { diff[key] = b[key]; }}
  for (key in a) { if (a.hasOwnProperty(key) && !(key in b)) { diff[key] = undefined; }}
  return diff;
}

// just like merge() but use a diff object to overwrite or delete properties of object a
// deletes properties whose value in the diff === undefined (apply the tombstone)
function mergeDiff(a, diff) {
  var key, val
  if (a && diff) {
    for (key in diff) { if (diff.hasOwnProperty(key)) {
      val = diff[key];
      if (val === undefined) {
        delete a[key];
      } else {
        a[key] = val;
      }
    }}
  }
  return a;
}


// return JSON.stringifiable object for inspection (not for serialization)
function stringifiable(obj) {
  try { JSON.stringify(obj); return obj; }
  catch(e) { return util.inspect(obj); }
}


// return number given a price string
// ignores whitespace,  ',' and '$'
// null, undefined, and '' all fail with NaN
function parsePrice(s) {
  if (typeof s === 'number') return s;
  s = str(s).replace(/[\s,$]/g,'');
  return s ? Number(s) : NaN;
}

// reliably test for NaN (== and === NaN don't work) - TODO fix for infinity
function isNumber(x) { return (typeof x === 'number') && (x === x); }

function parseUrlParams(url) {
  return querystring.parse(urlParams(url).slice(1));
}

// return query part of url starting with ?
function urlParams(url) {
  return str(url).replace(/[^?]*(\??[^#]*).*/,'$1');
}

// return url minus everything starting from the first ? or #
function urlPath(url) {
  return str(url).replace(/([^?#]*).*/,'$1');
}

// minimal html object inspector
function htmlify(obj) {
  return '<pre>' + _.escape(util.inspect(obj)) + '</pre>'
}

// turns a vector into a single string of comma-separated values
function csv(arg) {
  return ( _.isArray(arg) ? arg :
           _.isObject(arg) ? _.values(arg) :
           [arg]).join(', ')
}

// return string surrounded by "" and embedded " doubled if it contains " or ,
function csvqt(s) {
  return /,|"/.test(s) ? '"' + str(s).replace(/"/g, '""') + '"' : s;
}

// return origin part of url i.e. http://hostname/... up to trailing /
// if pattern doesn't match, returns entire url
function origin(url) {
  return url.replace(/([^\/]+\/\/[^\/]+\/).*/,'$1');
}

function hbreak(s) {
  return _.escape(str(s)).replace(/[\n\r]+/g, '<br>');
}

// TODO - make this more efficient
function trim(s) {
  return str(s).replace(/^\s*(.*?)\s*$/,'$1');
}

// path join which doesn't mess with the // in http://
function join(base) {
  var args = [].slice.call(arguments, 1);
  base = str(base);
  var m = base.match(/^(\w+:\/\/)(.*)/);
  if (m) {
    base = m[1];
    if (!m[2] && !args.join('')) { return base; }
    args.unshift(m[2]);
  }
  else {
    args.unshift(base);
    base = '';
  }
  return base + path.join.apply(this, _.map(args,str));
}

// return or mutate opt into the form [{path:x},...]
// resolve relative (or all) paths relative to basedir (if basedir)
// opt must be a string or an array of strings or objects

function pathOpt(opt, basedir, resolveAll) {

  opt = opt || [];

  if (!_.isArray(opt)) {
    opt = [ opt ];
  }

  _.each(opt, function(val, i) {

    if (typeof val === 'string') {
      opt[i] = val = { path: val };
    }

    if (val.path && basedir && /^\./.test(val.path)) {
      val.path = path.join(basedir, val.path);
    }

  })

  return opt;
}

function timer() {
  var start = _.now();
  // debug('timer %s start', str(start).slice(-5));
  return function() {
    var time = _.now() - start;
    // debug('timer %s took %sms', str(start).slice(-5), time);
    return time;
  }
}

// set prop k to v - convert to array and push if obj[k] exists
function setaVal(obj, k, v) {
  if (obj.hasOwnProperty(k)) {
    var val = obj[k];
    if (!_.isArray(val)) { obj[k] = [val]; }
    obj[k].push(v);
  }
  else { obj[k] = v; }
}

// return obj[k] values coerced to array
function getaVals(obj, k) {
  if (!obj.hasOwnProperty(k)) return [];
  var val = obj[k];
  if (!_.isArray(val)) return [val];
  return val;
}

function throttleMs(f, waitMs, options) {
  return _.throttle(f, ms(waitMs), options);
}

// note - no support for extra params
function setIntervalMs(f, waitMs) {
  return setInterval(f, ms(waitMs));
}

// note - no support for extra params
function setTimeoutMs(f, waitMs) {
  return setTimeout(f, ms(waitMs));
}

function onceMaybe(f) {
  return _.once(f || noop);
}

function maybe(f) {
  return f || noop;
}

function noop(){}