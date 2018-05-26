# Views

- Views must have either a name or a parent. They may have both.
- Views with no parents must be rooted to the account.
- A view must have a type


### /views GET
Returns all of a user's views

### /views?root=\<root> GET
Returns view \<root> and all its children

### /view GET
Returns one view only

### /view POST
Create or overwrite a view completely

### /view POST
Create or overwrite a view completely

### /view?action=\<action> POST
\<action> is one of [hook\|unhook]

### /view PATCH
Updates a view, only changing the properties in the body