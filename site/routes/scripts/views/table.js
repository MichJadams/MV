async function tableView(view, data_path){

	var chart = document.createElement('div');
	if (!view.layout) {
		console.error('missing view layout');
		return document.createTextNode('missing view layout');
	}
	var layout = JSON.parse(view.layout || '[]');

	var dataBlob = [];
	for(var row of layout){
		for(var cell of row){
			if (cell.data[0] == '/' || cell.data[0] == '.') {
				dataBlob.push(data_path+cell.data);
			}
		}
	}
	var data = await getDataBlob(dataBlob);

	var t = document.createElement('table');
	for(var row of layout){
		var r = document.createElement('tr');
		for(var cell of row){
			var c = document.createElement('td');

			if (cell.data[0] == '/' || cell.data[0] == '.') {
				if (typeof data[cell.data] == 'object') {
					c.innerHTML = JSON.stringify(data[data_path+cell.data]);
				}
				c.innerHTML = data[data_path+cell.data];
			}else{
				c.innerHTML = cell.data;
			}
			

			r.appendChild(c);
		}
		t.appendChild(r);
	}

	return t;
};
async function tableSettings(view){
	var layout = JSON.parse(view.layout || '[]');
	
	var table_width = 6;
	var table_height = 10;
	var prompts = [{type:'text', value:view.data, name:'data'}, 'br'];
	for (var i = 0; i < table_height; i++) {
		var row;
		if(i >= layout.length){
			row = [];
		}else{
			row = layout[i];
		}
		for (var j = 0; j < table_width; j++) {
			var cell;
			if (j >= row.length) {
				cell = '';
			}else{
				cell = row[j];
			}
			prompts.push({type:'text', value:cell.data, name:i+':'+j});
		}
		prompts.push('br');
	}
	var ret = await Prompt('Configure Table', prompts);
	if(ret == null){
		return false;
	}
	var update = {data: ret.data, layout:[]};

	for (var i = 0; i < table_height; i++) {
		var row = update.layout[i] = [];
		for (var j = 0; j < table_width; j++) {
			row[j] = {data: ret[i+':'+j]};
			//console.log();
		}
	}

	update.layout = JSON.stringify(update.layout);

	var response = await MV.View.update(view.id, update);
	if (response.error) {
		return false;
	}
	return true;
}