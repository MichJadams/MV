API = (function(){
	global_options = {};
	function request_builder(method){
		return async function(url, body, options){
			options = Object.assign({}, options, global_options);
			return new Promise(function(resolve, reject) {
				var request = new XMLHttpRequest();
				request.open(method, url);
				request.withCredentials = options.withCredentials || false;
				var error = typeof options.onError == 'function' ? options.onError : function(data){console.error(data)};
				request.onreadystatechange = function(response){
					response = response.target;
					if (response.readyState != 4) {
						return;
					}
					var data;
					if (response.responseText) {
						data = JSON.parse(response.responseText);
					}

					if (response.status < 200 || response.status >= 300) {
						console.error('Request failed: '+url+' '+response.status);
						console.error(response.responseText);
						error(data)
						resolve(null);
					}
					if (typeof data == 'undefined') {
						resolve(null);
					}
					return resolve(data);
				};
				request.send(body);
			});
		}
	}
	function set_option(name, value){
		global_options[name] = value;
	}
	return {
		get: request_builder('GET'),
		post: request_builder('POST'),
		patch: request_builder('PATCH'),
		delete: request_builder('DELETE'),
		setOption: set_option
	};
})();
API.setOption('withCredentials', true);

