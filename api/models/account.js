const Crypto = require('crypto');
const MVAuth = require('MVAuth');

module.exports = async function(DB, username){
	var account = {
		valid: true,
		username: username
	};

	try{
		var result = await DB.query('MATCH (a:Account) WHERE a.username = $username RETURN a', {username: username});
		result = result[0];
		if (!result) {
			account.valid = false;
		}else{
			result = result.toObject().a.properties;
			Object.assign(account, result);
		}

	}catch(e){
		console.log(e);
		account.valid = false;
	}
	

	async function create(password){
		var salt = Crypto.randomBytes(parseInt(process.env.SALT_LENGTH)).toString('hex');
		var hash = Crypto.createHash('sha256');
		hash.update(salt);
		hash.update(password);
		var password = hash.digest().toString('hex');
		var new_account = {
			username: username,
			password: password,
			salt: salt
		};
		var result = await res.DB.query('CREATE (a:Account $account) RETURN a', {account: new_account});
		Object.assign(account, result);
		return account;
	};

	async function login(password){
		if (!account.valid) {
			return null;
		}

		try{
			var salt = account.salt;
			var hash = Crypto.createHash('sha256');
			hash.update(salt);
			hash.update(password);
			var password = hash.digest().toString('hex');
			if (account.password != password) {
				return null;
			}else{
				return MVAuth.encodeToken({username:account.username})
			}
		}catch(e){
			console.log(e);
			return null;
		}
	}

	account.create = create;
	account.login = login;

	return account;
};