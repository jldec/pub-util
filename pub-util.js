/**
 * pub-util.js
 * Utility toolbelt based on lodash for pub-server and other pub-* packages
 *
 * copyright 2015-2020, Jürgen Leschner - github.com/jldec - MIT license
**/

var util = require('util');
var path = require('path');
var ppath = path.posix || path; // in browser path is posix
var querystring = require('querystring');
var _ = require('lodash');
var ms = require('ms');

_.mixin({
  date:            require('date-plus'),

  // lodash v3 compatibility
  all:             _.every,
  any:             _.some,
  backflow:        _.flowRight,
  callback:        _.iteratee,
  collect:         _.map,
  compose:         _.flowRight,
  contains:        _.includes,
  detect:          _.find,
  foldl:           _.reduce,
  foldr:           _.reduceRight,
  findWhere:       _.find,
  first:           _.head,
  include:         _.includes,
  indexBy:         _.keyBy,
  inject:          _.reduce,
  invoke:          _.invokeMap,
  modArgs:         _.overArgs,
  methods:         _.functions,
  object:          _.fromPairs,
  padLeft:         _.padStart,
  padRight:        _.padEnd,
  pairs:           _.toPairs,
  pluck:           _.map,
  rest:            _.tail,
  restParam:       _.rest,
  select:          _.filter,
  sortByOrder:     _.orderBy,
  trimLeft:        _.trimStart,
  trimRight:       _.trimEnd,
  trunc:           _.truncate,
  unique:          _.uniq,
  where:           _.filter,

  format:          util.format,        // simple sprintf from node
  inherits:        util.inherits,      // prototypal inheritance from node
  str:             str,                // fast coerce to string (non-truthy objects including 0 return '')
  formatCurrency:  formatCurrency,     // $x,xxx.xx
  slugify:         slugify,            // convert name to slugified url
  unslugify:       unslugify,          // split('-') cap1 join(' ')
  relPath:         relPath,            // return ../../ to the same path depth as input, ./ for none
  isRootLevel:     isRootLevel,        // tests whether path string is root level e.g. /foo
  parentHref:      parentHref,         // return parent href given href
  unPrefix:        unPrefix,           // return string minus prefix, if the prefix matches
  grep:            grep,               // sugar for new RegExp(_.map(s.split(/\s/), _.escapeRegExp).join('.*'), "i")
  parseHref:       parseHref,          // decompose href into {path: fragment:} by looking for #
  diff:            diff,               // return props from b different (or missing) in a
  mergeDiff:       mergeDiff,          // like merge with support for tombstones (deletes)
  parsePrice:      parsePrice,         // return number given a formatted price (ignores '$') - fails with NaN
  parseUrlParams:  parseUrlParams,     // parse the query string part of a url and return object
  urlParams:       urlParams,          // return the query string part of the url between ? and #
  urlPath:         urlPath,            // return url minus everything starting from the first ? or #
  uqt:             encodeURIComponent, // simple shorthand
  csv:             csv,                // return string of comma separated values
  scsv:            scsv,               // return string of semicolon separated values
  csvqt:           csvqt,              // escape csv string value
  htmlify:         htmlify,            // minimal html object inspector
  hbreak:          hbreak,             // replace /n with <br> and escapes the rest
  stringifiable:   stringifiable,      // safe JSON object inspector
  cap1:            cap1,               // capitalize first letter of a string
  topLevel:        topLevel,           // return top level of a path string
  origin:          origin,             // return origin part of a url
  join:            join,               // join url or fs path segments without replacing // in https://
  timer:           timer,              // simple ms timer (returns int)
  hrtimer:         hrtimer,            // simple sub-ms timer using process.hrtime or performance.now (returns float)
  setaVal:         setaVal,            // set property value using array if it already exists
  getaVals:        getaVals,           // return array of values for a property or [] if none exists
  ms:              ms,                 // convert string to ms
  throttleMs:      throttleMs,         // _.throttle with ms string
  setIntervalMs:   setIntervalMs,      // setInterval with ms string
  setTimeoutMs:    setTimeoutMs,       // setTimeout with ms string
  maybe:           maybe,              // return f || noop
  onceMaybe:       onceMaybe,          // return once(maybe(f))
  pad0:            pad0                // left pad with 0, default to length 2
});                             // mixins are not chainable by lodash

_.templateSettings.interpolate = /\{-\{(.+?)\}-\}/g;
_.templateSettings.escape = /\{\{(.+?)\}\}/g;
_.templateSettings.evaluate = /\|(.+?)\|/g;

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
  var match = str(href).match(/([^#]*)(#.*)/);
  if (!match) return { path:href };
  return { path:match[1], fragment:match[2] };
}

// search for 1 or more words (must match all words in order)
function grep(s) {
  return new RegExp(_.map(str(s).split(/\s/), _.escapeRegExp).join('.*'), 'i');
}

// convert names to slugified url strings containing only - . a-z 0-9
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
    .replace((opts.allow ?
      new RegExp('[^-.a-zA-Z0-9' + _.escapeRegExp(opts.allow) + ']+', 'g') :
      /[^-.a-zA-Z0-9]+/g), '-')
    .replace(/--+/g, '-')
    .replace(/^-(.)/, '$1')
    .replace(/(.)-$/, '$1');
}

// convert names to slugified url strings (NOTE . and _ are preserved)
function unslugify(s) {
  return _.trim(_.map(str(slugify(s)).split('-'), cap1).join(' ')) || s;
}

// return ../ for each path-level, ./ for non-absolute path or root level
function relPath(s) {
  s = str(s);
  var lvls = str(s).replace(/[^/]/g, '').slice(1);
  if (lvls.length < 1 || s.slice(0,1) !== '/') return '.';
  return '..' + _.toArray(lvls).join('..').slice(0,-1);
}

// tests whether path is root level e.g. /foo -- returns false for /
function isRootLevel(path){
  return /^\/[^/]+$/.test(str(path));
}

// return parent href given href
// replaces multiple / with single / but does not normalize ../
// returns null for / or href without /
// if noTrailingSlash, return parent path without the slash
// see tests for edge cases
function parentHref(href, noTrailingSlash) {
  href = str(href).replace(/\/\/+/g, '/');
  var pmatch = href.match(/(.*\/)[^/]+(\/$|$)/);
  return pmatch && (noTrailingSlash ? (pmatch[1].slice(0,-1) || '/') : pmatch[1]);
}

// return string minus prefix, if the prefix matches
function unPrefix(s, prefix) {
  s = str(s);
  if (!prefix) return s;
  if (s.slice(0, prefix.length) === prefix) return s.slice(prefix.length);
  return s;
}

// return top level of a path string
function topLevel(href) {
  var pmatch = str(href).match(/^\/?([^/]*)/);
  return pmatch[1];
}

// return string with first letter capitalized
function cap1(s) {
  s = str(s);
  return s.slice(0,1).toUpperCase() + s.slice(1);
}

// return shallow 'diff' object with the props from object b which are different (or missing) in object a
// includes tombstone value === undefined for props which exist in object a but not in object b,
function diff(a, b) {
  var diff = {};
  var key;
  for (key in b) { if (Object.prototype.hasOwnProperty.call(b,key) && b[key] !== a[key]) { diff[key] = b[key]; }}
  for (key in a) { if (Object.prototype.hasOwnProperty.call(a,key) && !(key in b)) { diff[key] = undefined; }}
  return diff;
}

// just like _.merge but use a diff object to overwrite or delete properties of object a
// deletes properties whose value in the diff === undefined (apply the tombstone)
function mergeDiff(a, diff) {
  var key, val;
  if (a && diff) {
    for (key in diff) { if (Object.prototype.hasOwnProperty.call(diff,key)) {
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
  return '<pre>' + _.escape(util.inspect(obj)) + '</pre>';
}

// turns a vector into a single string of comma-separated values
function csv(arg) {
  return xsv(arg, ', ');
}

// turns a vector into a single string of semicolon-separated values
function scsv(arg) {
  return xsv(arg, ';');
}

// turns a vector into a single string of x-separated values
function xsv(arg,sep) {
  return ( _.isArray(arg) ? arg :
           _.isObject(arg) ? _.values(arg) :
           [arg]).join(sep);
}

// return string surrounded by "" and embedded " doubled if it contains " or ,
function csvqt(s) {
  return /,|"/.test(s) ? '"' + str(s).replace(/"/g, '""') + '"' : s;
}

// return origin part of url i.e. https://hostname/... up to trailing /
// if pattern doesn't match, returns entire url
function origin(url) {
  return url.replace(/([^/]+\/\/[^/]+\/).*/,'$1');
}

function hbreak(s) {
  return _.escape(str(s)).replace(/[\n\r]+/g, '<br>');
}

// posix path join which doesn't mess with the // in https://
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
  return base + ppath.join.apply(this, _.map(args,str));
}


function timer() {
  var start = _.now();
  return function() {
    var time = _.now() - start;
    return time;
  };
}

function hrnow() {
  if (typeof process !== 'undefined' && process.hrtime) {
    var sns = process.hrtime();
    return (sns[0] * 1e3) + (sns[1] / 1e6);
  }
  // not accurate - see https://developer.mozilla.org/en-US/docs/Web/API/Performance/now
  if (typeof performance !== 'undefined' && performance.now) return performance.now();
  return _.now();
}

function hrtimer() {
  var start = hrnow();
  return function() {
    var time = hrnow() - start;
    return time;
  };
}

// set prop k to v - convert to array and push if obj[k] exists
function setaVal(obj, k, v) {
  if (Object.prototype.hasOwnProperty.call(obj,k)) {
    var val = obj[k];
    if (!_.isArray(val)) { obj[k] = [val]; }
    obj[k].push(v);
  }
  else { obj[k] = v; }
}

// return obj[k] values coerced to array
function getaVals(obj, k) {
  if (!Object.prototype.hasOwnProperty.call(obj,k)) return [];
  var val = obj[k];
  if (!_.isArray(val)) return [val];
  return val;
}

// note throttled functions require cancellation to avoid delaying node shutdown
// see test/throttle-5s.js
function throttleMs(f, waitMs) {
  return _.throttle(f, ms(waitMs), {leading:true, trailing:false});
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

function pad0(n, len) {
  return _.padStart(str(n), len || 2, '0');
}
