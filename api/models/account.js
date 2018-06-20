var Crypto = require('crypto');

class Account{
	constructor(session){
		if (session == null) {
			throw("View constructor requires a session as its first param");
		}
		this.session = session;
	}

	create(username, password, cb){
		var display_name = username;
		username = username.toLowerCase();

		var salt = Crypto.randomBytes(Number(process.env.SALT_LENGTH)).toString('hex');

		var hash = Crypto.createHash('sha256');
		
		hash.update(password);
		hash.update(salt);
		
		var pass_hash = hash.digest('hex');

		var query_params = {username:username, salt:salt, password:pass_hash, display_name:display_name};
		var query = 'CREATE (user:Account {username: $username, password:$password, salt:$salt, display_name:$display_name}) return user';

		var account;
		var stmt = this.session.run(query, query_params);
		stmt.subscribe({
			onError: function(err){
				cb(err, null)
			},
			onNext: function(data){
				account = data.toObject().user.properties;
			},
			onCompleted: function(summary){
				cb(null, account);
			}
		});
	}

	get(username, cb){
		username = username.toLowerCase();
		var query_params = {username:username};
		var query = 'MATCH (account:Account) WHERE account.username = $username RETURN account';
		var account;
		var stmt = this.session.run(query, query_params);
		stmt.subscribe({
			onError: function(err){
				cb(err, null)
			},
			onNext: function(data){
				account = data.toObject().account.properties;
			},
			onCompleted: function(summary){
				cb(null, account);
			}
		});
	}
	
	// set(id, data, cb){

	// }
	// update(id, data, cb){

	// }

	// getForUserById(username, view_id, cb){
	// 	var query = 'MATCH (a:Account {username: $username})-[:VIEWS*]->(n:View {id: $view_id}), p=(n)-[:VIEWS*0..]->(:View) WITH collect(p) as children CALL apoc.convert.toTreeClean(children) yield value RETURN value as views';
	// 	var query_params = {username: username, view_id: view_id};

	// 	var d;
	// 	var stmt = this.session.run(query, query_params);
	// 	stmt.subscribe({
	// 		onError: function(err){
	// 			cb(err, null)
	// 		},
	// 		onNext: function(data){
	// 			d = data.toObject().view.properties;
	// 		},
	// 		onCompleted: function(summary){
	// 			cb(null, d);
	// 		}
	// 	});
	// }

	// getForUser(username, cb){
	// 	var query = 'MATCH p=(a:Account {username: $username})-[:VIEWS*]->(:View) WITH collect(p) as children CALL apoc.convert.toTreeClean(children) yield value RETURN value.views as views';
	// 	var query_params = {username:username};

	// 	var d;
	// 	var stmt = this.session.run(query, query_params);
	// 	stmt.subscribe({
	// 		onError: function(err){
	// 			cb(err, null)
	// 		},
	// 		onNext: function(data){
	// 			d = data.toObject().views;	
	// 		},
	// 		onCompleted: function(summary){
	// 			cb(null, d);
	// 		}
	// 	});
	// }
}

module.exports = Account;