# API Routes

## Route Structure
|||||||
|---|---|---|---|---|---|
|/|
||/account|||POST|
|||/login||GET|Reqired parameters: username, password
|||/\<username>|
||||/views|
|||||/\<view_id>|
||||/view|
|||||/\<view_id>|
||/data|

# Route Details
## /

## /account
### POST
Creates an account
## /account/login
***
### POST
_Required parameters: username, password_  
Authenticates supplied credentials  
On success returns {"username": \<username>} and sets a cookie 'auth' which is required for certain routes


## /account/\<username>
***
xxx  

## /account/\<username>/views
***
### GET
Reqires auth cookie
On success returns a nested JSON object describing the user's view heirarchy  

## /account/\<username>/views/\<view_id>
***
### GET
Reqires auth cookie
On success returns a nested JSON object describing the view heirarchy starting with a particular view as the root of the tree.  

## /account/\<username>/view
***
### POST
Reqires auth cookie
On success creates a new view. New views must have either a name or a parent_id
Named views are roots of view heirarchies
Views with a parent_id set become children of that view 

## /account/\<username>/view/\<view_id>
***
### PATCH
Reqires auth cookie
On success updates a view by changing properties set in the request body
### DELETE
Reqires auth cookie
On success deletes a view, disconnecting it from all its parents.

## /account/\<username>/view/\<view_id>/parent/\<parent_id>
***
### DELETE
Reqires auth cookie
On success deletes the link between a view and its parent. This allows an account to manage how different views are arranged
