const express = require('express');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const siteEnv = dotenv.parse(fs.readFileSync(path.join(__dirname, '..', '.env.site')));

module.exports = function(req, res, next){
	var app = res.app;

	app.get('/scripts/env.js', function(req, res){
		res.send('ENV = '+JSON.stringify(siteEnv)+';');
	});
	app.use('/scripts', express.static( path.join(__dirname, 'scripts')));
	app.use('/assets', express.static( path.join(__dirname, 'assets')));

	app.use('/login', require('./login.js'));

	app.use('/register', require('./register.js'));

	app.use('/settings', function(req, res){
		res.json('settings!');
	});

	app.use(require('./main.js'));

	next();
}