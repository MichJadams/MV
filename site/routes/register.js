
const Response = require('basic_response.js');

module.exports = function(req, res){
	var response = Response();

	response.addCss('assets/registration.css');

	response.addJs('scripts/env.js');
	response.addJs('scripts/classes/API.js');
	response.addJs('scripts/pages/registration.js');
	response.addBody(`
		<div id="registration-panel">
			<h2>Create Account</h2>
			<table id="registration-center">
				<tr><td>Username</td><td><input id="username"></input><td></tr>
				<tr><td>Password</td><td><input id="password" type="password"></input><td></tr>
				<tr><td colspan=2><button onclick="register()">Create Account</button><td></tr>
			</table>
			<br>
			<p id="error"></p>
		</div>
	`);


	res.send(response.toString());
}