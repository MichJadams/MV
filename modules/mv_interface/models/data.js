class Data{
	constructor(MVDB){
		this.MVDB = MVDB;
	}

	async get(path){
		var query_params = {};
		var query = 'MATCH (:DataRoot)';
		for (var i = 0; i < path.length; i++) {
			var key = generateKey(i);
			query_params[key] = path[i].identifier;
			if(path[i].identifier == null){
				console.trace('null identifier');
			}
			var type_query = (path[i].type)?':'+path[i].type:'';
			query += '-[:DATASET]->';
			if (i == path.length-1){
				query += '(n'+type_query+' {identifier: $'+key+'})';
			}else{
				query += '('+type_query+' {identifier: $'+key+'})';
			}
		}
		query += ' RETURN n';
		
		var data = await this.MVDB.query(query, query_params);
		data = data[0];
		if (!data) {
			return null;
		}
		data = data.toObject().n;
		return data;
	}

	async getChildren(path){
		var query_params = {};
		var query = 'MATCH (:DataRoot)';
		for (var i = 0; i < path.length; i++) {
			var key = generateKey(i);
			query_params[key] = path[i].identifier;
			query += '-[:DATASET]->';
			if (path[i].type != null) {
				query += '(:'+path[i].type+' {identifier: $'+key+'})';
			}else{
				query += '({identifier: $'+key+'})';
			}
		}
		query += '-[:DATASET]->(n) return n';
		console.log(query_params);
		console.log(query);
		var data = await this.MVDB.query(query, query_params);
		for (var i = 0; i < data.length; i++) {
			data[i] = data[i].toObject().n;
		}
		return data;
	}

	async upsertPath(path, data){
		console.log(path);
		var params = {data : data}
		var query = 'MATCH (root:DataRoot)';
		var last_key = 'root';
		for (var i = 0; i < path.length; i++) {
			var key = generateKey(i);
			params[key] = path[i].identifier;
			if (i == path.length-1) {
				query += 'MERGE ('+last_key+')-[:DATASET]->(node:'+path[i].type+' {identifier:$'+key+'})';
			}else{
				query += 'MERGE ('+last_key+')-[:DATASET]->('+key+':'+path[i].type+' {identifier:$'+key+'})';
			}
			last_key = key;
		}
		query += ' SET node+=$data RETURN node';

		console.trace();
		console.log(params);
		console.log(query);

		var result = await this.MVDB.query(query, params);
		return result[0].toObject().node;
	}
}

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

module.exports = Data;