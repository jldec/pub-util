/*eslint no-console: "off"*/

// This example shows that node shutdown will wait until the debounce period is over,
// even if there is only a single call and it was handled immediately (leading:true) 


var u = require('../pub-util');

function boo() { console.log('boo'); }

var bootoo = u.throttle(boo, u.ms('5s'), {leading:true, trailing:false} );

bootoo();

// calling cancel() will allow node to exit gracefully.
// bootoo.cancel();

console.log('done');