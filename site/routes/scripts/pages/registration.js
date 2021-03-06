async function register(){
	var username = document.getElementById('username').value;
	var password = document.getElementById('password').value;

	var error = document.getElementById('error');

	if (!username || !password) {
		error.innerHTML = 'Both username and password are required!';
		return;
	}


	

	var result = await API.post(ENV.API_ROOT+'/account/'+username+'/?password='+password);
	if (!result.error) {
		localStorage.setItem('username', result.username);
		location.href = '/';
	}
}