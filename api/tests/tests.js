require('dotenv').config();

var neo4j = require('neo4j-driver').v1;
var DBDriver = neo4j.driver(process.env.DB_HOST, neo4j.auth.basic(process.env.DB_USER, process.env.DB_PASS), {maxTransactionRetryTime: 30000});
var MV = require('../models/mv')(DBDriver.session());


console.log(MV);

console.log('Started...');

console.log('Account');

console.log('Creating');
MV.Account.create('Michaela', 'asdf', function(err, data){
	if(err){
		console.log(err);
	}else{
		console.log(data);
	}
	console.log('Done');
	MV.close();
});


console.log('Getting');
// MV.Account.get('Capitalization', function(err, data){
// 	if(err){
// 		console.log(err);
// 	}else{
// 		console.log(data);
// 	}
// 	console.log('Done');
// 	MV.close();
// });
