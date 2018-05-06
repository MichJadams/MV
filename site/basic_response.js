
module.exports = function(){

	var head = [];
	var on_load = '';
	var body = [];

	return {
		addHead: function(str){
			head.push(str);
		},
		addJs: function(path){
			head.push('<script src="'+path+'"></script>');
		},
		addCss: function(path){
			head.push('<link rel="stylesheet" type="text/css" href="'+path+'">');
		},
		addBody: function(str){
			body.push(str);
		},
		setOnLoad: function(str){
			on_load = str;
		},
		toString: function(){
			var str = '<html><head>';

			for(var element of head){
				str += element;
			}

			str += '</head><body onload="'+on_load+'">';

			for(var element of body){
				str += element;
			}

			str += '</body>';

			return str;
		}
	};


}