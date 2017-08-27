module.exports = async function(DB){


	async function get(path){
		var query_params = {};
		var query = 'MATCH (:DataRoot)';
		for (var i = 0; i < path.length; i++) {
			var key = generateKey(i);
			console.log(i, key);
			query_params[key] = path[i];
			query += '-[:DATASET]->';
			if (i == path.length-1){
				query += '(n {name: $'+key+'})';
			}else{
				query += '({name: $'+key+'})';
			}
		}
		query += ' return n';
		var data = await DB.query(query, query_params);
		data = data[0];
		if (!data) {
			return null;
		}
		data = data.toObject().n.properties;
		return data;
	}




	return {
		get: get


	};
};


function generateKey(num){
	var ret = num.toString();
	ret = ret.replace('0',  'a');
	ret = ret.replace('1',  'b');
	ret = ret.replace('2',  'c');
	ret = ret.replace('3',  'd');
	ret = ret.replace('4',  'e');
	ret = ret.replace('5',  'f');
	ret = ret.replace('6',  'g');
	ret = ret.replace('7',  'h');
	ret = ret.replace('8',  'i');
	ret = ret.replace('9',  'j');
	return ret;
}