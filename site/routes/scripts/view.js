async function renderView(tab, root, view_stack = [], data_path = ''){
	var view = view_stack[view_stack.length-1];
	var child_data_path = data_path + (view.data?view.data:'');

	switch(view.type){
		case 'splitv':
			if (!view.views || view.views.length == 0) {break;}

			var split = (100/view.views.length)+'%';

			for (var i = 0; i < view.views.length; i++) {
				var view_node = root.appendChild(document.createElement('div'));
				view_node.className = 'split vertical';
				view_node.style.width = split;
				renderView(tab, view_node, view_stack.concat([view.views[i]]), child_data_path);
			}
			return;
		case 'splith':
			if (!view.views || view.views.length == 0) {break;}

			var split = (100/view.views.length)+'%';

			for (var i = 0; i < view.views.length; i++) {
				var view_node = root.appendChild(document.createElement('div'));
				view_node.className = 'split horizontal';
				view_node.style.height = split;
				renderView(tab, view_node, view_stack.concat([view.views[i]]), child_data_path);
			}
			return;
	}

	if (!view.views) {
		root.appendChild(await settingsButton(tab, view_stack));
		root.className += ' data';
	}
	
	
	switch(view.type){
		case 'table':
			root.appendChild(await tableView(view, child_data_path));
			break;
		case 'menu':
			root.appendChild(await menuView(tab, view_stack, child_data_path));
			break;
		case 'json':
			var data = await getData(child_data_path);
			for(var property in data){
				root.appendChild(document.createTextNode(property+': '));
				root.appendChild(document.createTextNode(data[property]));
				root.appendChild(document.createElement('br'));
			}
			break;
		case 'text':
			root.className += ' data';
			root.appendChild(document.createTextNode(view.text));
			break;
		case 'address':
			root.className += ' data';
			root.appendChild(document.createTextNode(child_data_path));
			break;
		default:
			if (view.views) {
				root.appendChild(await settingsButton(tab, view_stack));
				root.className += ' data';
			}
			root.appendChild(document.createTextNode('View has invalid type.'));
			break;
	}

}


async function settingsButton(tab, stack){
	var settings = document.createElement('div');
	settings.innerHTML = '=+=';
	settings.style.float = 'right';

	var resolved_path = '';
	var actions = [];
	for (var i = 0; i < stack.length; i++) {
		var view = stack[i];
		resolved_path += stack[i].data?stack[i].data:'';
		var child_actions = [
			'hr',
			stack[i].name?{type: 'string', value: 'Name: '+stack[i].name}:null,
			{type: 'string', value: 'Type: '+stack[i].type},
			{type: 'string', value: 'Data Path: '+resolved_path},
			{title: 'Edit', type: 'button', callback: (function(i){return async function(data){
				var result = await editViewStack(stack.slice(0, i+1));
				if(!result){
					return false;
				}
				if(result.reload){
					console.log('reloading');
					tab.reload();
				}
				if (result.delete) {
					tab.remove();
				}
				return true;
			}})(i)}
		];

		if (stack[i].type != null && stack[i].type != 'splitv' && stack[i].type != 'splith') {
			child_actions.push({
				title: 'Configure',
				type: 'button',
				callback: (function(i){return async function(data){
					var view = stack[i];
					var status;
					switch(stack[i].type){
						case 'table':
							status = tableSettings(view);
							break;
						case 'menu':
							status = menuSettings(view);
							break;
					}
					if (await status) {
						tab.reload();
						return true;
					}else{
						return false;
					}
				}})(i)
			});
		}
		actions = actions.concat(child_actions);
	}




	settings.onclick = async function(e){
		var s = await Prompt('What to do?', actions);
	};
	return settings;
}

async function editViewStack(stack){
	var view = stack[stack.length-1];
	console.log(view);
	var prompts = [
		{
			title: 'Name',
			type: 'text',
			name: 'name',
			value: view.name
		},
		{
			title: 'Data',
			type: 'text',
			name: 'data',
			value: view.data
		},
		{
			title: 'Type',
			type: 'text',
			name: 'type',
			value: view.type
		},
		'br',
		{
			title: (view.type=='splith')?'Add Child':((view.type == 'splitv')?'Rotate':'Split Horizontally'),
			type: 'button',
			callback: (async function(data){
				if (view.type == 'splith') {
					var new_child = await MV.View.create(view.id, {type:'text', text:'Configure this view ---->'});
				}else if(view.type == 'splitv'){
					await MV.View.update(view.id, {type:'splith'});
				}else{
					await MV.View.split(view, 'splith');
				}
				data.reload = true;
				return true;
			})
		},
		{
			title: (view.type=='splitv')?'Add Child':((view.type == 'splith')?'Rotate':'Split Vertically'),
			type: 'button',
			callback: (async function(data){
				if (view.type == 'splitv') {
					var new_child = await MV.View.create(view.id, {type:'text', text:'Configure this view ---->'});
				}else if(view.type == 'splith'){
					await MV.View.update(view.id, {type:'splitv'});
				}else{
					await MV.View.split(view, 'splitv');
				}
				data.reload = true;
				return true;
			})
		},
		'br',
		{
			title: 'Delete',
			type: 'button',
			callback: async function(data){
				var i = stack.length-1;
				console.log(stack);
				if (i == 0) {
					console.log('deleted', stack[i].id);
					await MV.View.delete(stack[i].id);
					data.delete = true;
				}else{
					console.log('unhooked');
					await MV.View.unhook(stack[i].id, stack[i-1].id);
					data.reload = true;
				}
				return true;
			}
		}
	];
	var settings = await Prompt('Edit', prompts);

	if (settings && !(settings.delete || settings.reload)) {
		var updates = {};
		updates.name = settings.name;
		updates.data = settings.data;
		updates.type = settings.type;
		await MV.View.update(view.id, updates);
		settings.reload = true;
	}

	return settings;
}
