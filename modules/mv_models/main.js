module.exports = function makeModels(session){
	var ret = {};
	ret.close = function(){
		session.close();
	};
	ret.generateId = function generateId(name, cb){
		var q = 'MERGE (n:Meta {name: $name}) ON CREATE SET n.count = 0 ON MATCH SET n.count = n.count + 1 RETURN n.count';
		var p = {name:name};
		session.query(q, p, function(err, data){
			if(err){
				cb(err, null);
			}else{
				var d = data[0].get('n.count');
				cb(null, d);
			}
		});
	}
	ret.Account = new (require('./models/account.js'))(session);
	ret.View = new (require('./models/view.js'))(session);
	ret.Data = new (require('./models/data.js'))(session);
	return ret;
}
