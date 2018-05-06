var MV = {};
if (localStorage.getItem('username') != null) {
	MV.username = localStorage.getItem('username');
}else{
	location.href = '/login';
}

API.setOption('onError', function(data){
	if (data.error == 'Not Authorized!') {
		location.href = '/login';
	}
});