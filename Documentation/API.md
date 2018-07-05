# API Routes

## [Account](./routes/account.md)
||||
|---|---|---|
|/account                 |POST  |Creates an account|
|/account/username        |GET   |Returns details about a user's account|
|/account/username/login           |GET   |Authenticates a user, and sets the auth cookie|

## [Views](./routes/views.md)
All Views are underneath /account/username/
||||
|---|---|---|
|/view                   |GET   |Returns all of a user's views|
|/view?root=\<root>      |GET   |Returns view \<root> and all its children|
|/view                    |POST  |Create a view|
|/view/<view_id>                    |GET   |Returns one view only|
|/view/<view_id>?action=\<action>   |POST  |\<action> is one of [hook\|unhook]|
|/view/<view_id>                    |PATCH |Updates a view, only changing the properties in the body|
