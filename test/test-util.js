/**
 * test pub-util
 * copyright 2015-2019, Jurgen Leschner - github.com/jldec - MIT license
**/

var test = require('tape');

var u = require('../pub-util');

test('u.timer', function(t){
  testTimer(t, u.timer());
});

test('u.hrtimer', function(t){
  testTimer(t, u.hrtimer());
});

function testTimer(t, timer) {
  t.equal(typeof timer, 'function');
  var t1 = timer();
  var t1b = timer();
  t.equal(typeof t1, 'number');
  process.nextTick(function() {
    var t2 = timer();
    t.equal(typeof t2, 'number');
    t.true(t2 >= t1);
    t.true(t2 >= t1b);
    t.end();
  });
}

test('u.date', function(t){
  t.equal(u.date('2014-04-02').addDays(2).valueOf(), (new Date(2014,3,4)).valueOf());
  t.end();
});

test('u.template', function(t){

  t.equal(u.template('{{a}}')({a:1}), '1');
  t.equal(u.template('{{a}}')({a:'<'}), '&lt;');
  t.equal(u.template('{{a+b}}')({a:'<', b:'>'}), '&lt;&gt;');
  t.equal(u.template('{{a+b}}')({a:'1', b:'2'}), '12');
  t.equal(u.template('{{a+b}}')({a:1, b:2}), '3');
  t.equal(u.template('{-{a}-}')({a:'<'}), '<');
  t.equal(u.template('{-{a+b}-}')({a:'<', b:'>'}), '<>');
  t.equal(u.template('{-{a+b}-}')({a:'1', b:'2'}), '12');
  t.equal(u.template('{-{a+b}-}')({a:1, b:2}), '3');
  t.equal(u.template('|print(a+b)|')({a:'<', b:'>'}), '<>');
  t.equal(u.template('|a=">"||print(a+b)|')({a:'<', b:'>'}), '>>');
  t.equal(u.template('|print(_.escape(a+b))|')({a:'<', b:'>'}), '&lt;&gt;');
  t.equal(u.template('|print(a+b)|')({a:1, b:2}), '3');
  t.equal(u.template('|_.each(rg,function(x){|{{x}}|})|')({rg:[1,2,3]}), '123');
  t.equal(u.template('|_.each(rg,function(x){| {{x}} |})|')({rg:[1,2,3]}), ' 1  2  3 ');
  t.equal(u.template('|_.each(rg,function(x){var evenodd = ((x%2) ? "odd" : "even");|<div class="{{evenodd}}">{{x}}</div>|})|')({rg:[1,2,3]}),
    '<div class="odd">1</div><div class="even">2</div><div class="odd">3</div>');
  t.equal(u.template('|_.each(rg,function(x,idx){var evenodd = ((idx%2) ? "even" : "odd");|<div class="{{evenodd}}">{{x}}</div>\n|})|')({rg:['a','b','c']}),
    '<div class="odd">a</div>\n<div class="even">b</div>\n<div class="odd">c</div>\n');
  t.end();
});

test('u.str', function(t){

  t.equal(u.str(0), '');

  t.equal(u.str(), '');
  t.equal(u.str(NaN), '');
  t.equal(u.str(null), '');
  t.equal(u.str(undefined), '');
  t.equal(u.str([]), [].toString());
  t.equal(u.str(/./), /./.toString());
  t.equal(u.str({}), {}.toString());
  t.equal(u.str(function(){}), (function(){}).toString());
  t.equal(u.str(Date()), Date().toString());

  t.equal(u.str(-1), '-1');
  t.equal(u.str(1), '1');
  t.equal(u.str('abc'), 'abc');
  t.end();
});


test('u.formatCurrency', function(t) {

  t.equal(u.formatCurrency(1499), '$1,499.00');
  t.equal(u.formatCurrency(0), '$0.00');
  t.equal(u.formatCurrency(9.99), '$9.99');
  t.equal(u.formatCurrency(-0.99), '$-0.99');
  t.equal(u.formatCurrency(-9999), '$-9,999.00');

  t.equal(u.formatCurrency(null), '$0.00');
  t.equal(u.formatCurrency(undefined), '$NaN');
  t.equal(u.formatCurrency('booger'), '$NaN');
  t.equal(u.formatCurrency('1'), '$1.00');

  t.end();
});

test('u.parsePrice', function(t){

  t.equal(u.parsePrice('1'), 1);
  t.equal(u.parsePrice('$2'), 2);
  t.equal(u.parsePrice('$ 20'), 20);
  t.equal(u.parsePrice('2.00 $'), 2);
  t.equal(u.parsePrice('$2,000'), 2000);
  t.equal(u.parsePrice('0.99'), 0.99);

  t.equal(u.parsePrice('-1'), -1);
  t.equal(u.parsePrice('-$2'), -2);
  t.equal(u.parsePrice('$ -20'), -20);
  t.equal(u.parsePrice('-2.00 $'), -2);
  t.equal(u.parsePrice('$-2,000'), -2000);
  t.equal(u.parsePrice('-0.99'), -0.99);

  t.equal(u.parsePrice(u.formatCurrency(1499)), 1499);
  t.equal(u.parsePrice(u.formatCurrency(0)), 0);
  t.equal(u.parsePrice(u.formatCurrency(9.99)), 9.99);
  t.equal(u.parsePrice(u.formatCurrency(-0.99)), -0.99);
  t.equal(u.parsePrice(u.formatCurrency(-9999)), -9999);

  t.equal(u.parsePrice(46), 46);
  t.equal(u.parsePrice(-1000000), -1000000);
  t.equal(u.parsePrice(10.1234), 10.1234);
  t.equal(u.parsePrice(0), 0);

  t.assert(u.isNaN(NaN));
  t.assert(u.isNaN(u.parsePrice('')));
  t.assert(u.isNaN(u.parsePrice(NaN)));
  t.assert(u.isNaN(u.parsePrice(null)));
  t.assert(u.isNaN(u.parsePrice(undefined)));
  t.assert(u.isNaN(u.parsePrice()));
  t.assert(u.isNaN(u.parsePrice(' ')));
  t.assert(u.isNaN(u.parsePrice('$')));
  t.assert(u.isNaN(u.parsePrice(',')));
  t.assert(u.isNaN(u.parsePrice('bogusness')));

  t.equal(u.parsePrice(u.parsePrice('1')), 1);
  t.equal(u.parsePrice(u.parsePrice('$2')), 2);
  t.equal(u.parsePrice(u.parsePrice('$ 20')), 20);
  t.equal(u.parsePrice(u.parsePrice('2.00 $')), 2);
  t.equal(u.parsePrice(u.parsePrice('$2,000')), 2000);
  t.equal(u.parsePrice(u.parsePrice('0.99')), 0.99);

  t.equal(u.parsePrice(u.parsePrice('-1')), -1);
  t.equal(u.parsePrice(u.parsePrice('-$2')), -2);
  t.equal(u.parsePrice(u.parsePrice('$ -20')), -20);
  t.equal(u.parsePrice(u.parsePrice('-2.00 $')), -2);
  t.equal(u.parsePrice(u.parsePrice('$-2,000')), -2000);
  t.equal(u.parsePrice(u.parsePrice('-0.99')), -0.99);

  t.equal(u.parsePrice(u.parsePrice(46)), 46);
  t.equal(u.parsePrice(u.parsePrice(-1000000)), -1000000);
  t.equal(u.parsePrice(u.parsePrice(10.1234)), 10.1234);
  t.equal(u.parsePrice(u.parsePrice(0)), 0);

  t.assert(u.isNaN(u.parsePrice(u.parsePrice(''))));
  t.assert(u.isNaN(u.parsePrice(u.parsePrice(NaN))));
  t.assert(u.isNaN(u.parsePrice(u.parsePrice(null))));
  t.assert(u.isNaN(u.parsePrice(u.parsePrice(undefined))));
  t.assert(u.isNaN(u.parsePrice(u.parsePrice())));
  t.assert(u.isNaN(u.parsePrice(u.parsePrice(' '))));
  t.assert(u.isNaN(u.parsePrice(u.parsePrice('$'))));
  t.assert(u.isNaN(u.parsePrice(u.parsePrice(','))));
  t.assert(u.isNaN(u.parsePrice(u.parsePrice('bogusness'))));

  t.end();
});

test('u.parentHref', function(t) {
  t.assert(u.parentHref('/') === null);
  t.assert(u.parentHref('') === null);
  t.assert(u.parentHref('a') === null);
  t.assert(u.parentHref('/a') === '/');
  t.assert(u.parentHref('a/') === null);
  t.assert(u.parentHref('/a/') === '/');
  t.assert(u.parentHref('/a/b') === '/a/');
  t.assert(u.parentHref('/a/b/c') === '/a/b/');
  t.assert(u.parentHref('//a') === '/');
  t.assert(u.parentHref('a//') === null);
  t.assert(u.parentHref('//a//') === '/');
  t.assert(u.parentHref('//a//b') === '/a/');
  t.assert(u.parentHref('//a//b//c') === '/a/b/');

  t.assert(u.parentHref('/',true) === null);
  t.assert(u.parentHref('',true) === null);
  t.assert(u.parentHref('a',true) === null);
  t.assert(u.parentHref('/a',true) === '/');
  t.assert(u.parentHref('a/',true) === null);
  t.assert(u.parentHref('/a/',true) === '/');
  t.assert(u.parentHref('/a/b',true) === '/a');
  t.assert(u.parentHref('/a/b/c',true) === '/a/b');
  t.assert(u.parentHref('//a',true) === '/');
  t.assert(u.parentHref('a//',true) === null);
  t.assert(u.parentHref('//a//',true) === '/');
  t.assert(u.parentHref('//a//b',true) === '/a');
  t.assert(u.parentHref('//a//b//c',true) === '/a/b');
  t.end();
});

test('u.unPrefix', function(t) {
  t.equal(u.unPrefix('abc',''), 'abc');
  t.equal(u.unPrefix('abc','a'), 'bc');
  t.equal(u.unPrefix('abc','abc'), '');
  t.equal(u.unPrefix('abc','abcd'), 'abc');
  t.equal(u.unPrefix('','abc'), '');
  t.end();
});

test('u.csv', function(t) {
  t.equal(u.csv(), '');
  t.equal(u.csv(1), '1');
  t.equal(u.csv([1,2]), '1, 2');
  t.equal(u.csv({}), '');
  t.equal(u.csv({a:1}), '1');
  t.equal(u.csv({a:1, b:2}), '1, 2');
  t.equal(u.csv('1'), '1');
  t.end();
});


test('u.join', function(t) {
  t.equal(u.join(), '.');
  t.equal(u.join(''), '.');
  t.equal(u.join('/'), '/');
  t.equal(u.join(undefined), '.');
  t.equal(u.join('', undefined), '.');
  t.equal(u.join('/', undefined), '/');
  t.equal(u.join('http://'), 'http://');
  t.equal(u.join('http://',''), 'http://');
  t.equal(u.join('http://','',''), 'http://');
  t.equal(u.join('http://','','/'), 'http:///');
  t.equal(u.join('http://','a.b.c'), 'http://a.b.c');
  t.equal(u.join('http://','a.b.c','/'), 'http://a.b.c/');
  t.equal(u.join('https://a.b.c/x','y'), 'https://a.b.c/x/y');
  t.equal(u.join('ftp://','a.b.c','/','/'), 'ftp://a.b.c/');
  t.equal(u.join('FTP://','a.b.c','/booger'), 'FTP://a.b.c/booger');
  t.end();
});

test('u.getaVals and u.setaVal', function(t) {
  var o = {};
  u.setaVal(o,'a',1);
  u.setaVal(o,'a',2);
  u.setaVal(o,'a',3);
  u.setaVal(o,'b',[1]);
  u.setaVal(o,'c',[]);
  u.setaVal(o,'d',2);
  u.setaVal(o,'e',0);
  u.setaVal(o,'f','');
  u.setaVal(o,'g',null);
  u.setaVal(o,'h',null); // NaN here fails deepEqual
  u.setaVal(o,'i',{x:1});
  u.setaVal(o,'j',[0]);
  u.setaVal(o,'k',undefined);
  u.setaVal(o,'l',null); // function(){} here fails deepEqual
  t.deepEqual(o,({a:[1,2,3],b:[1],c:[],d:2,e:0,f:'',g:null,h:null,i:{x:1},j:[0],k:undefined,l:null}));
  t.deepEqual(u.getaVals(o,'a'), [1,2,3]);
  t.deepEqual(u.getaVals(o,'b'), [1]);
  t.deepEqual(u.getaVals(o,'c'), []);
  t.deepEqual(u.getaVals(o,'d'), [2]);
  t.deepEqual(u.getaVals(o,'e'), [0]);
  t.deepEqual(u.getaVals(o,'f'), ['']);
  t.deepEqual(u.getaVals(o,'g'), [null]);
  t.deepEqual(u.getaVals(o,'h'), [null]);
  t.deepEqual(u.getaVals(o,'i'), [{x:1}]);
  t.deepEqual(u.getaVals(o,'j'), [0]);
  t.deepEqual(u.getaVals(o,'k'), [undefined]);
  t.deepEqual(u.getaVals(o,'l'), [null]);
  t.end();
});

test('u.relPath', function(t) {
  t.equal(u.relPath(''), '.');
  t.equal(u.relPath('/'), '.');
  t.equal(u.relPath('a'), '.');
  t.equal(u.relPath('a/b'), '.');
  t.equal(u.relPath('a/b/c'), '.');
  t.equal(u.relPath('a//'), '.');
  t.equal(u.relPath('/a'), '.');
  t.equal(u.relPath('//'), '..');
  t.equal(u.relPath('/a/b'), '..');
  t.equal(u.relPath('/a/b/c'), '../..');
  t.equal(u.relPath('/a/b/c/d'), '../../..');
  t.equal(u.relPath('/a/b/c/d/'), '../../../..');
  t.equal(u.relPath('/a/b/c/d/3'), '../../../..');
  t.end();
});

test('u.slugify', function(t) {
  t.equal(u.slugify(), '');
  t.equal(u.slugify(''), '');
  t.equal(u.slugify('-'), '-');
  t.equal(u.slugify('.'), '.');
  t.equal(u.slugify('robots.txt'), 'robots.txt');
  t.equal(u.slugify('rübots.txt'), 'r-bots.txt');
  t.equal(u.slugify('rübots.t%t'), 'r-bots.t-t');
  t.equal(u.slugify('rübots.t%t-'), 'r-bots.t-t');
  t.equal(u.slugify('rübots.t%t---'), 'r-bots.t-t');
  t.equal(u.slugify('--'), '-');
  t.equal(u.slugify('-*-'), '-');
  t.equal(u.slugify('_*_', {allow:'*'}), '*');
  t.equal(u.slugify('_*_', {allow:'*_'}), '_*_');
  t.equal(u.slugify('_*_', {allow:'_'}), '_-_');
  t.equal(u.slugify('&'), 'and');
  t.equal(u.slugify('A&b', {allow:'&'}), 'a-and-b');
  t.equal(u.slugify('+'), 'plus');
  t.equal(u.slugify('A+b', {allow:'+'}), 'a-plus-b');
  t.equal(u.slugify('&+'), 'and-plus');
  t.equal(u.slugify('a'), 'a');
  t.equal(u.slugify('Ab', {mixedCase:1}), 'Ab');
  t.end();
});


test('u.unslugify', function(t) {
  t.equal(u.unslugify(), undefined);
  t.equal(u.unslugify(''), '');
  t.equal(u.unslugify(' '), ' ');
  t.equal(u.unslugify('/'), '/');
  t.equal(u.unslugify('//'), '//');
  t.equal(u.unslugify('-*-'), '-*-');
  t.equal(u.unslugify('/+'), 'Plus');
  t.equal(u.unslugify('&'), 'And');
  t.equal(u.unslugify('&+'), 'And Plus');
  t.equal(u.unslugify('-&-+-'), 'And Plus');
  t.equal(u.unslugify('&boogers-&-snot'), 'And Boogers And Snot');
  t.equal(u.unslugify('/a/'), 'A');
  t.equal(u.unslugify('/a/b'), 'A B');
  t.equal(u.unslugify('/a/bc'), 'A Bc');
  t.equal(u.unslugify('/a/bc/'), 'A Bc');
  t.equal(u.unslugify('/a/ bc/'), 'A Bc');
  t.equal(u.unslugify('/a/ b c/'), 'A B C');
  t.end();
});


test('u.merge', function(t) {
  var a = {a:1,b:[1,2],c:{x:''}};
  var b = {a:2,b:[2,2],x:{c:''}};

  var n = u.merge({},a,b);
  t.deepEqual(n, {a:2,b:[2,2],c:{x:''},x:{c:''}});
  t.deepEqual(a, {a:1,b:[1,2],c:{x:''}});
  t.deepEqual(b, {a:2,b:[2,2],x:{c:''}});

  var c = u.merge(a,b);
  t.deepEqual(a, {a:2,b:[2,2],c:{x:''},x:{c:''}});
  t.deepEqual(b, {a:2,b:[2,2],x:{c:''}});
  t.deepEqual(c, {a:2,b:[2,2],c:{x:''},x:{c:''}});

  t.end();
});

test('u.merge edge cases', function(t) {
  t.deepEqual(u.merge(), {});
  t.deepEqual(u.merge({}), {});
  t.deepEqual(u.merge(null, {}), {});
  t.deepEqual(u.merge({}, {a:1}), {a:1});
  t.end();
});
