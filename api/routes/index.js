module.exports = function(req, res, next){
	var app = res.app;



	app.post('/account/', require('./account').create);
	app.get('/account/login', require('./account').login);

	

	app.param('username', function(req, res, next, username){
		res.Models.Account.get(username, function(err, user){
			if (err) {
				res.error(err);
			} else {
				if (!user) {
					res.error('No such user', 404);
				} else {
					req.MV.account = user;
					next();	
				}
			}
		});
	});
	app.use('/account/:username/', require('./account'));
	

	app.use('/data/', async function(req, res, next){
		req.MV.Data = await Data(res.DB);
		if (!req.MV.Data) {
			return res.error('Error loading Data');
		}
		next();
	});
	app.use('/data/', require('./data'));

	next();
}
