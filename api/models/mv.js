module.exports = function(session){return {
	Account: new (require('./account.js'))(session),
	View: new (require('./view.js'))(session),
	close: function(){
		session.close();
	}
}};