# Account



## /account POST
Creates an account

## /account/login GET
_Required parameters: username, password_  
Authenticates a user, and sets the auth cookie  
On success returns {"username": \<username>} and sets a cookie 'auth' which is required for most routes

## /account/username GET
Returns details about a user's account