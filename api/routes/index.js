module.exports = function(req, res, next){
	var app = res.app;

	app.use('/account', require('./account'));
	
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
