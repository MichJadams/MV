const Crypto = require('crypto');

class Account{
	constructor(session){
		this.session = session;
	}

	create(username, password, cb){
		console.log(username);

		var salt = Crypto.randomBytes(Number(process.env.SALT_LENGTH)).toString('hex');

		var hash = Crypto.createHash('sha256');
		
		hash.update(password);
		hash.update(salt);
		
		var pass_hash = hash.digest('hex');

		var query_params = {username:username, salt:salt, password:pass_hash};
		var query = 'CREATE (user:Account {username: $username, password:$password, salt:$salt}) return user';

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

	login(username, password, cb){

		var query_params = {username:username};
		var query = 'MATCH (user:Account {username: $username}) return user';

		var user;
		var stmt = this.session.run(query, query_params);
		stmt.subscribe({
			onError: function(err){
				cb(err, null)
			},
			onNext: function(data){
				user = data.toObject().user.properties;
				var hash = Crypto.createHash('sha256');
				
				hash.update(password);
				hash.update(user.salt);

				var pass_hash = hash.digest('hex');
				if (user.password != pass_hash) {
					user = null;
				}
			},
			onCompleted: function(summary){
				cb(null, user);
			}
		});
	}

	get(username, cb){
		var query_params = {username:username};
		var query = 'MATCH (user:Account {username: $username}) return user';

		var d;
		var stmt = this.session.run(query, query_params);
		stmt.subscribe({
			onError: function(err){
				cb(err, null)
			},
			onNext: function(data){
				d = data.toObject().user.properties;	
			},
			onCompleted: function(summary){
				cb(null, d);
			}
		});
	}
}

module.exports = Account;