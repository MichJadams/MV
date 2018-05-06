class Data{
	constructor(session){
		this.session = session;
	}

	get(path, cb){
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
		
		var d;
		var stmt = this.session.run(query, query_params);
		stmt.subscribe({
			onError: function(err){
				cb(err, null)
			},
			onNext: function(data){
				d = data.toObject().n;	
			},
			onCompleted: function(summary){
				cb(null, d);
			}
		});
	}

	getChildren(path, cb){
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
		
		var children = [];
		var stmt = this.session.run(query, query_params);
		stmt.subscribe({
			onError: function(err){cb(err, null)},
			onNext: function(child){
				children.push(child.toObject().n);
			},
			onCompleted: function(){
				cb(null, children);
			}
		});
	}

	upsertPath(path, data, cb){
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
		query += ' SET node+=$data RETURN n';


		var d;
		var stmt = this.session.run(query, query_params);
		stmt.subscribe({
			onError: function(err){
				cb(err, null)
			},
			onNext: function(data){
				d = data.toObject().n;	
			},
			onCompleted: function(summary){
				cb(null, d);
			}
		});
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