const fs = require('fs');
const assert = require('assert');

const content = fs.readFileSync('SCRIPTS/main.js', 'utf8');
assert.ok(content.includes("Do Androids Train? Ready to roll!"), 'Main script should contain startup message');

console.log('All tests passed.');
