/**
 * test pub-util
 * copyright 2015, Jurgen Leschner - github.com/jldec - MIT license
 *
**/

suite('test pub-util');

var u = require('../pub-util');
var should = require('should');

test('u.date', function(){
  u.date('2014-04-02').addDays(2).valueOf().should.be.exactly((new Date(2014,3,4)).valueOf());
});

test('u.template', function(){

  u.template('{{a}}')({a:1}).should.be.exactly('1');
  u.template('{{a}}')({a:'<'}).should.be.exactly('&lt;');
  u.template('{{a+b}}')({a:'<', b:'>'}).should.be.exactly('&lt;&gt;');
  u.template('{{a+b}}')({a:'1', b:'2'}).should.be.exactly('12');
  u.template('{{a+b}}')({a:1, b:2}).should.be.exactly('3');
  u.template('{-{a}-}')({a:'<'}).should.be.exactly('<');
  u.template('{-{a+b}-}')({a:'<', b:'>'}).should.be.exactly('<>');
  u.template('{-{a+b}-}')({a:'1', b:'2'}).should.be.exactly('12');
  u.template('{-{a+b}-}')({a:1, b:2}).should.be.exactly('3');
  u.template('|print(a+b)|')({a:'<', b:'>'}).should.be.exactly('<>');
  u.template('|a=">"||print(a+b)|')({a:'<', b:'>'}).should.be.exactly('>>');
  u.template('|print(_.escape(a+b))|')({a:'<', b:'>'}).should.be.exactly('&lt;&gt;');
  u.template('|print(a+b)|')({a:1, b:2}).should.be.exactly('3');
  u.template('|_.each(rg,function(x){|{{x}}|})|')({rg:[1,2,3]}).should.be.exactly('123');
  u.template('|_.each(rg,function(x){| {{x}} |})|')({rg:[1,2,3]}).should.be.exactly(' 1  2  3 ');
  u.template('|_.each(rg,function(x){var evenodd = ((x%2) ? "odd" : "even");|<div class="{{evenodd}}">{{x}}</div>|})|')({rg:[1,2,3]})
    .should.be.exactly('<div class="odd">1</div><div class="even">2</div><div class="odd">3</div>');
  u.template('|_.each(rg,function(x,idx){var evenodd = ((idx%2) ? "even" : "odd");|<div class="{{evenodd}}">{{x}}</div>\n|})|')({rg:['a','b','c']})
    .should.be.exactly('<div class="odd">a</div>\n<div class="even">b</div>\n<div class="odd">c</div>\n');
});

test('u.str', function(){

  u.str(0).should.be.exactly('');

  u.str().should.be.exactly('');
  u.str(NaN).should.be.exactly('');
  u.str(null).should.be.exactly('');
  u.str(undefined).should.be.exactly('');
  u.str([]).should.be.exactly([].toString());
  u.str(/./).should.be.exactly(/./.toString());
  u.str({}).should.be.exactly({}.toString());
  u.str(function(){}).should.be.exactly((function(){}).toString());
  u.str(Date()).should.be.exactly(Date().toString());

  u.str(-1).should.be.exactly('-1');
  u.str(1).should.be.exactly('1');
  u.str('abc').should.be.exactly('abc');
});


test('u.formatCurrency', function() {

  u.formatCurrency(1499).should.be.exactly('$1,499.00');
  u.formatCurrency(0).should.be.exactly('$0.00');
  u.formatCurrency(9.99).should.be.exactly('$9.99');
  u.formatCurrency(-0.99).should.be.exactly('$-0.99');
  u.formatCurrency(-9999).should.be.exactly('$-9,999.00');

  u.formatCurrency(null).should.be.exactly('$0.00');
  u.formatCurrency(undefined).should.be.exactly('$NaN');
  u.formatCurrency('booger').should.be.exactly('$NaN');
  u.formatCurrency('1').should.be.exactly('$1.00');

})

test('u.parsePrice', function(){

  u.parsePrice('1').should.be.exactly(1);
  u.parsePrice('$2').should.be.exactly(2);
  u.parsePrice('$ 20').should.be.exactly(20);
  u.parsePrice('2.00 $').should.be.exactly(2);
  u.parsePrice('$2,000').should.be.exactly(2000);
  u.parsePrice('0.99').should.be.exactly(0.99);

  u.parsePrice('-1').should.be.exactly(-1);
  u.parsePrice('-$2').should.be.exactly(-2);
  u.parsePrice('$ -20').should.be.exactly(-20);
  u.parsePrice('-2.00 $').should.be.exactly(-2);
  u.parsePrice('$-2,000').should.be.exactly(-2000);
  u.parsePrice('-0.99').should.be.exactly(-0.99);

  u.parsePrice(u.formatCurrency(1499)).should.be.exactly(1499);
  u.parsePrice(u.formatCurrency(0)).should.be.exactly(0);
  u.parsePrice(u.formatCurrency(9.99)).should.be.exactly(9.99);
  u.parsePrice(u.formatCurrency(-0.99)).should.be.exactly(-0.99);
  u.parsePrice(u.formatCurrency(-9999)).should.be.exactly(-9999);

  u.parsePrice(46).should.be.exactly(46);
  u.parsePrice(-1000000).should.be.exactly(-1000000);
  u.parsePrice(10.1234).should.be.exactly(10.1234);
  u.parsePrice(0).should.be.exactly(0);

  u.parsePrice('').should.be.NaN;
  u.parsePrice(NaN).should.be.NaN;
  u.parsePrice(null).should.be.NaN;
  u.parsePrice(undefined).should.be.NaN;
  u.parsePrice().should.be.NaN;
  u.parsePrice(' ').should.be.NaN;
  u.parsePrice('$').should.be.NaN;
  u.parsePrice(',').should.be.NaN;
  u.parsePrice('bogusness').should.be.NaN;

  u.parsePrice(u.parsePrice('1')).should.be.exactly(1);
  u.parsePrice(u.parsePrice('$2')).should.be.exactly(2);
  u.parsePrice(u.parsePrice('$ 20')).should.be.exactly(20);
  u.parsePrice(u.parsePrice('2.00 $')).should.be.exactly(2);
  u.parsePrice(u.parsePrice('$2,000')).should.be.exactly(2000);
  u.parsePrice(u.parsePrice('0.99')).should.be.exactly(0.99);

  u.parsePrice(u.parsePrice('-1')).should.be.exactly(-1);
  u.parsePrice(u.parsePrice('-$2')).should.be.exactly(-2);
  u.parsePrice(u.parsePrice('$ -20')).should.be.exactly(-20);
  u.parsePrice(u.parsePrice('-2.00 $')).should.be.exactly(-2);
  u.parsePrice(u.parsePrice('$-2,000')).should.be.exactly(-2000);
  u.parsePrice(u.parsePrice('-0.99')).should.be.exactly(-0.99);

  u.parsePrice(u.parsePrice(46)).should.be.exactly(46);
  u.parsePrice(u.parsePrice(-1000000)).should.be.exactly(-1000000);
  u.parsePrice(u.parsePrice(10.1234)).should.be.exactly(10.1234);
  u.parsePrice(u.parsePrice(0)).should.be.exactly(0);

  u.parsePrice(u.parsePrice('')).should.be.NaN;
  u.parsePrice(u.parsePrice(NaN)).should.be.NaN;
  u.parsePrice(u.parsePrice(null)).should.be.NaN;
  u.parsePrice(u.parsePrice(undefined)).should.be.NaN;
  u.parsePrice(u.parsePrice()).should.be.NaN;
  u.parsePrice(u.parsePrice(' ')).should.be.NaN;
  u.parsePrice(u.parsePrice('$')).should.be.NaN;
  u.parsePrice(u.parsePrice(',')).should.be.NaN;
  u.parsePrice(u.parsePrice('bogusness')).should.be.NaN;

});

test('u.isNumber', function(){

  u.isNumber(1).should.be.true;
  u.isNumber(Number('0')).should.be.true;
  u.isNumber(Number('')).should.be.true;
  u.isNumber(u.parsePrice('1,000 $')).should.be.true;
  u.isNumber(u.parsePrice('')).should.be.false;
  u.isNumber(NaN).should.be.false;
  u.isNumber({}).should.be.false;
  u.isNumber([]).should.be.false;
  u.isNumber('').should.be.false;
  u.isNumber(null).should.be.false;
  u.isNumber(undefined).should.be.false;
  u.isNumber(function(){;}).should.be.false;
});

test('u.csv', function() {
  u.csv().should.be.exactly('');
  u.csv(1).should.be.exactly('1');
  u.csv([1,2]).should.be.exactly('1, 2');
  u.csv({}).should.be.exactly('');
  u.csv({a:1}).should.be.exactly('1');
  u.csv({a:1, b:2}).should.be.exactly('1, 2');
  u.csv('1').should.be.exactly('1');
});


test('u.join', function() {
  u.join().should.be.exactly('.');
  u.join('').should.be.exactly('.');
  u.join('/').should.be.exactly('/');
  u.join(undefined).should.be.exactly('.');
  u.join('', undefined).should.be.exactly('.');
  u.join('/', undefined).should.be.exactly('/');
  u.join('http://').should.be.exactly('http://');
  u.join('http://','').should.be.exactly('http://');
  u.join('http://','','').should.be.exactly('http://');
  u.join('http://','','/').should.be.exactly('http:///');
  u.join('http://','a.b.c').should.be.exactly('http://a.b.c');
  u.join('http://','a.b.c','/').should.be.exactly('http://a.b.c/');
  u.join('https://a.b.c/x','y').should.be.exactly('https://a.b.c/x/y');
  u.join('ftp://','a.b.c','/','/').should.be.exactly('ftp://a.b.c/');
  u.join('FTP://','a.b.c','/booger').should.be.exactly('FTP://a.b.c/booger');
});

test('u.getaVals and u.setaVal', function() {
  var o = {}
  u.setaVal(o,'a',1);
  u.setaVal(o,'a',2);
  u.setaVal(o,'a',3);
  u.setaVal(o,'b',[1]);
  u.setaVal(o,'c',[]);
  u.setaVal(o,'d',2);
  u.setaVal(o,'e',0);
  u.setaVal(o,'f','');
  u.setaVal(o,'g',null);
  u.setaVal(o,'h',NaN);
  u.setaVal(o,'i',{x:1});
  u.setaVal(o,'j',[0]);
  u.setaVal(o,'k',undefined);
  u.setaVal(o,'l',function(){});
  o.should.eql({a:[1,2,3],b:[1],c:[],d:2,e:0,f:'',g:null,h:NaN,i:{x:1},j:[0],k:undefined,l:function(){}});
  u.getaVals(o,'a').should.eql([1,2,3]);
  u.getaVals(o,'b').should.eql([1]);
  u.getaVals(o,'c').should.eql([]);
  u.getaVals(o,'d').should.eql([2]);
  u.getaVals(o,'e').should.eql([0]);
  u.getaVals(o,'f').should.eql(['']);
  u.getaVals(o,'g').should.eql([null]);
  u.getaVals(o,'h').should.eql([NaN]);
  u.getaVals(o,'i').should.eql([{x:1}]);
  u.getaVals(o,'j').should.eql([0]);
  u.getaVals(o,'k').should.eql([undefined]);
  u.getaVals(o,'l').should.eql([function(){}]);
})

test('u.relPath', function() {
  u.relPath('').should.be.exactly('.');
  u.relPath('/').should.be.exactly('.');
  u.relPath('a').should.be.exactly('.');
  u.relPath('a/b').should.be.exactly('.');
  u.relPath('a/b/c').should.be.exactly('.');
  u.relPath('a//').should.be.exactly('.');
  u.relPath('/a').should.be.exactly('.');
  u.relPath('//').should.be.exactly('..');
  u.relPath('/a/b').should.be.exactly('..');
  u.relPath('/a/b/c').should.be.exactly('../..');
  u.relPath('/a/b/c/d').should.be.exactly('../../..');
  u.relPath('/a/b/c/d/').should.be.exactly('../../../..');
  u.relPath('/a/b/c/d/3').should.be.exactly('../../../..');
})











