const request = require('request');
module.exports = {
	getJSON: async function(url){
		return new Promise(function(resolve, reject){
			request(url, {encoding: null}, function(err, response, body){
				if (err) {
					reject(err);
				}else{
					try{
						resolve(JSON.parse(body.toString('utf8')));
					}catch(e){
						
						console.log(body.toString('utf8'));
						reject(e);
					}
				}
			});
		});
	},
	getUrl: async function(url){
		return new Promise(function(resolve, reject){
			request(url, {encoding: null}, function(err, response, body){
				if (err) {
					reject(err);
				}else{
					resolve(body);
				}
			});
		});
	}
};