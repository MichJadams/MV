process.env.NODE_PATH = __dirname;
require('module').Module._initPaths();
require('dotenv').config();


console.log('----------------------------------');

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

app.use(require('cookie-parser')());

// Init Resquest
app.use(function(req, res, next){
	req.MV = {};
	var d = ''
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

// Init Response
app.use(function(req, res, next){

  	res.DB = require('DB')();
  	res.models = {};
  	res.error = function(message, status){
  		status = status || 400;
		res.status(status).json({error:message});
	};

  	res.on('finish', function(){
		res.DB.close();
	});
	
	next();
});

app.use('/', require('routes/index.js'));
app.listen(1930, function (){
  console.log('Express listening');
});