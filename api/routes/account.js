var router = module.exports = require('express').Router(); 
const Crypto = require('crypto');
const Utils = require('Utils');

router.post('/', async function(req, res){
	if (req.data.username == null || req.body.password == null){
		return res.error('Missing Username or Password');
	}
	
	if (req.MV.Account.valid) {
		res.error('Username already taken');
	}else{
		var account = await req.MV.Account.create(req.body.password);
		res.json({username: account.username});
	}
});


router.get('/login', async function(req, res){
	if (req.query.password == null){
		return res.error('Missing Password');
	}

	var auth_token = await req.MV.Account.login(req.query.password);
	if (auth_token) {
		res.cookie('auth', auth_token);
		res.json({username: req.MV.Account.username});
	}else{
		res.error('Invalid credentials');
	}
});


router.use(function(req, res, next){
	console.log(req.MV);
	if (req.MV.Account.username !== req.MV.auth.username){
		return res.error('Not Authorized!');
	}
	next();
});






router.get('/views', async function(req, res){
	try{
		var views = await res.DB.query('MATCH p=(a:Account {username: $username})-[:VIEWS*]->(:View) WITH collect(p) as children CALL apoc.convert.toTreeClean(children) yield value RETURN value.views as views', {username: req.MV.Account.username});
		if (views[0] == null){
			res.json([]);
		}else{
			res.json(views[0].toObject().views);
		}
	}catch(e){
		console.log(e);
		return res.json(e);
		res.error('An error has occured');
	}
});

router.get('/views/:view_id', async function(req, res){
	try{
		var views = await res.DB.query('MATCH (a:Account {username: $username})-[:VIEWS*]->(n:View {id: $view_id}), p=(n)-[:VIEWS*0..]->(:View) WITH collect(p) as children CALL apoc.convert.toTreeClean(children) yield value RETURN value as views', {username: req.MV.Account.username, view_id: res.DB.Integer(req.params.view_id)});

		if (views[0] == null){
			res.json({});
		}else{
			res.json(views[0].toObject().views);
		}
	}catch(e){
		console.log(e);
		return res.json(e);
		res.error('An error has occured');
	}
});

router.post('/view/', async function(req, res){
	var view = Utils.whitelistCopy(req.body, req.MV.View.properties);
	view.id = await res.DB.generateId('view');

	if (view.parent != null) {
		try{
			console.log({username: req.MV.Account.username, id: view.parent});
			var result = await res.DB.query('MATCH (a:Account {username: $username})-[:VIEWS*1..10]->(v:View {id: $id}) RETURN v LIMIT 1', {username: req.MV.Account.username, id: res.DB.Integer(view.parent)});
			if (result.length) {
				var parent_id = res.DB.Integer(view.parent);
				console.log('Parent Id', parent_id);
				delete view.parent;
				var r = await res.DB.query('MATCH (v:View {id: $id}) CREATE (v)-[:VIEWS]->(view:View $view) RETURN v, view', {id: parent_id, view:view});
				console.log(r);
				res.json(r);
			}else{
				res.error('Invalid parent id');
			}
		}catch(e){
			console.log(e);
		}
	}else if(view.name != null){
		var result = await res.DB.query('MATCH (a:Account {username: $username}) CREATE (a)-[:VIEWS]->(view:View $view) RETURN view', {username: req.MV.Account.username, view:view});
		console.log(result[0].toObject());
		res.json(result[0].toObject().view.properties);
	}else{
		res.error('A new view must have either a name or a parent');
	}
});

router.patch('/view/:view_id', async function(req, res){
	var view = Utils.whitelistCopy(req.body, req.MV.View.properties);
	var result = await res.DB.query('MATCH (a:Account {username: $username})-[:VIEWS*1..10]->(v:View {id: $id}) RETURN v LIMIT 1', {username: req.MV.Account.username, id: res.DB.Integer(req.params.view_id)});
	if (!result.length) {
		return res.error('Invalid view id');
	}
	delete view.id;
	var result = await res.DB.query('MATCH (v:View {id: $id}) SET v += $view RETURN v', {id: res.DB.Integer(req.params.view_id), view: view});
	return res.json(result[0].toObject().v.properties);
});

router.delete('/view/:view_id/parent/:parent_id', async function(req, res){
	var id = res.DB.Integer(req.params.view_id);
	var parent_id = res.DB.Integer(req.params.parent_id);
	
	var result = await res.DB.query('MATCH (a:Account {username: $username})-[:VIEWS*1..10]->(p:View {id: $parent_id})-[l:VIEWS]->(c:View {id: $id}) DELETE l RETURN c LIMIT 1', {username: req.MV.Account.username, id: id, parent_id: parent_id});
	if (!result.length) {
		return res.error('Invalid view id');
	}
	
	return res.json(result[0].toObject().c.properties);
});

router.delete('/view/:view_id', async function(req, res){
	var id = res.DB.Integer(req.params.view_id);
	
	var result = await res.DB.query('MATCH (a:Account {username: $username})-[l:VIEWS]->(n:View {id: $id}) DELETE l, n', {username: req.MV.Account.username, id: id});
	
	// if (!result.length) {
	// 	return res.error('Invalid view id');
	// }
	
	return res.json({success: true});
});