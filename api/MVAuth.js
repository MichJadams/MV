const Crypto = require('crypto');

if (process.env.HMAC_SECRET == null){
	throw 'Server misconfiguration! HMAC';
}

module.exports = function(){
	return function(req, res, next){
		if (req.cookies.auth){
			var token = module.exports.decodeToken(req.cookies.auth);
			if (token.valid){
				req.MV.auth = token.data;
			}else{
				req.MV.auth = {};
			}
		}else{
			req.MV.auth = {};
		}
		next();
	};
};

module.exports.encodeToken = function(data = {}){
	data.timestamp = Math.floor(new Date().getTime() / 1000);
	data = JSON.stringify(data);
	data = new Buffer(data).toString('base64');
	var hmac = Crypto.createHmac('sha256', process.env.HMAC_SECRET);
	hmac.update(data);
	var hash = hmac.digest('hex');
	return data+':'+hash;
}

module.exports.decodeToken = function(token){
	var ret = {
		valid: true,
		message: '',
		data: {}
	};
	if (typeof token != 'string') {
		return ret;
	}
	var components = token.split(':');
	if (components.length != 2) {
		ret.valid = false;
		ret.message = 'Malformed auth token';
		return ret;
	}
	var auth_data = components[0];
	var auth_hash = components[1];

	var hmac = Crypto.createHmac('sha256', process.env.HMAC_SECRET);
	hmac.update(auth_data);
	if (hmac.digest('hex') != auth_hash) {
		ret.valid = false;
		ret.message = 'Invalid auth token';
		return ret;
	}

	auth_data = new Buffer(auth_data, 'base64').toString();
	auth_data = JSON.parse(auth_data);

	auth_data.timestamp = auth_data.timestamp || 0;

	console.log('token timestamps', auth_data.timestamp, Math.floor(new Date().getTime() / 1000) - process.env.TOKEN_LIFESPAN);
	console.log(auth_data.timestamp < Math.floor(new Date().getTime() / 1000) - process.env.TOKEN_LIFESPAN);

	if (auth_data.timestamp < Math.floor(new Date().getTime() / 1000) - process.env.TOKEN_LIFESPAN) {
		console.log('token invalid');
		ret.valid = false;
		ret.message = 'Invalid auth token';
		return ret;
	}

	console.log('token status', ret.valid);

	ret.data = auth_data;
	return ret;
}