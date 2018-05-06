async function getData(data_address){
	var data = await API.get(ENV.API_ROOT+'/data/'+data_address);
	if (data.error){
		return console.error('data fetch failed!');
	}
	return data;
}

async function getDataBlob(data_addresses){

	var pattern = {};

	for(var strand of data_addresses){
		var segments = strand.split('.');
		if (segments.length == 0) {
			continue;
		}
		if (segments.length >= 1) {
			if (pattern[segments[0]] == null) {
				pattern[segments[0]] = {};
			}
			pattern[segments[0]][''] = true;
		}
		if (segments.length >= 2) {
			pattern[segments[0]][segments[1]] = true;
		}
	}

	var ret = {};

	for(var strand in pattern){
		var data = await API.get(ENV.API_ROOT+'/data/'+strand);
		if (data.error) {
			console.error('failed to fetch', strand);
			continue;
		}

		for(var appendage in pattern[strand]){
			if (appendage == '') {
				ret[strand] = data;
			}else{
				ret[strand+'.'+appendage] = data[appendage];
			}
		}
	}

	return ret;
}