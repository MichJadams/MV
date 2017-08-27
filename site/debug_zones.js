

var domain_default = true;
var domain_override = false;
var domain_main_override = false;
var default_domain = '';

var methods = {
	quiet: function(default_mode = true, override_mode = false, main_mode = false){
		domain_default = !default_mode;
		domain_override = override_mode;
		domain_main_override = main_mode;
	},
	setDefault: function(domain){
		if (methods[domain] != null){
			return false;
		}
		default_domain = domain;
		return true;
	}
};

var domains = function(){
	if (domain_main_override){
		return;
	}
	if (this[default_domain] == null){
		this[default_domain] = domain_default;
	}
	if (default_domain == '') {
		console.log(...arguments);
	}else{
		console.log(default_domain+':', ...arguments);
	}
};

var handler = {
	get: function(target, property, reciever){
		if (methods[property] != null) {
			return methods[property];
		}
		if (domain_override){
			return function(){};
		}
		if (target[property] == null){
			target[property] = domain_default;
		}
		if ((property == default_domain && !domain_main_override) || target[property]){
			return function(){
				console.log(property+':', ...arguments);
			};
		}else{
			return function(){};
		}
	},
	set: function(target, property, value, reciever){
		if (methods[property] != null){
			return false;
		}
		if (value){
			target[property] = true;
		}else{
			target[property] = false;
		}
		return true;
	}
};
module.exports =  new Proxy(domains, handler);
