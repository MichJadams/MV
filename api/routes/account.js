var router = module.exports = require('express').Router({mergeParams: true}); 
// const Utils = require('Utils');



router.post('/:username', function(req, res){
	req.MV.Account.get(req.params.username, function(err, data){
		if(err){
			res.error(err);
		}else{
			if (data == null) {
				//create user here
				
			} else {
				res.error('Username already taken');
			}
		}
	});
});




router.param('username', function(req, res, next, username){
	req.MV.Account.get(username, function(err, data){
		if(err){
			res.error(err);
		}else{
			if (data == null) {
				res.error('No such user');
			} else {
				req.User = data;
				next();		
			}
		}
	});
});


router.get('/:username/login', function(req, res){
	if (req.query.password == null) {
		res.error('Password missing');
	}else{
		var hash = req.MV.Account.generateHash(req.query.password, req.User.salt);
		if(req.User.password != hash) {
			res.error('Login failed');
		} else {
			var auth_token = req.auth.encodeToken({username: req.User.username});
			res.cookie('auth_token', auth_token);
			res.json(req.User);
		}
	}
});


router.use(function(req, res, next){
	if (!req.auth.valid) {
		res.error('You are not authorized to access this resource');
	} else {
		next();
	}
});


router.get('/:username', function(req, res){
	res.json(req.User);
});

// module.exports.create = function create(req, res){
// 	if (req.body.username == null || req.body.password == null){
// 		return res.error('Missing Username or Password');
// 	}else if (req.body.username.match(/^[A-Za-z0-9]+$/) == null){
// 		return res.error('Invalid username. Username must be alphanumeric');
// 	}else{
// 		res.Models.Account.create(req.body.username, req.body.password, function(err, account){
// 			if (err) {
// 				if (err.code == 'Neo.ClientError.Schema.ConstraintValidationFailed') {
// 					res.error('Account exists');
// 				} else {
// 					res.error('Could not create account');
// 				}
// 			} else {
// 				var auth_token = req.auth.encodeToken({username: account.username});
// 				res.cookie('auth', auth_token);
// 				res.json({username: account.username});
// 			}
// 		});
// 	}
// };

// module.exports.login = function login(req, res){
// 	if (req.query.username == null || req.query.password == null){
// 		return res.error('Missing username or password');
// 	}
// 	res.Models.Account.login(req.query.username, req.query.password, function(err, account){
// 		if (err) {
// 			res.error(err);
// 		}else if (account == null) {
// 			res.error('Could not authenticate credentials', 401);
// 		} else {
// 			var auth_token = req.auth.encodeToken({username: account.username});
// 			res.cookie('auth', auth_token);
// 			res.json({username: account.username});
// 		}
// 	});
// };

// router.use(function(req, res, next){
// 	if (req.auth.data.username !== req.MV.account.username){
// 		res.error('Not Authorized', 401);
// 	}else{
// 		next();
// 	}
// });






// router.get('/views', function(req, res){
// 	res.Models.View.getForUser(req.auth.data.username, function(err, views){
// 		if (err) {
// 			console.error(err);
// 			res.error('Could not get views');
// 		} else {
// 			res.json(views);
// 		}
// 	});6
// });

// router.get('/views/:view_id', async function(req, res){
// 	res.Models.View.getForUserById(req.auth.data.username, req.params.view_id, function(err, views){
// 		if (err) {
// 			console.error(err);
// 			res.error('Could not get view');
// 		} else {
// 			res.json(views);
// 		}
// 	});
// });

// router.post('/view/', async function(req, res){
// 	var view = Utils.whitelistCopy(req.body, req.MV.View.properties);
// 	view.id = await res.DB.generateId('view');

// 	if (view.parent != null) {
// 		try{
// 			console.log({username: req.MV.Account.username, id: view.parent});
// 			var result = await res.DB.query('MATCH (a:Account {username: $username})-[:VIEWS*1..10]->(v:View {id: $id}) RETURN v LIMIT 1', {username: req.MV.Account.username, id: res.DB.Integer(view.parent)});
// 			if (result.length) {
// 				var parent_id = res.DB.Integer(view.parent);
// 				console.log('Parent Id', parent_id);
// 				delete view.parent;
// 				var r = await res.DB.query('MATCH (v:View {id: $id}) CREATE (v)-[:VIEWS]->(view:View $view) RETURN v, view', {id: parent_id, view:view});
// 				console.log(r);
// 				res.json(r);
// 			}else{
// 				res.error('Invalid parent id');
// 			}
// 		}catch(e){
// 			console.log(e);
// 		}
// 	}else if(view.name != null){
// 		var result = await res.DB.query('MATCH (a:Account {username: $username}) CREATE (a)-[:VIEWS]->(view:View $view) RETURN view', {username: req.MV.Account.username, view:view});
// 		console.log(result[0].toObject());
// 		res.json(result[0].toObject().view.properties);
// 	}else{
// 		res.error('A new view must have either a name or a parent');
// 	}
// });

// router.patch('/view/:view_id', async function(req, res){
// 	var view = Utils.whitelistCopy(req.body, req.MV.View.properties);
// 	var result = await res.DB.query('MATCH (a:Account {username: $username})-[:VIEWS*1..10]->(v:View {id: $id}) RETURN v LIMIT 1', {username: req.MV.Account.username, id: res.DB.Integer(req.params.view_id)});
// 	if (!result.length) {
// 		return res.error('Invalid view id');
// 	}
// 	delete view.id;
// 	var result = await res.DB.query('MATCH (v:View {id: $id}) SET v += $view RETURN v', {id: res.DB.Integer(req.params.view_id), view: view});
// 	return res.json(result[0].toObject().v.properties);
// });

// router.delete('/view/:view_id/parent/:parent_id', async function(req, res){
// 	var id = res.DB.Integer(req.params.view_id);
// 	var parent_id = res.DB.Integer(req.params.parent_id);
	
// 	var result = await res.DB.query('MATCH (a:Account {username: $username})-[:VIEWS*1..10]->(p:View {id: $parent_id})-[l:VIEWS]->(c:View {id: $id}) DELETE l RETURN c LIMIT 1', {username: req.MV.Account.username, id: id, parent_id: parent_id});
// 	if (!result.length) {
// 		return res.error('Invalid view id');
// 	}
	
// 	return res.json(result[0].toObject().c.properties);
// });

// router.delete('/view/:view_id', async function(req, res){
// 	var id = res.DB.Integer(req.params.view_id);
	
// 	var result = await res.DB.query('MATCH (a:Account {username: $username})-[l:VIEWS]->(n:View {id: $id}) DELETE l, n', {username: req.MV.Account.username, id: id});
	
// 	// if (!result.length) {
// 	// 	return res.error('Invalid view id');
// 	// }
	
// 	return res.json({success: true});
// });