const fs = require('fs');

const XBRL = require('./xbrl');

var zip_file = fs.readFileSync('./testData/0000913144-17-000004-xbrl.zip');

if (!zip_file) {
	console.error('No such file');
}

var doc = XBRL.fromZip(zip_file);


var facts = doc.getFacts('us-gaap:Revenues');


	for (var fact of facts) {
		console.log(fact.context);
	}

//console.log(fact);
console.log('done');






