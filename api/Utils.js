
module.exports.whitelistCopy = function whitelistStrip(obj, whitelist){
	var ret = {};

	for(var property in whitelist){
		property = whitelist[property];
		ret[property] = obj[property];
	}

	return ret;
};