
const Response = require('basic_response.js');

module.exports = function(req, res){
	var response = Response();

	response.addCss('assets/login.css');

	response.addJs('scripts/env.js');
	response.addJs('scripts/classes/API.js');
	response.addJs('scripts/pages/login.js');
	response.addBody(`
		<div id="login-panel">
			<h2>MV Login</h2>
			<table id="login-center">
				<tr><td>Username</td><td><input id="username"></input><td></tr>
				<tr><td>Password</td><td><input id="password" type="password"></input><td></tr>
				<tr><td colspan=2><button onclick="login()">Login</button><td></tr>
			</table>
			<br>
			<p id="error"></p>
			<br>
			<a href="/register">Sign Up</a>
		</div>
	`);


	res.send(response.toString());
}