const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('admin.html', 'utf8');
const start = source.indexOf('var quote=function(v)');
const end = source.indexOf('var csv=', start);
assert.ok(start > 0 && end > start);
const quote = vm.runInNewContext(source.slice(start, end) + '\nquote;');
for (const value of ['=1+1', '+1+1', '-1+1', '@SUM(1)', '\t=1', '\r=1', '\n=1', '  =1', '\uFEFF=1', '＝1+1', '＋1', '－1', '＠SUM(1)']) {
  assert.equal(quote(value).slice(0, 2), '"\'', 'Unsafe spreadsheet prefix: ' + JSON.stringify(value));
}
assert.equal(quote('PawPark'), '"PawPark"');
assert.equal(quote('باو بارك'), '"باو بارك"');
assert.equal(quote('a,"b"\nc'), '"a,""b""\nc"');
assert.equal(quote(null), '""');
console.log('PASS: CSV formula prefixes, whitespace/control characters, full-width variants, quoting and Arabic text.');
