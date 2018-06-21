# API Routes

## [Account](./routes/account.md)
||||
|---|---|---|
|/account                 |POST  |Creates an account|
|/account/login           |GET   |Authenticates a user, and sets the auth cookie|
|/account/username        |GET   |Returns details about a user's account|

## [Views](./routes/views.md)
||||
|---|---|---|
|/views                   |GET   |Returns all of a user's views|
|/views?root=\<root>      |GET   |Returns view \<root> and all its children|
|/view                    |GET   |Returns one view only|
|/view                    |POST  |Create or overwrite a view completely|
|/view?action=\<action>   |POST  |\<action> is one of [hook\|unhook]|
|/view                    |PATCH |Updates a view, only changing the properties in the body|
