
const Response = require('basic_response.js');

module.exports = function(req, res){
	var response = Response();

	response.addJs('scripts/env.js');

	response.addCss('assets/main.css');
	
	response.addJs('scripts/classes/API.js');
	response.addJs('scripts/auth.js');
	
	response.addJs('scripts/classes/Prompt.js');
	response.addJs('scripts/classes/Integer.js');
	

	response.addJs('scripts/models/views.js');
	response.addJs('scripts/models/data.js');

	response.addJs('scripts/view.js');

	response.addJs('scripts/views/table.js');
	response.addJs('scripts/views/menu.js');

	response.addJs('scripts/pages/main.js');
	response.setOnLoad('render()');
	response.addBody(`
		<div id="tabbar">
			<div id="logo">MV</div>
			<div id="tab-container"></div>
			<div id="settings">Settings</div>
		</div>
		<div id="view-root"></div>
	`);


	res.send(response.toString());
}