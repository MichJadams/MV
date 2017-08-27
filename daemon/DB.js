// var neo4j = require('neo4j-driver').v1;
// var driver = neo4j.driver(process.env.DB_HOST, neo4j.auth.basic(process.env.DB_USER, process.env.DB_PASS), {maxTransactionRetryTime: 1500});









// module.exports = function(){
// 	var session = driver.session();

// 	async function query(query, data){
// 		var result = (await session.writeTransaction(function(tx){
// 			return tx.run(query, data);
// 		}));
// 		//console.log(result.summary);
// 		return result.records;
// 	}
// 	async function generateId(name){
// 		// var lock = await get_lock();
// 		// console.log('Got lock', lock.index);
// 		try{
// 			var session = driver.session();
// 			var ret = (await session.writeTransaction(async function(tx){

// 				var value = await tx.run('MERGE (n:Meta {name: $name}) ON CREATE SET n.count = 0 ON MATCH SET n.count = n.count + 1 RETURN n.count', {name:name});
				
// 				//tx.finish();
// 				return value;
// 			})).records[0].get('n.count');

// 			//console.log(ret);
// 		}finally{
// 			session.close();
// 			// lock.unlock();
// 		}
// 		return ret;
// 	}

// 	return {
// 		query: query,
// 		generateId: generateId,
// 		Integer: neo4j.int,
// 		close: function(){
// 			session.close();
// 			driver.close();
// 		}
// 	};
// };
