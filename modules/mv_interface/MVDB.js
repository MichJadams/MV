var neo4j = require('neo4j-driver').v1;

class MVDB{
	constructor(host, username, password, params){
		this.driver = neo4j.driver(host, neo4j.auth.basic(username, password), params);
		this.host = host;
		this.username = username;
		this.password = password;
		this.Data = new (require('./models/data.js'))(this);
	}

	async query(query, data){
		var session = this.driver.session();
		var result = await session.writeTransaction(function(tx){
			return tx.run(query, data);
		});
		session.close();
		return result.records;
	}

	close(){
		this.driver.close();
	}

	async generateId(name){
		try{
			var session = this.driver.session();
			var ret = (await session.writeTransaction(async function(tx){
				var value = await tx.run('MERGE (n:Meta {name: $name}) ON CREATE SET n.count = 0 ON MATCH SET n.count = n.count + 1 RETURN n.count', {name:name});

				return value;
			})).records[0].get('n.count');

		}finally{
			session.close();
		}
		return ret;
	}
}

MVDB.prototype.Integer = neo4j.int;







module.exports = MVDB;


