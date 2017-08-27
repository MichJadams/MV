const Account = require('models/account');
const View = require('models/view');
const Data = require('models/data');
const MVAuth = require('MVAuth');

module.exports = function(req, res, next){
	var app = res.app;

	app.use(MVAuth());

	app.param('username', async function(req, res, next, username){
		req.MV.Account = await Account(res.DB, username);
		if (!req.MV.Account) {
			return res.error('Error loading Account');
		}
		req.MV.View = await View(res.DB, username);
		if (!req.MV.View) {
			return res.error('Error loading View');
		}
		next();
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
