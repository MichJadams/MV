
// var host = "bolt://localhost:7687";
// var username = "neo4j";
// var password =  "iaj76sem6E";

// var params = {};

// var neo4j = require('neo4j-driver').v1;
// var DBDriver = neo4j.driver(host, neo4j.auth.basic(username, password), params);

// var session = DBDriver.session();

module.exports = function(session){return {
	Account: new (require('./account.js'))(session),
	View: new (require('./view.js'))(session),
	close: function(){
		session.close();
	}
}};