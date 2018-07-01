const Crypto = require('crypto');

if (process.env.HMAC_SECRET == null){
	throw 'Server misconfiguration! HMAC_SECRET not set';
}

module.exports = function(req, res, next){
	req.auth = decodeToken(req.cookies.auth_token);
	req.auth.encodeToken = encodeToken;
	req.auth.decodeToken = decodeToken;
	next();
};

function encodeToken(data = {}){
	data.timestamp = Math.floor(new Date().getTime() / 1000);
	data = JSON.stringify(data);
	data = new Buffer(data).toString('base64');
	var hmac = Crypto.createHmac('sha256', process.env.HMAC_SECRET);
	hmac.update(data);
	var hash = hmac.digest('hex');
	return data+':'+hash;
}

function decodeToken(token){
	var ret = {
		valid: false,
		error: '',
		data: {}
	};
	if (typeof token != 'string') {
		return ret;
	}
	var components = token.split(':');
	if (components.length != 2) {
		ret.message = 'Malformed auth token';
		return ret;
	}
	var auth_data = components[0];
	var auth_hash = components[1];

	var hmac = Crypto.createHmac('sha256', process.env.HMAC_SECRET);
	hmac.update(auth_data);
	if (hmac.digest('hex') != auth_hash) {
		ret.message = 'Invalid auth token';
		return ret;
	}

	auth_data = new Buffer(auth_data, 'base64').toString();
	auth_data = JSON.parse(auth_data);

	auth_data.timestamp = auth_data.timestamp || 0;

	if (auth_data.timestamp < Math.floor(new Date().getTime() / 1000) - process.env.TOKEN_LIFESPAN) {
		console.log('token invalid');
		ret.message = 'Invalid auth token';
		return ret;
	}
	
	ret.valid = true;
	ret.data = auth_data;
	return ret;
}