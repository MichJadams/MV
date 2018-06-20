# Account



## /account POST
Creates an account.  
Accounts must have a username, password, and display_name.  
The username will be converted to lowercase and unique, the display name will be case sensitive

## /account/login GET
_Required parameters: username, password_  
Authenticates a user, and sets the auth cookie  
On success returns {"username": \<username>} and sets a cookie 'auth' which is required for most routes

## /account/username GET
Returns details about a user's account