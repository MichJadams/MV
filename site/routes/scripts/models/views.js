MV.View = {};

MV.View.all = async function(){
	return API.get(ENV.API_ROOT+'/account/'+MV.username+'/views');
}

MV.View.fetch = async function(id){
	id = new Integer(id).toString();
	return API.get(ENV.API_ROOT+'/account/'+MV.username+'/views/'+id);
}

MV.View.create = async function(reference, properties){
	var body = properties || {};
	if (reference == null) {
		return;
	}else if (typeof reference == 'string') {
		body.name = reference;
	}else{
		body.parent = new Integer(reference);
	}

	body = JSON.stringify(body);
	var data = await API.post(ENV.API_ROOT+'/account/'+MV.username+'/view/', body);

	console.log(data);
	if (data.error){
		return console.error('data fetch failed!');
	}
	return data;
}

MV.View.update = async function(id, properties){
	id = new Integer(id).toString();
	body = JSON.stringify(properties);
	var data = await API.patch(ENV.API_ROOT+'/account/'+MV.username+'/view/'+id, body);

	console.log(data);
	if (data.error){
		return console.error('data fetch failed!');
	}
	return data;
}

MV.View.unhook = async function(id, parent){
	id = new Integer(id).toString();
	parent = new Integer(parent).toString();

	var data = await API.delete(ENV.API_ROOT+'/account/'+MV.username+'/view/'+id+'/parent/'+parent);

	console.log(data);
	if (data.error){
		return console.error('data fetch failed!');
	}
	return data;
}

MV.View.delete = async function(id){
	id = new Integer(id).toString();

	var data = await API.delete(ENV.API_ROOT+'/account/'+MV.username+'/view/'+id);

	console.log(data);
	if (data.error){
		return console.error('data fetch failed!');
	}
	return data;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////

MV.View.split = async function(view, orientation){
	var child_settings = Object.assign({}, view);
	delete child_settings.name;
	delete child_settings.data;
	var new_child = await MV.View.create(view.id, child_settings);
	
	var child_sibling = await MV.View.create(view.id, {type:'text', text:'Configure this view ---->'});
	
	await MV.View.update(view.id, {type: orientation});
}