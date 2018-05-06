Prompt = async function(title, queries){
	return new Promise(function(resolve, reject){
		var data = {};
		var overlay = document.createElement('div');
		overlay.className = 'overlay';
		overlay.onclick = function(e){
			overlay.parentNode.removeChild(overlay);
			resolve(null);
		};

		var panel = overlay.appendChild(document.createElement('div'));
		panel.className = 'panel';
		panel.onclick = function(e){e.stopPropagation()};

		var title_node = panel.appendChild(document.createElement('h2'));
		title_node.innerHTML = title;

		for(var query of queries){
			if (query == null) {
				continue;
			}
			if (query === 'br') {
				panel.appendChild(document.createElement('br'));
				continue;
			}
			if (query === 'hr') {
				panel.appendChild(document.createElement('hr'));
				continue;
			}
			if (typeof query == 'string') {
				query = {name: query, type: 'text'};
			}

			

			switch(query.type){
				case 'string':
					var str = panel.appendChild(document.createElement('div'));
					str.style.textAlign = 'left';
					str.innerHTML = query.value;
					break;
				case 'text':
					if (query.title) {
						var query_title = panel.appendChild(document.createElement('div'));
						query_title.style.textAlign = 'left';
						query_title.innerHTML = query.title;
					}
					var query_input = panel.appendChild(document.createElement('input'));
					query_input.query = query;
					query_input.type = 'text';

					query_input.onchange = function(e){
						var value = e.target.value;
						data[e.target.query.name] = value;
					}
					data[query.name] = '';
					if (query.value != null) {
						query_input.value = query.value;
						data[query.name] = query.value;
					}
					break;
				case 'button':
					var query_input = panel.appendChild(document.createElement('button'));
					query_input.innerHTML = query.title || query.name;
					query_input.query = query;
					query_input.onclick = async function(e){
						var value = e.target.value;
						if (typeof e.target.query.callback == 'function') {
							var response = await e.target.query.callback(data);

							if(response === 'error'){
								e.target.style.outlineColor = 'red';
								setTimeout(function(){
									e.target.style.outlineColor = null;
								}, 250);
							}else if(response){
								overlay.parentNode.removeChild(overlay);
								resolve(data);
							}else{
								resolve(data);
							}
						}
					}
					break;
			}

			if (query.color) {query_input.style.color = query.color}
			if (query.background_color) {query_input.style.backgroundColor = query.background_color}
		}


		panel.appendChild(document.createElement('br'));
		panel.appendChild(document.createElement('br'));
		var cancel_button = document.createElement('button');
		cancel_button.innerHTML = 'Cancel';
		cancel_button.onclick = function(e){
			overlay.parentNode.removeChild(overlay);
			resolve(null);
		};
		panel.appendChild(cancel_button);

		var ok_button = document.createElement('button');
		ok_button.innerHTML = 'OK';
		ok_button.onclick = function(e){
			overlay.parentNode.removeChild(overlay);
			resolve(data);
		};
		panel.appendChild(ok_button);

		document.body.appendChild(overlay);

	});	
};