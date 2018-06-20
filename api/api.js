process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();
require('dotenv').config();


console.log('----------------------------------');

var neo4j = require('neo4j-driver').v1;
var DBDriver = neo4j.driver(process.env.DB_HOST, neo4j.auth.basic(process.env.DB_USER, process.env.DB_PASS), {maxTransactionRetryTime: 30000});

const Express = require('express');
const app = Express();

// Global error catch
app.use(function(err, req, res, next){
	res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//CORS nonsense
app.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", process.env.CORS_DOMAIN);
  	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  	res.header("Access-Control-Allow-Credentials", "true");
  	res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, PATCH, DELETE, OPTIONS');

  	if (req.method == 'OPTIONS') {
  		res.sendStatus(200);
  	}else{
  		next();
  	}
});

app.use(require('cookie-parser')());
app.use(require('./HMAC'));

// Init Request
var MV = require('./models/mv')(DBDriver.session());

app.use(function(req, res, next){
	req.MV = MV;

	let d = ''
	req.on('data', function(chunk){
		d += chunk;
	});
	req.on('end', function(){
		try{
			req.body = JSON.parse(d);
		}catch(e){
			req.body = {};
		}
		next();
	});
});

// Init Response
app.use(function(req, res, next){
  	res.error = function(message, status){
  		status = status || 400;
		res.status(status).json({error:message});
	};	
	next();
});

app.use('/', require('routes/index.js'));

app.listen(1930, function (){
  console.log('Express listening on port 1930');
});