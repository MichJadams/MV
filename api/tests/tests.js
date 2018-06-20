process.env.SALT_LENGTH = 20;

var MV = require('../models/mv');


console.log('Started...');

console.log('Account');

console.log('Creating');
// MV.Account.create('Capitalization', 'asdf', function(err, data){
// 	if(err){
// 		console.log(err);
// 	}else{
// 		console.log(data);
// 	}
// 	console.log('Done');
// 	MV.close();
// });


console.log('Getting');
MV.Account.get('Capitalization', function(err, data){
	if(err){
		console.log(err);
	}else{
		console.log(data);
	}
	console.log('Done');
	MV.close();
});
