var host = "bolt://localhost:7687";
var username = "neo4j";
var password =  "iaj76sem6E";

var params = {};

var neo4j = require('neo4j-driver').v1;
var DBDriver = neo4j.driver(host, neo4j.auth.basic(username, password), params);

var Models = new (require('./main'))(DBDriver.session());

Models.Data.getChildren([{identifier:'Insurance'}], function(err, data){

	console.log('err:', err);
	console.log('data:', data);

});