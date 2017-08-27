async function menuView(tab, view_stack, data_path){
	var view = view_stack[view_stack.length-1];
	if (!view.layout) {
		console.error('missing view layout');
		return document.createTextNode('missing view layout');
	}
	var child_data_path = data_path + (view.data?view.data:'');
	var layout = JSON.parse(view.layout);

	var t = document.createElement('div');
	
	t.style.position = 'relative';
	t.style.display = 'inline-flex';
	t.style.height = '100%';
	t.style.width = '100%';


	var menu = t.appendChild(document.createElement('div'));
	menu.style.paddingRight = '40px';
	var view_node = t.appendChild(document.createElement('div'));
	view_node.style.flexGrow = '1';

	for (var i = 0; i < layout.menu_items.length; i++) {
		var item = menu.appendChild(document.createElement('div'));
		var menu_item = layout.menu_items[i];
		item.innerHTML = menu_item.name;
		item.menu = menu_item;
		item.view = view;

		item.onclick = function(e){
			var item = e.target;
			while (view_node.firstChild) {
				view_node.removeChild(view_node.firstChild);
			}
			renderView(tab, view_node, view_stack.concat([view.views[0]]), child_data_path+item.menu.data);
		}
		
	}
	
	renderView(tab, view_node, view_stack.concat([view.views[0]]), child_data_path+JSON.parse(view.layout).menu_items[0].data);

	return t;	
};
async function menuSettings(view){
	console.log(view);
	var layout = JSON.parse(view.layout || '{menu_items:[]}').menu_items;
	
	var menu_length = 10;
	var prompts = [];
	for (var i = 0; i < menu_length; i++) {

		if (layout[i] == null) {
			layout[i] = {name:'', data:''};
		}

		prompts.push({type:'text', value:layout[i].name, name:'name:'+i});
		prompts.push({type:'text', value:layout[i].data, name:'data:'+i});
		
		prompts.push('br');
	}
	var ret = await Prompt('Configure Menu', prompts);
	if(ret == null){
		return false;
	}
	var update = {layout:{menu_items:[]}};

	for (var i = 0; i < menu_length; i++) {
		update.layout.menu_items[i] = {name: ret['name:'+i], data: ret['data:'+i]};
	}

	update.layout = JSON.stringify(update.layout);

	var response = await MV.View.update(view.id, update);
	if (response.error) {
		return false;
	}
	return true;
}